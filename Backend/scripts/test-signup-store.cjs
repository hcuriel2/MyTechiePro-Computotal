// Verify Mongo adapter calls without opening any database connection.
const assert=require('assert');const mongoose=require('mongoose');
for(const method of ['connect','createConnection'])mongoose[method]=()=>{throw Error('MongoDB forbidden in adapter tests');};
const {mongoSettingsStore:store,defaults}=require('../dist/signup/signup-settings');
const model=mongoose.model('SignupSettings');let saved=null,calls=0;
model.findById=id=>{assert.equal(id,'signup');return {lean:async()=>saved};};
model.findOneAndUpdate=async(filter,update,options)=>{calls++;assert.deepStrictEqual(filter,{_id:'signup'});assert.deepStrictEqual(options,{upsert:true,new:true,runValidators:true,setDefaultsOnInsert:true});saved={...update.$set,_id:'signup',updatedAt:'private metadata'};return saved;};
(async()=>{assert.deepStrictEqual(await store.read(),defaults);console.log('PASS absent settings use compatible enabled defaults');
const value={...defaults,clientEnabled:false,clientNotice:'Later'};assert.deepStrictEqual(await store.write(value),value);assert.equal(calls,1);console.log('PASS atomic validated upsert uses singleton ID');
assert.deepStrictEqual(await store.read(),value);console.log('PASS subsequent read returns saved values and omits metadata');
model.findById=()=>({lean:async()=>{throw Error('offline');}});await assert.rejects(()=>store.read(),/offline/);console.log('PASS failed read never silently reopens signup');
model.findOneAndUpdate=async()=>{throw Error('offline');};await assert.rejects(()=>store.write(value),/offline/);console.log('PASS failed write propagates to caller');console.log('5/5 adapter checks passed with mocked Mongo model. Real DB persistence is unverified.');})().catch(e=>{console.error(e);process.exitCode=1;});
