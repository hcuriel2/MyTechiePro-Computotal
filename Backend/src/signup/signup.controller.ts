import { Router, RequestHandler } from 'express';
import adminMiddleware from '../middleware/admin.middleware';
import { mongoSettingsStore, SettingsStore, validSettings } from './signup-settings';
export default class SignupController {
    public path = '/signup-settings';
    public router = Router();
    constructor(store: SettingsStore = mongoSettingsStore, authorize: RequestHandler = adminMiddleware) {
        this.router.get(this.path, async (_req, res) => {
            res.setHeader('Cache-Control', 'no-store');
            try { res.json(await store.read()); }
            catch (_) { res.status(503).json({ message: 'Signup availability is temporarily unavailable.' }); }
        });
        this.router.put(this.path, authorize, async (req, res) => {
            if (!validSettings(req.body)) { return res.status(400).json({ message: 'Provide both signup switches and non-empty notices (maximum 1000 characters).' }); }
            try { res.json(await store.write(req.body)); }
            catch (_) { res.status(503).json({ message: 'Settings could not be saved. Please retry.' }); }
        });
    }
}
