/*NOTES*/
/*
IF YOU MODIFY THE CODE: DOCUMENT THE CHANGE AND MENTION IT IN THE CHANGES SECTION


Summary:
This class represents a data transfer object (DTO) used for validating and structuring
user login information. It has an optional string for MFA in the DTO.


Unused Code:


Unnecessary Logs:



Clarification needed:
    - will we need to remove the optional value for the MFA


Changes:



*/


// Import used for validation decorators
import { IsString } from "class-validator";

// Class for handling user login data
class LogInDto {
    @IsString()
    public email: string; // user email address for login

    @IsString()
    public password: string; // user password for login

    public secret?: string; // option MFA secret token
}

export default LogInDto;
