import userModel from '../../models/user/user.model';
import { matchingTotpStep } from './mfa.util';

// MongoDB owns the clock, attempt budget and replay state across all instances.
export default class MfaSecurityService {
    private identity(user: any): any {
        return { _id: user._id, password: user.get('password', null, { getters: false }),
            secret: user.secret || { $in: [null, ''] },
            sessionVersion: user.sessionVersion || { $in: [0, null] } };
    }
    private available(): any { return { $lte: [{ $ifNull: ['$mfaSecurity.blockedUntil', new Date(0)] }, '$$NOW'] }; }
    private async write(filter: any, update: any): Promise<any> {
        const result = await userModel.collection.findOneAndUpdate(filter, update, { returnOriginal: false, writeConcern: { w: 'majority' } });
        return result.value ? userModel.hydrate(result.value) : null;
    }
    private error(status: number, message: string, retryAfter = 0): any {
        return Object.assign(new Error(message), { status, retryAfter });
    }
    public async begin(user: any): Promise<any> {
        const expired = { $lte: [{ $ifNull: ['$mfaSecurity.windowEnd', new Date(0)] }, '$$NOW'] };
        const reserved = await this.write({ ...this.identity(user), $expr: { $and: [this.available(),
            { $or: [expired, { $lt: [{ $ifNull: ['$mfaSecurity.count', 0] }, 10] }] }] } }, [{ $set: {
            'mfaSecurity.windowEnd': { $cond: [expired, { $add: ['$$NOW', 60000] }, '$mfaSecurity.windowEnd'] },
            'mfaSecurity.count': { $add: [{ $cond: [expired, 0, { $ifNull: ['$mfaSecurity.count', 0] }] }, 1] },
            'mfaSecurity.serial': { $add: [{ $ifNull: ['$mfaSecurity.serial', 0] }, 1] },
        } }]);
        if (!reserved) {
            const rows = await userModel.collection.aggregate([{ $match: this.identity(user) },
                { $project: { state: '$mfaSecurity', now: '$$NOW' } }]).toArray();
            if (!rows.length) throw this.error(401, 'Account changed. Sign in again.');
            const state = rows[0].state || {}, now = rows[0].now.getTime();
            const until = Math.max(state.blockedUntil ? state.blockedUntil.getTime() : 0,
                state.count >= 10 && state.windowEnd ? state.windowEnd.getTime() : 0);
            throw this.error(429, 'Too many verification attempts. Wait before trying again.', Math.max(1, Math.ceil((until - now) / 1000)));
        }
        return reserved;
    }
    public async reject(user: any): Promise<never> {
        const failed = await this.write(this.identity(user), [
            { $set: { 'mfaSecurity.checkedAt': '$$NOW', 'mfaSecurity.failures': { $add: [{ $ifNull: ['$mfaSecurity.failures', 0] }, 1] } } },
            { $set: { 'mfaSecurity.blockedUntil': { $cond: [{ $gte: ['$mfaSecurity.failures', 5] },
                { $max: [{ $ifNull: ['$mfaSecurity.blockedUntil', new Date(0)] },
                    { $add: ['$$NOW', { $min: [900000, { $multiply: [30000, { $pow: [2, { $min: [5, { $subtract: ['$mfaSecurity.failures', 5] }] }] }] }] }] }] },
                { $ifNull: ['$mfaSecurity.blockedUntil', new Date(0)] }] } } },
        ]);
        if (failed && failed.get('mfaSecurity').failures >= 5)
            throw this.error(429, 'Too many verification attempts. Wait before trying again.',
                Math.max(1, Math.ceil((failed.get('mfaSecurity').blockedUntil.getTime() - failed.get('mfaSecurity').checkedAt.getTime()) / 1000)));
        throw this.error(401, 'Authenticator proof invalid, expired or already used. Use a fresh code.');
    }
    public step(secret: string, token: any): number | null { return matchingTotpStep(secret, token); }
    public async commit(user: any, step: number | null, update: any = {}, extra: any = {}): Promise<any> {
        const filter: any = { ...this.identity(user), ...extra, $expr: this.available() };
        if (user.secret) filter.$or = [{ 'mfaSecurity.lastStep': { $lt: step } }, { 'mfaSecurity.lastStep': { $exists: false } }];
        const changes = { ...update, $set: { ...(step === null ? {} : { 'mfaSecurity.lastStep': step }), ...(update.$set || {}) } };
        const updated = await this.write(filter, changes);
        if (!updated) return this.reject(user);
        // Never erase failures recorded by a newer concurrent reservation.
        await userModel.collection.updateOne({ ...this.identity(updated), 'mfaSecurity.serial': user.get('mfaSecurity').serial },
            { $set: { 'mfaSecurity.failures': 0 } });
        return updated;
    }
}
