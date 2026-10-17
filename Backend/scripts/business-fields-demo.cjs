// MOCKED LOCAL DEMO ONLY: never import server/app/dotenv or open MongoDB.
require('reflect-metadata');
const express = require('express'), path = require('path'), fs = require('fs');
const mongoose = require('mongoose');
for (const method of ['connect', 'createConnection']) mongoose[method] = () => { throw Error('Database connections forbidden in mocked demo'); };
process.env.JWT_SECRET = 'mock-business-fields-demo-only';
const state = { saved: [], mail: [] };
const mailPath = require.resolve('../dist/middleware/sendgrid.middleware');
require.cache[mailPath] = { id: mailPath, filename: mailPath, loaded: true, exports: { __esModule: true, default: async (...args) => { state.mail.push(args); } } };
const User = require('../dist/models/user/user.model').default;
User.findOne = async () => null;
User.find = async () => [];
User.create = async data => {
  const doc = new User(data);
  await doc.validate(); // real schema casting/validation, no save or connection
  state.saved.push(doc.toObject());
  return doc;
};
const Controller = require('../dist/controllers/authentication/authentication.controller').default;
const controller = new Controller();
const app = express();
app.use(express.json());
app.get('/mock-status', (_req, res) => res.json({ mocked: true, database: 'DISABLED', email: 'CAPTURED ONLY', saved: state.saved.map(u => ({ userType: u.userType, dba: u.dba, gstNumber: u.gstNumber, pstNumber: u.pstNumber, businessNumber: u.businessNumber, dunsNumber: u.dunsNumber, verified: u.verified, tokenGenerated: !!u.verificationToken })), emailCount: state.mail.length }));
app.use('/api', (req, res, next) => {
  if (req.method === 'POST' && ['/auth/register', '/auth/professional/register'].includes(req.path)) return next();
  if (req.path === '/categories') return res.json([]);
  if (req.path === '/auth/checkSession') return res.status(401).json({message:'Mock demo: no session'});
  return res.status(404).json({message:'Disabled in mocked demo'});
});
app.use('/api', controller.router);
app.use((err, _req, res, _next) => res.status(err.status || 500).json({ message: err.message }));
// Only locally built Angular files. API origin is rewritten in memory, never in source.
const folder = path.resolve(__dirname, '../../ClientFront/dist/computer-guy-frontend');
app.get('*.js', (req, res, next) => {
  const file = path.join(folder, path.basename(req.path));
  if (!fs.existsSync(file)) return next();
  res.type('js').send(fs.readFileSync(file, 'utf8').replace(/http:\/\/localhost:2424\/api/g, '/api'));
});
app.use(express.static(folder, { index: false }));
app.get('*', (_req, res) => {
  const html = fs.readFileSync(path.join(folder, 'index.html'), 'utf8');
  const mockMaps = `<script>window.google={maps:{places:{Autocomplete:function(){this.addListener=function(){return {remove:function(){}}};this.getPlace=function(){return {}}}},event:{clearInstanceListeners:function(){}}}};</script>`;
  const banner = '<aside style="position:fixed;top:0;left:0;right:0;z-index:99999;background:#6b1826;color:white;padding:10px;text-align:center">MOCKED LOCAL DEMO — No MongoDB · No email sent · No real account created <a style="color:white" href="/mock-status" target="_blank">View captured business values</a></aside>';
  res.setHeader('Content-Security-Policy', "default-src 'self' data: blob: 'unsafe-inline' 'unsafe-eval'; connect-src 'self'; font-src 'self' data:; img-src 'self' data: blob:");
  res.type('html').send(html.replace('</head>', mockMaps + '<style>body{padding-top:44px}</style></head>').replace('</body>', banner + '</body>'));
});
module.exports = { app, state, User, reset() {state.saved.length=0;state.mail.length=0;} };
if (require.main === module) app.listen(8182, '127.0.0.1', () => console.log('MOCKED LOCAL DEMO http://127.0.0.1:8182/sign-up?forPro=true — DB/email disabled'));
