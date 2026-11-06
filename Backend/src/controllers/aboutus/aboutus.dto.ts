import { IsString, MaxLength } from "class-validator";

class UpdateAboutUsDto {
    @IsString()
    @MaxLength(5000)
    public content: string;
}

export default UpdateAboutUsDto;