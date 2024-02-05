/*NOTES*/
/*
IF YOU MODIFY THE CODE: DOCUMENT THE CHANGE AND MENTION IT IN THE CHANGES SECTION


Summary:
This class serves as a data transfer object (DTO) used for defining the structure and 
validation rules for creating an address. This includes the address within the specified
country, as well as its latitude and longitude coordinates.


Unused Code:


Clarification needed:



Changes:


*/

import { IsString } from "class-validator";

class CreateAddressDto {
    @IsString()
    public street: string;
    @IsString()
    public city: string;
    @IsString()
    public country: string;
    @IsString()
    public postalCode:string;

    public lat:number;

    public lng:number;


}

export default CreateAddressDto;
