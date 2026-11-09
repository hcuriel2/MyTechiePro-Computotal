const assert=require('assert'),{fork}=require('child_process'),crypto=require('crypto');
const {MongoMemoryServer}=require(process.env.DISPOSABLE_MONGO_HELPER);
const mongoose=require('mongoose'),bcrypt=require('bcryptjs'),speakeasy=require('speakeasy');
const User=require('../dist/models/user/user.model').default;
let db,workers=[],clock=Date.now(),user,groups=0;
const pass='SyntheticPass1!',nextPass='SyntheticPass2!';
const secret=speakeasy.generateSecret({length:20}).base32;
const otp=()=>speakeasy.totp({secret,encoding:'base32',time:Math.floor(clock/1000)});
async function advance(){clock+=30000;await Promise.all(workers.map(w=>new Promise(resolve=>{w.child.once('message',resolve);w.child.send({clock});})));return otp();}
async function call(index,url,body,cookie){const r=await fetch(`http://127.0.0.1:${workers[index].port}/api${url}`,{method:'POST',headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)});return{status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie'),retry:r.headers.get('retry-after')};}
const login=(i=0,code=otp(),password=pass)=>call(i,'/auth/login',{email:user.email,password,secret:code});
const stored=()=>User.findById(user._id).select('+mfaSecurity +passwordResetTokenHash');
async function check(name,fn){await User.deleteMany({});user=await User.create({firstName:'Synthetic',lastName:'Security',phoneNumber:'6045550123',email:'security@example.com',userType:'Client',verified:true,secret,password:await bcrypt.hash(pass,4)});await advance();await fn();groups++;console.log('PASS '+name);}
(async()=>{try{
 db=await MongoMemoryServer.create({binary:{version:'7.0.14'},instance:{ip:'127.0.0.1',dbName:'mytechie_disposable_security'}});
 await mongoose.connect(db.getUri('mytechie_disposable_security'),{useNewUrlParser:true,useUnifiedTopology:true,useFindAndModify:false});await User.init();
 for(let i=0;i<2;i++){const child=fork(require.resolve('./mfa-security-worker.cjs'),[],{env:{...process.env,MFA_TEST_URI:db.getUri('mytechie_disposable_security')},windowsHide:true,stdio:['ignore','ignore','pipe','ipc']});child.stderr.on('data',data=>process.stderr.write(data));const ready=await new Promise((resolve,reject)=>{child.once('message',resolve);child.once('error',reject);child.once('exit',code=>reject(Error('Worker exited '+code)));});workers.push({...ready,child});}
 assert.notEqual(workers[0].pid,workers[1].pid);console.log('Two independent API processes share disposable MongoDB 7.0.14');
 await check('successful login, cross-instance replay rejection and fresh-code login',async()=>{const r=await login();assert.equal(r.status,200);assert(r.cookie);assert(!r.body.mfaSecurity);const replay=await login(1);assert.equal(replay.status,401);assert(!replay.cookie);await advance();assert((await login(1)).cookie);});
 await check('20 simultaneous same-code requests have exactly one session winner',async()=>{const rs=await Promise.all(Array.from({length:20},(_,i)=>login(i%2)));assert.equal(rs.filter(r=>r.cookie).length,1);assert(rs.every(r=>[200,401,429].includes(r.status)));assert((await stored()).get('mfaSecurity').count<=10);});
 await check('invalid attempts accumulate across instances, lock and reject even a valid code',async()=>{for(let i=0;i<4;i++)assert.equal((await login(i%2,'bad')).status,401);const r=await login(0,'bad');assert.equal(r.status,429);assert(Number(r.retry)>=29&&Number(r.retry)<=31);const locked=await login(1);assert.equal(locked.status,429);assert(!locked.cookie);});
 await check('exponential backoff persists and caps at fifteen minutes',async()=>{for(let i=0;i<10;i++){await User.collection.updateOne({_id:user._id},{$set:{'mfaSecurity.blockedUntil':new Date(0),'mfaSecurity.windowEnd':new Date(0)}});const before=Date.now();await login(i%2,'bad');const s=(await stored()).get('mfaSecurity');if(i>=4){const duration=s.blockedUntil.getTime()-before;const expected=Math.min(900000,30000*2**(i-4));assert(duration>=expected-1000&&duration<expected+3000);}}});
 await check('concurrent invalid attempts cannot overspend the shared budget',async()=>{const rs=await Promise.all(Array.from({length:40},(_,i)=>login(i%2,'bad')));assert(rs.every(r=>[401,429].includes(r.status)&&!r.cookie));const s=(await stored()).get('mfaSecurity');assert(s.count<=10);assert(s.failures<=10&&s.failures>=5);});
 await check('successful logins do not erase the burst limit; window rollover permits login',async()=>{for(let i=0;i<10;i++){await advance();assert((await login(i%2)).cookie);}await advance();assert.equal((await login()).status,429);await User.collection.updateOne({_id:user._id},{$set:{'mfaSecurity.windowEnd':new Date(0)}});assert((await login(1)).cookie);});
 await check('lock expiry allows a fresh code and clears consecutive failures',async()=>{for(let i=0;i<5;i++)await login(i%2,'bad');await User.collection.updateOne({_id:user._id},{$set:{'mfaSecurity.blockedUntil':new Date(0)}});await advance();assert((await login(1)).cookie);assert.equal((await stored()).get('mfaSecurity').failures,0);});
 await check('password recovery preserves replay state, active factor and lockout',async()=>{assert((await login()).cookie);const used=otp();for(let i=0;i<5;i++)await login(i%2,'bad');const before=(await stored()).get('mfaSecurity');const token=crypto.randomBytes(32).toString('hex');await User.collection.updateOne({_id:user._id},{$set:{passwordResetTokenHash:crypto.createHash('sha256').update(token).digest('hex'),passwordResetExpiresAt:new Date(Date.now()+60000)}});
 const r=await fetch(`http://127.0.0.1:${workers[0].port}/api/users/reset/${user._id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,password:nextPass,confirmPassword:nextPass})});assert.equal(r.status,200);assert(!r.headers.get('set-cookie'));const after=await stored();assert.equal(after.secret,secret);assert.deepEqual(after.get('mfaSecurity'),before);assert.equal((await login(1,used,nextPass)).status,429);await User.collection.updateOne({_id:user._id},{$set:{'mfaSecurity.blockedUntil':new Date(0)}});assert.equal((await login(1,used,nextPass)).status,429); // replay failure escalates the preserved failure streak
 await User.collection.updateOne({_id:user._id},{$set:{'mfaSecurity.blockedUntil':new Date(0),'mfaSecurity.windowEnd':new Date(0)}});await advance();assert((await login(1,otp(),nextPass)).cookie);
 });
 await check('a code consumed by login cannot authorize factor changes',async()=>{const session=await login();const r=await call(1,'/auth/mfa/disable',{currentPassword:pass,currentToken:otp()},session.cookie.split(';')[0]);assert.equal(r.status,401);assert((await stored()).secret);await advance();assert.equal((await call(1,'/auth/mfa/disable',{currentPassword:pass,currentToken:otp()},session.cookie.split(';')[0])).status,200);});
 await check('enrollment confirmation consumes the new factor code',async()=>{
 await User.collection.updateOne({_id:user._id},{$unset:{secret:1}});
 const session=await login(0,undefined);const cookie=session.cookie.split(';')[0];
 const setup=await call(0,'/auth/mfa/setup',{currentPassword:pass},cookie);assert.equal(setup.status,200);
 const code=speakeasy.totp({secret:setup.body.secret,encoding:'base32',time:Math.floor(clock/1000)});
 assert.equal((await call(1,'/auth/mfa/confirm',{currentPassword:pass,token:code},cookie)).status,200);
 assert.equal((await login(0,code)).status,401);
 await advance();const fresh=speakeasy.totp({secret:setup.body.secret,encoding:'base32',time:Math.floor(clock/1000)});assert((await login(1,fresh)).cookie);
 });
 await check('database outage fails closed without issuing a session',async()=>{await db.stop();db=null;const r=await login();assert.equal(r.status,503);assert(!r.cookie);});
 console.log(`${groups} distributed MFA security groups passed; no emails sent.`);
}finally{await Promise.all(workers.map(w=>new Promise(resolve=>{w.child.once('exit',resolve);w.child.send({stop:true});})));await mongoose.disconnect();if(db)await db.stop();console.log('Workers and disposable database stopped.');}})().catch(e=>{console.error(e.stack);process.exitCode=1;});
