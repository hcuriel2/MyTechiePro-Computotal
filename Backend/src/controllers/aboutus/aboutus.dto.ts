import { IsOptional, IsString } from "class-validator";

class UpdateAboutUsDto {
    @IsOptional()
    @IsString()
    public content?: string;

    @IsOptional()
    @IsString()
    public appendixContent?: string;
}

export default UpdateAboutUsDto;