import { IsString, Matches, MinLength, MaxLength } from "class-validator";

class ResetPasswordDto {
    @IsString()
    @MinLength(8)
    @MaxLength(16)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).*$/)
    public password: string;

    @IsString()
    public confirmPassword: string;

    @IsString()
    @Matches(/^[a-f0-9]{64}$/)
    public token: string;
}

export default ResetPasswordDto;
