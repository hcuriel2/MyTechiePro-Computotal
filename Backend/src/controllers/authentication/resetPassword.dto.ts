import { IsString } from "class-validator";

class ResetPasswordDto {
    @IsString()
    public password: string;

    @IsString()
    public confirmPassword: string;
}

export default ResetPasswordDto;
