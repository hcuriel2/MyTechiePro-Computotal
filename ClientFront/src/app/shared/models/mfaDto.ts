// Legacy MFA DTO shape. The active setup flow uses MfaSetup in auth.service.ts,
// which also includes the otpauth URL.
export class MfaDto {
    // Base32 authenticator key shown to the user during enrollment.
    secret: string = '';
    // QR image encoded as a data URL.
    dataURL: string;
    // Issuer label displayed by compatible authenticator apps.
    issuer: string = '';
}
