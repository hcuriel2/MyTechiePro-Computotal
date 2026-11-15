import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import userModel from '../../models/user/user.model';
import sendEmail from '../../middleware/sendgrid.middleware';
import HttpException from '../../exceptions/HttpException';

// Recovery credentials are independent of sessions, email verification, and MFA.
export default class PasswordResetService {
    public async requestReset(email: unknown): Promise<void> {
        if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return;
        }
        const token = crypto.randomBytes(32).toString('hex');
        const now = new Date();
        const user = await userModel.findOneAndUpdate({
            email: email.trim().toLowerCase(),
            $or: [
                { passwordResetRequestedAt: { $exists: false } },
                { passwordResetRequestedAt: { $lte: new Date(now.getTime() - 60000) } },
            ],
        }, { $set: {
            passwordResetTokenHash: this.hash(token),
            passwordResetExpiresAt: new Date(now.getTime() + 15 * 60 * 1000),
            passwordResetRequestedAt: now,
        } }, { new: true });
        if (!user) { return; }
        // Configured origin only; never build recovery links from the request Host.
        const url = new URL(`/resetPassword/${user._id}`, process.env.CLIENT_URL);
        url.hash = `token=${token}`;
        await sendEmail(user.email, 'Reset Password',
            `<p>A password reset was requested. This link expires in 15 minutes and can be used once.</p>` +
            `<p><a href="${url.toString()}">Reset your password</a></p>` +
            `<p>If you did not request this, ignore this email.</p>`);
    }

    public async reset(id: string, token: string, password: string): Promise<void> {
        const invalid = () => new HttpException(400, 'Reset link is invalid or expired. Request a new link.');
        if (!/^[a-f0-9]{24}$/i.test(id) || !/^[a-f0-9]{64}$/.test(token || '')) {
            throw invalid();
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        // One conditional write consumes the credential and changes the password.
        // Two concurrent submissions cannot both match once the token is unset.
        const user = await userModel.findOneAndUpdate({
            _id: id,
            passwordResetTokenHash: this.hash(token),
            passwordResetExpiresAt: { $gt: new Date() },
        }, {
            $set: { password: hashedPassword },
            $inc: { sessionVersion: 1 },
            $unset: { passwordResetTokenHash: '', passwordResetExpiresAt: '', tempSecret: '', tempSecretExpiresAt: '' },
        }, { new: true, runValidators: true });
        if (!user) { throw invalid(); }
    }

    private hash(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
}
