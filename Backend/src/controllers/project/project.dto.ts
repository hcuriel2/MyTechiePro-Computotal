/*NOTES*/
/*
IF YOU MODIFY THE CODE: DOCUMENT THE CHANGE AND MENTION IT IN THE CHANGES SECTION


Summary:
This class serves as a data transfer object (DTO) used for defining the structure and 
validation rules for creating a project.


Unused Code:



Clarification needed:
- this will need to be modified to work with the updated database
- projectID should be a primary key (and auto incremented)?


Changes:


*/
import { IsOptional, IsNumber, ValidateNested, IsString } from "class-validator";
import { Type } from "class-transformer";

class CreateProjectDto {
    public categoryId:string; // categoryID of the project
    public serviceId: string; // serviceID of the project
    public serviceName: string; // Name of the service
    public professionalId: string; // Professional ID related to the project
    public _id: string; // unique projectID
    @IsNumber()
    public rating: number;
    public feedback: string;
    public state: string;
    public client: object;
    public professional: object;
    public comments: Array<{text: string, authorId:string, authorName:string}>;
    public totalCost: number;
    public clientId: string;
}

export default CreateProjectDto;
