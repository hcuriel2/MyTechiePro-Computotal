/*NOTES*/
/*
IF YOU MODIFY THE CODE: DOCUMENT THE CHANGE AND MENTION IT IN THE CHANGES SECTION


Summary:
These three classes serve as a data transfer objects (DTO) that are used for defining the structure and 
validation rules creating a new survey. It appears that the surveyContents DTO is inserted
into the category DTO, which is then used to create a new survey.


Unused Code:



Clarification needed:
- why are there 3 DTO classes within this file?



Changes:


*/

import { IsString, IsObject, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

// DTO 
class surveyContentsDto {
    public question: string;
    public key: string;
    public contents: Array<String>;
}

class categoryDto {
    @IsString()
    public name: string;
    @IsObject()
    @ValidateNested() @Type(()=> surveyContentsDto)
    public surveyContents: surveyContentsDto;
}

class CreateSurveyDto {
    @IsObject()
    @ValidateNested() @Type(()=> categoryDto)
    public category: categoryDto;
}

export default CreateSurveyDto;
