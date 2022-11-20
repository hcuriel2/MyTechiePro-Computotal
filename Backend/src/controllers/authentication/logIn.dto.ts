import { IsString } from "class-validator";

class LogInDto {
    @IsString()
    public email: string;

    @IsString()
    public password: string;

    public secret?: string;
}

export default LogInDto;
