/*NOTES*/
/*
IF YOU MODIFY THE CODE: DOCUMENT THE CHANGE AND MENTION IT IN THE CHANGES SECTION


Summary:
This class is a data transfer object (DTO) used for defining the structure and validation
rules for creating a new category.


Unused Code:
- the Service import is never used
    

Clarification needed:


Changes:


*/

import { IsOptional, IsString, ValidateNested, IsArray } from "class-validator";
import { Type } from "class-transformer";
// import Service from "./service.dto";

class CreateCategoryDto {
    @IsString()
    public name: string; // category name
    @IsString()
    public icon: string; // category icon
}

export default CreateCategoryDto;
