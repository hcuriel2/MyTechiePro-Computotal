// Test-only API process. Never bootstrap the normal server or load .env.
require('reflect-metadata');
const mongoose=require('mongoose'),express=require('express');
const uri=process.env.MFA_TEST_URI;
if(!/^mongodb:\/\/127\.0\.0\.1:\d+\/mytechie_disposable_security/.test(uri||''))throw Error('Disposable loopback database required');
process.env.JWT_SECRET='synthetic-mfa-security-test';
const mailPath=require.resolve('../dist/middleware/sendgrid.middleware');
require.cache[mailPath]={id:mailPath,filename:mailPath,loaded:true,exports:{__esModule:true,default:async()=>{throw Error('Email forbidden in this test');}}};
let clock=Date.now();Date.now=()=>clock;
const app=express();app.use(express.json(),require('cookie-parser')());
app.use('/api',new(require('../dist/controllers/authentication/authentication.controller').default)().router);
app.use('/api',new(require('../dist/controllers/user/user.controller').default)().router);
app.use((e,q,r,n)=>r.status(e.status||503).json({message:'Test request rejected'}));
let server;
mongoose.connect(uri,{useNewUrlParser:true,useUnifiedTopology:true,useFindAndModify:false,serverSelectionTimeoutMS:1000}).then(()=>{
 server=app.listen(0,'127.0.0.1',()=>process.send({port:server.address().port,pid:process.pid}));
});
process.on('message',async m=>{if(m.clock){clock=m.clock;process.send({clock});}if(m.stop){if(server)await new Promise(r=>server.close(r));await mongoose.disconnect();process.exit(0);}});
