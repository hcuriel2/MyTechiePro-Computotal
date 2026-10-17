const assert=require('assert'),path=require('path'),fs=require('fs');
const {app,state,reset}=require('./business-fields-demo.cjs');
const pw=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const out=path.resolve(process.argv[2]||'../../outputs');fs.mkdirSync(out,{recursive:true});
 const server=app.listen(8182,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 let browser;
 try{
 browser=await pw.chromium.launch({headless:true,channel:'msedge'});
 const context=await browser.newContext({viewport:{width:1440,height:1050}});
 await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8182/sign-up?forPro=true');await page.locator('input[formControlName=dba]').waitFor();
 await page.evaluate(()=>{const c=ng.getComponent(document.querySelector('app-sign-up'));c.formGroup.markAllAsTouched();c.changeDetectorRef.detectChanges();});
 for(const n of ['dba','gstNumber','pstNumber']) assert(await page.locator(`input[formControlName=${n}]`).count());
 await page.locator('section[aria-label="Professional business registration"]').scrollIntoViewIfNeeded();
 await page.waitForTimeout(500); await page.screenshot({path:path.join(out,'01-professional-required.png'),fullPage:true});
 let result=await page.evaluate(()=>{const c=ng.getComponent(document.querySelector('app-sign-up'));const checks={};for(const n of ['dba','gstNumber','pstNumber']){for(const v of ['', '   ']){c[n].setValue(v);checks[n+JSON.stringify(v)]=c[n].invalid;} }for(const n of ['businessNumber','dunsNumber']){c[n].setValue('');checks[n]=c[n].valid;c[n].setValue('   ');checks[n+'blank']=c[n].invalid;c[n].setValue('');}c.dba.setValue('x'.repeat(201));checks.maxDba=c.dba.invalid;c.gstNumber.setValue('x'.repeat(51));checks.maxGst=c.gstNumber.invalid;c.pstNumber.setValue('x'.repeat(51));checks.maxPst=c.pstNumber.invalid;c.onSubmit();return checks;});
 for(const [n,v] of Object.entries(result)) assert(v,n);assert.equal(state.saved.length,0);
 console.log('PASS real Angular control tests: required/whitespace/length/optional and submit guard');
 await page.evaluate(()=>{const c=ng.getComponent(document.querySelector('app-sign-up'));c.formGroup.patchValue({companyName:'Demo Tech',unitPrice:100,unitType:'Hour',firstName:'Demo',lastName:'Professional',emailAddress:'demo@example.com',phoneNumber:'6045550123',password:'DemoPass1!',confirmPassword:'DemoPass1!',location:'Demo address (manually entered)',city:'Vancouver',country:'Canada',street:'123 Demo Street',postalCode:'V6B1A1',bio:'Mock demo technician',dba:'Demo Tech',gstNumber:'001234567RT0001',pstNumber:'PST-001234',businessNumber:'001234567',dunsNumber:'001234567'});c.changeDetectorRef.detectChanges();});
 const invalid=await page.evaluate(()=>{const c=ng.getComponent(document.querySelector('app-sign-up'));return Object.keys(c.formGroup.controls).filter(k=>c.formGroup.controls[k].invalid);});assert.deepEqual(invalid,[]);
 await page.screenshot({path:path.join(out,'02-professional-valid.png'),fullPage:true});
 reset();const response=page.waitForResponse(r=>r.url().endsWith('/api/auth/register')&&r.request().method()==='POST');
 await page.locator('#sign-up-submit-btn').click();assert.equal((await response).status(),201);assert.equal(state.saved[0].dba,'Demo Tech');assert.equal(state.saved[0].gstNumber,'001234567RT0001');assert.equal(state.mail.length,1);console.log('PASS actual Angular submit -> real HTTP controller/DTO/service/schema -> mocked persistence/email');
 const status=await context.newPage();await status.goto('http://127.0.0.1:8182/mock-status');await status.screenshot({path:path.join(out,'03-mock-backend-capture.png'),fullPage:true});
 await page.goto('http://127.0.0.1:8182/sign-up');await page.locator('#sign-up-submit-btn').waitFor();assert.equal(await page.locator('input[formControlName=dba]').count(),0);
 const client=await page.evaluate(()=>{const c=ng.getComponent(document.querySelector('app-sign-up'));return ['dba','gstNumber','pstNumber','businessNumber','dunsNumber'].every(n=>!c.formGroup.contains(n));});assert(client);console.log('PASS Client has no business controls or fields');
 await page.screenshot({path:path.join(out,'04-client-unchanged.png'),fullPage:true});assert.deepEqual(errors,[]);console.log('PASS no browser page errors');
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({mocked:true,angularControlChecks:result,clientUnchanged:client,pageErrors:errors,persistence:'in memory only',email:'captured only',realEndToEnd:false},null,2));
 } finally {if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
