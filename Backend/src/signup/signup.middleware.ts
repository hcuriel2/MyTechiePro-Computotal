import { RequestHandler } from 'express';
import { mongoSettingsStore, SettingsStore } from './signup-settings';
// Check both the route and requested role so changing endpoint cannot bypass a closure.
export function signupGuard(store: SettingsStore = mongoSettingsStore): RequestHandler {
    return async (req, res, next) => {
        const role = req.body && req.body.userType;
        if (role !== 'Client' && role !== 'Professional') {
            return res.status(400).json({ message: 'Choose Client or Professional signup.' });
        }
        try {
            const settings = await store.read();
            const professional = req.path.includes('/professional/') || role === 'Professional';
            const client = role === 'Client';
            if ((professional && !settings.professionalEnabled) || (client && !settings.clientEnabled)) {
                const message = professional && !settings.professionalEnabled ? settings.professionalNotice : settings.clientNotice;
                return res.status(403).json({ code: 'SIGNUP_DISABLED', message });
            }
            next();
        } catch (_) { res.status(503).json({ message: 'Signup availability is temporarily unavailable. Please try again later.' }); }
    };
}
