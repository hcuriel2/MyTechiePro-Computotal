const assert = require('assert');
const { app, state, User, reset } = require('./business-fields-demo.cjs');
const { validate } = require('class-validator');
const { plainToClass } = require('class-transformer');
const Dto = require('../dist/controllers/user/user.dto').default;
const base = { firstName:'Demo', lastName:'Professional', phoneNumber:'6045550123', email:'demo@example.com', password:'DemoPass1!', userType:'Professional' };
const business = { dba:'  Demo Tech  ', gstNumber:'001234567RT0001', pstNumber:'PST-001234', businessNumber:'001234567', dunsNumber:'001234567' };
(async () => {
 let count=0;
 const check = async (name, fn) => { await fn(); count++; console.log('PASS '+name); };
 await check('DTO rejects all missing professional fields',async()=>{const e=await validate(plainToClass(Dto,base)); for(const n of ['dba','gstNumber','pstNumber']) assert(e.some(x=>x.property===n));});
 for(const n of ['dba','gstNumber','pstNumber']) for(const value of [undefined,null,'','   ',123]) await check(`${n} rejects ${JSON.stringify(value)}`,async()=>assert((await validate(plainToClass(Dto,{...base,...business,[n]:value}))).some(e=>e.property===n)));
 await check('Optional fields may be omitted',async()=>assert.equal((await validate(plainToClass(Dto,{...base,dba:'Demo',gstNumber:'001',pstNumber:'002'}))).length,0));
 for(const n of ['businessNumber','dunsNumber']) await check(`${n} rejects nontext and whitespace`,async()=>{for(const v of [123,'   ']) assert((await validate(plainToClass(Dto,{...base,...business,[n]:v}))).length);});
 await check('Length bounds enforced',async()=>{for(const n of Object.keys(business)) assert((await validate(plainToClass(Dto,{...base,...business,[n]:'x'.repeat(n==='dba'?201:51)}))).length);});
 await check('Client DTO unchanged without business fields',async()=>assert.equal((await validate(plainToClass(Dto,{...base,userType:'Client'}))).length,0));
 await check('Schema rejects blank professional fields without DB',async()=>assert(new User({...base,dba:' ',gstNumber:' ',pstNumber:' '}).validateSync()));
 await check('Schema permits Client without business fields',async()=>assert.equal(new User({...base,userType:'Client'}).validateSync(),undefined));
 await check('Legacy Professional verification save remains valid without new fields', async()=>{const doc=new User(base);doc.isNew=false;doc.verified=true;assert.equal(doc.validateSync(),undefined);});
 const server=app.listen(0,'127.0.0.1'); await new Promise(r=>server.once('listening',r));
 try {
 const post=async(data,route='/api/auth/register')=>{const r=await fetch(`http://127.0.0.1:${server.address().port}${route}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return [r.status,await r.json()];};
 await check('HTTP rejects missing fields before persistence/email',async()=>{reset();const [s,b]=await post(base);assert.equal(s,400);assert.match(b.message,/DBA/);assert.equal(state.saved.length,0);assert.equal(state.mail.length,0);});
 await check('HTTP valid values survive service and real schema into mock persistence',async()=>{reset();const [s]=await post({...base,...business});assert.equal(s,201);const u=state.saved[0];assert.equal(u.dba,'Demo Tech');for(const n of Object.keys(business).filter(n=>n!=='dba')) assert.equal(u[n],business[n]);assert.equal(u.verified,false);assert(u.verificationToken);assert(u.verificationSessionId);assert.equal(state.mail.length,1);assert.match(state.mail[0][2],/verify-email\?token=/);});
 await check('Professional route also validates',async()=>assert.equal((await post(base,'/api/auth/professional/register'))[0],400));
 await check('HTTP Client still registers without business fields',async()=>assert.equal((await post({...base,userType:'Client'}))[0],201));
 console.log(`${count} isolated checks passed. NO REAL DB OR EMAIL; not real end-to-end verification.`);
 } finally {await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
