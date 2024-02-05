/*NOTES*/
/*
IF YOU MODIFY THE CODE: DOCUMENT THE CHANGE AND MENTION IT IN THE CHANGES SECTION


Summary:
This class serves as a data transfer object (DTO) used for validating and structuring
data when creating contact us form submissions.
    

Clarification needed:
- what is the difference between name and first name?


Changes:


*/

import {IsString} from "class-validator";

class CreatecontactusDto {
    @IsString()
    public name: string; // unsure?
    @IsString()
    public firstName: string; // first name of the user
    @IsString()
    public lastName: string; // last name of the user
    @IsString()
    public email: string; // user email
    @IsString()
    public message: string; // user message
}

export default CreatecontactusDto;
