// Real routers and JWT middleware, with memory-only persistence and captured email.
require('./fetch-node14.cjs');
const assert = require('assert');
const {User, token, state, reset} = require('./integration-harness.cjs');
const express = require('express');
const app = express();
app.use(express.json(), require('cookie-parser')());
const accounts = {
    admin: {userType: 'Admin', adminRole: 'Admin'},
    legacy: {userType: 'Admin'},
    editor: {userType: 'Admin', adminRole: 'Editor'},
    readonly: {userType: 'Admin', adminRole: 'Read-only'},
    client: {userType: 'Client'},
    invalid: {userType: 'Admin', adminRole: 'invalid'},
};
User.findById = async id => accounts[id] ? {_id: id, ...accounts[id]} : null;
let content = {content: 'Original about', appendixContent: 'Original appendix'}, writes = 0;
const About = require('../dist/models/aboutus/aboutus.model').default;
About.findOne = async () => ({...content});
About.findOneAndUpdate = async (_filter, update) => {
    writes++;
    content = {...content, ...update.$set};
    return {...content};
};
process.env.STRIPE_SECRET_KEY = 'sk_test_disposable_not_a_real_key';
for (const path of ['aboutus/aboutus', 'authentication/authentication', 'user/user', 'category/category', 'contactus/contactus', 'project/project']) {
    app.use('/api', new (require('../dist/controllers/' + path + '.controller').default)().router);
}
app.use('/api', new (require('../dist/signup/signup.controller').default)().router);
app.use((err, _req, res, _next) => res.status(err.status || 500).json({message: err.message}));
const base = {firstName:'Test', lastName:'Admin', phoneNumber:'6045550123', email:'test@example.com', password:'TestPass1!', userType:'Admin'};
(async () => {
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    let checks = 0;
    async function call(method, path, body, role) {
        const result = await fetch(`http://127.0.0.1:${server.address().port}/api${path}`, {
            method, headers: {'Content-Type':'application/json', ...(role ? {Cookie:'Authorization=' + (role === 'forged' ? 'forged' : token(role))} : {})},
            ...(body === undefined ? {} : {body: JSON.stringify(body)})
        });
        const text = await result.text();
        let bodyValue;
        try { bodyValue = JSON.parse(text); } catch (_) { bodyValue = text; }
        return {status: result.status, body: bodyValue};
    }
    async function expect(method, path, body, role, status) {
        const result = await call(method, path, body, role);
        assert.equal(result.status, status, `${role || 'anonymous'} ${method} ${path}: ${JSON.stringify(result.body)}`);
        checks++;
        return result;
    }
    try {
        reset();
        await expect('GET', '/aboutus', undefined, undefined, 200);
        for (const role of [undefined, 'forged', 'missing', 'client']) {
            await expect('PUT', '/aboutus', {content:'Denied'}, role, 401);
        }
        for (const role of ['readonly', 'invalid']) await expect('PUT', '/aboutus', {content:'Denied'}, role, 403);
        assert.equal(writes, 0);
        for (const role of ['admin', 'legacy', 'editor']) {
            const result = await expect('PUT', '/aboutus', {content:role}, role, 200);
            assert.equal(result.body.appendixContent, 'Original appendix');
            await expect('PUT', '/aboutus', {appendixContent:''}, role, 200);
            assert.equal(content.content, role);
            content.appendixContent = 'Original appendix';
        }
        const before = writes;
        for (const body of [{}, {content:7}, {appendixContent:[]}, {content:null}]) await expect('PUT', '/aboutus', body, 'editor', 400);
        assert.equal(writes, before);
        const protectedWrites = [
            ['POST','/auth/admin/register',base], ['PUT','/signup-settings',state.settings],
            ['POST','/categories',{}], ['PATCH','/categories/id',{}], ['PUT','/categories/services/id',{}],
            ['DELETE','/categories/id',{}], ['DELETE','/contactus/id',{}],
            ['DELETE','/users/id',{}], ['PUT','/users/approve/id',{}], ['PATCH','/users/id',{}],
            ['PATCH','/users/stripe-account/id',{}], ['DELETE','/projects/id',{}],
            ['POST','/projects',{}], ['POST','/projects/pay',{}], ['PATCH','/projects/start/id',{}],
            ['PATCH','/projects/id/reset-price',{}], ['POST','/projects/projectReview',{}]
        ];
        for (const role of ['editor','readonly','invalid']) for (const [method,path,body] of protectedWrites) {
            await expect(method,path,body,role,403);
        }
        assert.equal(state.saved.length, 0);
        assert.equal(state.mail.length, 0);
        for (const role of ['admin', 'legacy']) {
            await expect('PUT', '/signup-settings', state.settings, role, 200);
            for (const adminRole of ['Admin', 'Editor', 'Read-only']) {
                reset();
                await expect('POST','/auth/admin/register',{...base, adminRole},role,201);
                assert.equal(state.saved[0].adminRole,adminRole);
            }
        }
        reset();
        await expect('POST','/auth/admin/register',{...base, adminRole:'invalid'},'admin',400);
        await expect('POST','/auth/register',base,undefined,400);
        assert.equal(state.saved.length,0);
        console.log(`PASS ${checks} HTTP permission/content checks; no live database, mail, or payment calls.`);
    } finally { await new Promise(resolve => server.close(resolve)); }
})().catch(err => {console.error(err); process.exitCode = 1;});
