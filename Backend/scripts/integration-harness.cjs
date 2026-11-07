// Isolated integration entry: no server/app/dotenv, database, or outbound email.
require('reflect-metadata');
const net=require('net');
const originalConnect=net.Socket.prototype.connect;
net.Socket.prototype.connect=function(...args){
 const a=Array.isArray(args[0])?args[0][0]:args[0];
 const host=typeof a==='object'?a.host:args[1];
 if(host && !['localhost','127.0.0.1','::1'].includes(host)) throw Error('Outbound connection forbidden: '+host);
 return originalConnect.apply(this,args);
};
const mongoose=require('mongoose');
for(const n of ['connect','createConnection'])mongoose[n]=()=>{throw Error('MongoDB forbidden');};
process.env.JWT_SECRET='disposable-integration-only';
process.env.CLIENT_URL='http://127.0.0.1:8183';
const state={saved:[],mail:[],unavailable:false};
const mailPath=require.resolve('../dist/middleware/sendgrid.middleware');
require.cache[mailPath]={id:mailPath,filename:mailPath,loaded:true,exports:{__esModule:true,default:async(...args)=>state.mail.push(args)}};
const settings=require('../dist/signup/signup-settings');
state.settings={...settings.defaults};
settings.mongoSettingsStore.read=async()=>{if(state.unavailable)throw Error('Mock unavailable');return {...state.settings};};
settings.mongoSettingsStore.write=async value=>{if(state.unavailable)throw Error('Mock unavailable');state.settings={...value};return {...value};};
const User=require('../dist/models/user/user.model').default;
const docs=[];
User.findOne=async query=>docs.find(d=>Object.entries(query).every(([k,v])=>d[k]===v))||null;
User.find=async()=>[];
User.findById=async id=>id==='mock-admin'?{_id:id,userType:'Admin'}:id==='mock-client'?{_id:id,userType:'Client'}:null;
User.create=async data=>{const d=new User(data);await d.validate();d.isNew=false;d.save=async()=>d;docs.push(d);state.saved.push(d.toObject());return d;};
const express=require('express'),jwt=require('jsonwebtoken');
const app=express();app.use(express.json(),require('cookie-parser')());
app.use('/api',new(require('../dist/signup/signup.controller').default)().router);
app.use('/api',new(require('../dist/controllers/authentication/authentication.controller').default)().router);
app.use('/api',(_q,r)=>r.status(404).json({message:'Disabled in mock demo'}));
app.use((e,_q,r,_n)=>r.status(e.status||500).json({message:e.message}));
function reset(){docs.length=0;state.saved.length=0;state.mail.length=0;state.settings={...settings.defaults};state.unavailable=false;}
function token(id='mock-admin',options={}){return jwt.sign({_id:id},process.env.JWT_SECRET,{expiresIn:'1h',...options});}
module.exports={app,state,User,reset,token,docs};
if(require.main===module)throw Error('Test helper only; run test-integration.cjs.');
