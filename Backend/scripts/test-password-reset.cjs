// Isolated recovery regression: production HTTP controllers/service and schema,
// memory-only adapter, captured email. Never starts the normal server or reads .env.
require('./fetch-node14.cjs');
const assert = require('assert'), crypto = require('crypto'), bcrypt = require('bcryptjs');
const {User, state} = require('./integration-harness.cjs');
const express = require('express');
const app = express(); app.use(express.json(), require('cookie-parser')());
const id = '000000000000000000000001', otherId = '000000000000000000000002';
let account, mutations, failStore = false;
User.findByIdAndUpdate = () => {throw Error('Unconditional password write forbidden in this test');};
User.findOneAndUpdate = async (filter, update, options) => {
    assert(!options.upsert, 'No account may be created by recovery');
    if (failStore) throw Error('Mock unavailable');
    if (filter.email) {
        if (!account || filter.email !== account.email) return null;
        assert(filter.$or, 'Request cooldown must be checked by persistence');
        if (account.passwordResetRequestedAt && account.passwordResetRequestedAt > filter.$or[1].passwordResetRequestedAt.$lte) return null;
        Object.assign(account, update.$set); return {...account};
    }
    assert(options.runValidators);
    assert.deepEqual(Object.keys(filter).sort(), ['_id','passwordResetExpiresAt','passwordResetTokenHash'].sort());
    if (!account || filter._id !== account._id || filter.passwordResetTokenHash !== account.passwordResetTokenHash ||
        !(account.passwordResetExpiresAt > filter.passwordResetExpiresAt.$gt)) return null;
    assert(update.$unset.passwordResetTokenHash !== undefined && update.$unset.passwordResetExpiresAt !== undefined);
    // No await between matching and consuming, modelling an atomic adapter operation.
    Object.assign(account, update.$set);
    for (const key of Object.keys(update.$unset)) delete account[key];
    mutations++; return {...account};
};
for (const controller of ['authentication/authentication','user/user']) {
    app.use('/api', new (require('../dist/controllers/'+controller+'.controller').default)().router);
}
app.use((err,_req,res,_next)=>res.status(err.status||500).json({message:err.status ? err.message : 'Internal error'}));
const password = 'NewPassword1!', oldPassword = 'OldPassword1!';
const hash = token => crypto.createHash('sha256').update(token).digest('hex');
async function reset() {
    account = {_id:id,email:'reset@example.com',password:await bcrypt.hash(oldPassword, 4)};
    mutations=0; state.mail.length=0; failStore=false;
}
(async()=>{
    const server=app.listen(0,'127.0.0.1'); await new Promise(r=>server.once('listening',r)); let groups=0;
    async function call(method,path,body){
        const r=await fetch(`http://127.0.0.1:${server.address().port}/api${path}`,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
        return {status:r.status,body:JSON.parse(await r.text()),headers:r.headers};
    }
    const request=email=>call('POST','/auth/resetPassword',{emailAddress:email});
    const consume=(token,accountId=id,extra={})=>call('PUT','/users/reset/'+accountId,{password,confirmPassword:password,token,...extra});
    async function issue(){
        assert.equal((await request('reset@example.com')).status,200);
        const url = new URL(state.mail[state.mail.length-1][2].match(/href="([^"]+)"/)[1]);
        assert.equal(url.origin,'http://127.0.0.1:8183');
        assert.equal(url.search,'');
        return new URLSearchParams(url.hash.slice(1)).get('token');
    }
    async function check(name,fn){await reset();await fn();groups++;console.log('PASS '+name);}
    try {
        await check('recovery request is generic for existing, absent, invalid and missing email',async()=>{
            const existing=await request('reset@example.com');
            for(const email of ['unknown@example.com','invalid',null,undefined,{$ne:null}]) {
                const result=await request(email);assert.equal(result.status,200);assert.deepEqual(result.body,existing.body);
            }
            assert.equal(state.mail.length,1);assert.equal(existing.headers.get('cache-control'),'no-store');
        });
        await check('random credential is hashed in storage, expires in 15 minutes and is hidden by schema',async()=>{
            const before=Date.now(),token=await issue();assert.match(token,/^[a-f0-9]{64}$/);
            assert.equal(account.passwordResetTokenHash,hash(token));assert.notEqual(account.passwordResetTokenHash,token);
            assert(account.passwordResetExpiresAt.getTime()>=before+15*60000);
            assert(account.passwordResetExpiresAt.getTime()<=Date.now()+15*60000);
            for(const name of ['passwordResetTokenHash','passwordResetExpiresAt','passwordResetRequestedAt']) assert.equal(User.schema.path(name).options.select,false);
            assert(await bcrypt.compare(oldPassword,account.password));assert.equal(mutations,0);
        });
        await check('valid recovery updates a bcrypt password and consumes credential without exposing user data',async()=>{
            const token=await issue(),result=await consume(token);assert.equal(result.status,200);
            assert(await bcrypt.compare(password,account.password));assert(!(await bcrypt.compare(oldPassword,account.password)));
            assert(!account.passwordResetTokenHash&&!account.passwordResetExpiresAt);assert.equal(mutations,1);
            assert.deepEqual(Object.keys(result.body),['message']);assert.equal(result.headers.get('cache-control'),'no-store');
        });
        await check('missing and malformed credentials cannot mutate a password',async()=>{
            await issue();for(const token of [undefined,null,'',123,'bad','x'.repeat(64),{$ne:null}]) assert.equal((await consume(token)).status,400);
            assert.equal(mutations,0);assert(await bcrypt.compare(oldPassword,account.password));
        });
        await check('well-formed wrong credential and wrong account are rejected',async()=>{
            const token=await issue();assert.equal((await consume('0'.repeat(64))).status,400);
            assert.equal((await consume(token,otherId)).status,400);assert.equal((await consume(token,'invalid-id')).status,400);assert.equal(mutations,0);
        });
        await check('expired credential is rejected without a password update',async()=>{
            const token=await issue();account.passwordResetExpiresAt=new Date(Date.now()-1);
            assert.equal((await consume(token)).status,400);assert.equal(mutations,0);
        });
        await check('a consumed credential cannot be replayed',async()=>{
            const token=await issue();assert.equal((await consume(token)).status,200);
            const saved=account.password;assert.equal((await consume(token)).status,400);assert.equal(account.password,saved);assert.equal(mutations,1);
        });
        await check('concurrent submissions have one winner in the atomic adapter model',async()=>{
            const token=await issue(),results=await Promise.all([consume(token),consume(token)]);
            assert.deepEqual(results.map(x=>x.status).sort(),[200,400]);assert.equal(mutations,1);
        });
        await check('repeat requests are cooled down and a later request supersedes the prior credential',async()=>{
            const first=await issue();await request('reset@example.com');assert.equal(state.mail.length,1);
            account.passwordResetRequestedAt=new Date(Date.now()-61000);
            const second=await issue();assert.notEqual(first,second);
            assert.equal((await consume(first)).status,400);assert.equal((await consume(second)).status,200);
        });
        await check('weak, oversized, mismatching and non-string passwords fail before persistence',async()=>{
            const token=await issue();
            for(const value of ['short','alllowercase1!', 'A'.repeat(129), 123, null]) assert.equal((await consume(token,id,{password:value,confirmPassword:value})).status,400);
            assert.equal((await consume(token,id,{confirmPassword:'Mismatch1!'})).status,400);assert.equal(mutations,0);
        });
        await check('request normalizes email and unknown account consumes no credential',async()=>{
            assert.equal((await request(' RESET@EXAMPLE.COM ')).status,200);assert.equal(state.mail.length,1);
            const token=await issue();account=null;assert.equal((await consume(token)).status,400);assert.equal(mutations,0);
        });
        await check('storage failure cannot change a password and request response stays generic',async()=>{
            const token=await issue();failStore=true;assert.equal((await request('reset@example.com')).status,200);
            assert.equal((await consume(token)).status,500);assert.equal(mutations,0);assert(await bcrypt.compare(oldPassword,account.password));
        });
        await check('mail failure is not disclosed and does not change the password',async()=>{
            const module=require('../dist/middleware/sendgrid.middleware'),original=module.default;
            module.default=async()=>{throw Error('Mock mail unavailable');};
            try{const result=await request('reset@example.com');assert.equal(result.status,200);assert.equal(mutations,0);}
            finally{module.default=original;}
        });
        console.log(`${groups} isolated password-reset groups passed. No real accounts, database, or outgoing email. Concurrency uses a mock atomic adapter, not MongoDB.`);
    } finally {await new Promise(r=>server.close(r));}
})().catch(err=>{console.error(err.message);process.exitCode=1;});
