import { IsOptional, IsString, ValidateNested, IsArray } from "class-validator";
import { Type } from "class-transformer";
// import Service from "./service.dto";

class CreateCategoryDto {
    @IsString()
    public name: string;
    @IsString()
    public icon: string;
}

export default CreateCategoryDto;
