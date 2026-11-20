// Isolated, local HTTP test of password-change validation, session rotation and MFA proof.
// Database writes are simulated atomically; no production DB, mail or external services.
require('./fetch-node14.cjs');
const assert = require('assert');
const bcrypt = require('bcryptjs');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const { User } = require('./integration-harness.cjs');
const AuthController = require('../dist/controllers/authentication/authentication.controller').default;
const { generateMfaSecret } = require('../dist/controllers/authentication/mfa.util');

const userId = '000000000000000000000025';
const oldPassword = 'OldPassword1!';
const newPassword = 'NewPassword2!';
let account, writes = 0;
const controller = new AuthController();
User.findById = async id => account && String(id) === String(account._id) ? account : null;
// Replace only persistence with in-memory simulation. Real bcrypt, DTO validation,
// auth middleware, TOTP verification, controller and JWT creation all run unchanged.
controller.mfaSecurity.begin = async user => user;
controller.mfaSecurity.reject = async () => { throw Object.assign(new Error('Verification failed.'), {status: 401}); };
controller.mfaSecurity.commit = async (user, step, update) => {
    if (user.secret && (typeof step !== 'number' || step < 0)) return controller.mfaSecurity.reject(user);
    user.password = update.$set.password;
    user.sessionVersion = (user.sessionVersion || 0) + update.$inc.sessionVersion;
    for (const key of Object.keys(update.$unset)) user.set(key, undefined);
    writes++;
    return user;
};
const app = express();
app.use(express.json(), cookieParser());
app.use('/api', controller.router);
app.use((error, _request, response, _next) => response.status(error.status || 500).json({message: error.message}));
function cookie(mfaVerified = false, sessionVersion = account.sessionVersion || 0) {
    return `Authorization=${jwt.sign({_id:userId,userType:account.userType,sessionVersion,mfaVerified},process.env.JWT_SECRET,{expiresIn:'1h'})}`;
}
async function reset(userType='Client', mfa=false) {
    account = new User({_id:userId,firstName:'Test',lastName:'Account',phoneNumber:'1234567890',
        email:'isolated@example.test',userType,password:await bcrypt.hash(oldPassword,4),
        verified:true,sessionVersion:0});
    if (mfa) account.secret = generateMfaSecret();
    account.passwordResetTokenHash = 'token-hash';
    account.passwordResetExpiresAt = new Date(Date.now()+10000);
    account.tempSecret = 'pending';
    writes=0;
}
(async () => {
    const server=app.listen(0,'127.0.0.1');
    await new Promise(resolve=>server.once('listening',resolve));
    const base=`http://127.0.0.1:${server.address().port}/api`;
    async function call(path, body, authCookie) {
        const headers={'Content-Type':'application/json'};
        if (authCookie) headers.Cookie=authCookie;
        const response=await fetch(base+path,{method:body===undefined?'GET':'POST',headers,
            ...(body===undefined?{}:{body:JSON.stringify(body)})});
        return {status:response.status, headers:response.headers, body:JSON.parse(await response.text())};
    }
    const change=(body,authCookie)=>call('/auth/change-password',body,authCookie);
    const payload={currentPassword:oldPassword,newPassword,confirmNewPassword:newPassword};
    let groups=0;
    async function group(label, fn) {await fn();groups++;console.log('PASS '+label);}
    try {
        await group('session required; user id cannot be supplied by caller', async()=>{
            await reset();
            assert.equal((await change(payload)).status,401);
            assert.equal(writes,0);
        });
        await group('old password is required, no changes on bad password',async()=>{
            await reset();
            const result=await change({...payload,currentPassword:'WrongPassword1!'},cookie());
            assert.equal(result.status,401);assert.equal(writes,0);
            assert(await bcrypt.compare(oldPassword,account.password));
        });
        await group('weak, malformed, matching-current and mismatched new passwords rejected',async()=>{
            await reset();
            for (const invalid of [
                {...payload,newPassword:'short',confirmNewPassword:'short'},
                {...payload,newPassword:'alllowercase123!',confirmNewPassword:'alllowercase123!'},
                {...payload,newPassword:'A'.repeat(129),confirmNewPassword:'A'.repeat(129)},
                {...payload,newPassword:12,confirmNewPassword:12},
                {...payload,confirmNewPassword:'Mismatch1!'},
                {...payload,newPassword:oldPassword,confirmNewPassword:oldPassword},
            ]) assert.equal((await change(invalid,cookie())).status,400);
            assert.equal(writes,0);
        });
        await group('success rotates bcrypt credential and session; clears unused recovery/setup tokens',async()=>{
            await reset();
            const oldCookie=cookie();
            const result=await change(payload,oldCookie);
            assert.equal(result.status,200);assert.equal(writes,1);
            assert.deepEqual(Object.keys(result.body),['message']);
            assert.equal(result.headers.get('cache-control'),'no-store');
            assert(await bcrypt.compare(newPassword,account.password));
            assert(!(await bcrypt.compare(oldPassword,account.password)));
            assert.equal(account.sessionVersion,1);
            assert(!account.passwordResetTokenHash&&!account.passwordResetExpiresAt&&!account.tempSecret);
            assert.equal((await call('/auth/checkSession',undefined,oldCookie)).status,401);
            const renewed=result.headers.get('set-cookie').split(';')[0];
            assert.equal((await call('/auth/checkSession',undefined,renewed)).status,200);
            assert.equal(jwt.verify(renewed.slice('Authorization='.length),process.env.JWT_SECRET).sessionVersion,1);
        });
        await group('MFA-enabled account requires verified session and a fresh code',async()=>{
            await reset('Professional',true);
            const token=speakeasy.totp({secret:account.secret,encoding:'base32',step:30,digits:6});
            assert.equal((await change({...payload,currentToken:token},cookie(false))).status,401);
            assert.equal((await change(payload,cookie(true))).status,401);
            assert.equal(writes,0);
            const result=await change({...payload,currentToken:token},cookie(true));
            assert.equal(result.status,200);assert.equal(writes,1);
            assert(account.secret);
            const renewed=result.headers.get('set-cookie').split(';')[0];
            assert.equal(jwt.verify(renewed.slice('Authorization='.length),process.env.JWT_SECRET).mfaVerified,true);
        });
        await group('Admin account can also change its own password',async()=>{
            await reset('Admin');
            assert.equal((await change(payload,cookie())).status,200);
            assert.equal(writes,1);
        });
        console.log(`${groups} isolated password-change HTTP groups passed. Persistent MongoDB concurrency/limits require live disposable-database testing.`);
    } finally {await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});

