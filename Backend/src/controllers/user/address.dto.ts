import { IsNumber, IsString } from "class-validator";

class CreateAddressDto {
    @IsString()
    public street: string;
    @IsString()
    public city: string;
    @IsString()
    public country: string;
    @IsString()
    public postalCode:string;

    @IsNumber()
    public lat:number;

    @IsNumber()
    public lng:number;


}

export default CreateAddressDto;
