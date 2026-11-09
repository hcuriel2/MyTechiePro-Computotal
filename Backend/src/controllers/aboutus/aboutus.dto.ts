import { ValidateIf, IsString } from "class-validator";

class UpdateAboutUsDto {
    @ValidateIf((_object, value) => value !== undefined)
    @IsString()
    public content?: string;

    @ValidateIf((_object, value) => value !== undefined)
    @IsString()
    public appendixContent?: string;
}

export default UpdateAboutUsDto;
