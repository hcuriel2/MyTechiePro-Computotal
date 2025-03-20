import { IsString } from "class-validator";

class UpdateAboutUsDto {
    @IsString()
    public content: string;
}

export default UpdateAboutUsDto;