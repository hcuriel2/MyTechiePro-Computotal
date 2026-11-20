import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

// The same password policy as signup and email-based password reset.
export default class ChangePasswordDto {
    @IsString()
    @MinLength(1)
    @MaxLength(128)
    public currentPassword: string;

    @IsString()
    @MinLength(8)
    @MaxLength(16)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).*$/)
    public newPassword: string;

    @IsString()
    public confirmNewPassword: string;

    // MFA-enabled accounts must also supply a fresh authenticator code.
    @IsOptional()
    @IsString()
    @Matches(/^\d{6}$/)
    public currentToken?: string;
}
