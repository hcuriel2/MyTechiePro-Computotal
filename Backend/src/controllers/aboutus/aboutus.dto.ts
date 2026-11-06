import { IsString, MaxLength } from "class-validator";

class UpdateAboutUsDto {
    @IsString()
    // Matches the maxlength on the admin textarea.
    @MaxLength(5000)
    public content: string;
}

export default UpdateAboutUsDto;