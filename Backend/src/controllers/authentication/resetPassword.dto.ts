/*NOTES*/
/*
IF YOU MODIFY THE CODE: DOCUMENT THE CHANGE AND MENTION IT IN THE CHANGES SECTION


Summary:
This class represents a data transfer object (DTO) used for validating and structuring
the data needed to reset a user's password. 



Unused Code:


Unnecessary Logs:



Clarification needed:
    - will we need to remove the optional value for the MFA
    - password reset isn't currently working


Changes:



*/


// Import used for validation decorators
import { IsString } from "class-validator";

// class for handling password reset data
class ResetPasswordDto {
    @IsString()
    public password: string; // new password to be set

    @IsString()
    public confirmPassword: string; // confirm new password
}

export default ResetPasswordDto;
