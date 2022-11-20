import {IsString} from "class-validator";

class CreatecontactusDto {
    @IsString()
    public name: string;
    @IsString()
    public firstName: string;
    @IsString()
    public lastName: string;
    @IsString()
    public email: string;
    @IsString()
    public message: string;
}

export default CreatecontactusDto;
