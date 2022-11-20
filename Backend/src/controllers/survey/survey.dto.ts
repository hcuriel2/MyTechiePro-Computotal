import { IsString, IsObject, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

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
