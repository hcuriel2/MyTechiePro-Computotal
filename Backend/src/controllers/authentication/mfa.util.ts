import speakeasy from "speakeasy";

// Name that shows up inside Google Authenticator / Microsoft Authenticator / Authy.
export const MFA_ISSUER = "Computotal";

// Makes a fresh shared secret for one account.
// 20 bytes comes out as 32 base32 characters, which is what those apps expect you to type or scan.
export function generateMfaSecret(): string {
    const generated = speakeasy.generateSecret({ length: 20 });
    if (!generated.base32) {
        throw new Error("Failed to generate authenticator secret");
    }
    return generated.base32;
}

// Builds the otpauth link that gets turned into the QR code.
// SHA1, 6 digits, and a new code every 30 seconds is the normal authenticator setup.
// The colon between the app name and the email is left as-is so the phone app can split them.
export function buildOtpAuthUrl(email: string, base32Secret: string): string {
    const label = `${encodeURIComponent(MFA_ISSUER)}:${encodeURIComponent(email)}`;
    const query = [
        `secret=${encodeURIComponent(base32Secret)}`,
        `issuer=${encodeURIComponent(MFA_ISSUER)}`,
        "algorithm=SHA1",
        "digits=6",
        "period=30",
    ].join("&");
    return `otpauth://totp/${label}?${query}`;
}

// Checks a code the user typed against the secret we have stored.
// Spaces are stripped so a pasted "123 456" still counts.
// window: 1 lets the previous or next 30-second code through, in case their phone clock is a little off.
export function matchingTotpStep(base32Secret: string, token: any): number | null {
    const code = typeof token === 'string' ? token.replace(/\s/g, '') : '';
    if (!/^\d{6}$/.test(code)) return null;
    const time = Math.floor(Date.now() / 1000);
    const result = speakeasy.totp.verifyDelta({ secret: base32Secret, encoding: 'base32', token: code,
        window: 1, digits: 6, step: 30, algorithm: 'sha1', time });
    return result ? Math.floor(time / 30) + result.delta : null;
}
export function verifyTotp(base32Secret: string, token: string): boolean {
    return matchingTotpStep(base32Secret, token) !== null;
}
