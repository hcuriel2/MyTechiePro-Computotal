import {
    IsOptional,
    IsString,
    ValidateNested,
    IsEnum,
    isNotEmpty,
    isEmail
} from "class-validator";
import CreateAddressDto from "./address.dto";

class CreateUserDto {
    @IsString()
    public firstName: string;

    @IsString()
    public lastName: string;

    @IsString()
    public phoneNumber: string;

    @IsString()
    public email: string;

    @IsString()
    public password: string;

    @IsString()
    readonly userType: string;

    @IsOptional()
    readonly proStatus: string;

    @IsOptional()
    public company: string;

    @IsOptional()
    public alias: string;

    @IsOptional()
    public rating: number;

    @IsOptional()
    public unitPrice: number;

    @IsOptional()
    public unitType: string;

    @IsOptional()
    public bio: string;

    @IsOptional()
    public website: string;

    @IsOptional()
    public inquiry: string;

    //All ratings summed together; used to calculate the rating of the professional
    @IsOptional()
    public ratingSum: number;

    //The count of reviews given to techie; used to calculate the rating of the professional
    @IsOptional()
    public ratingCount: number;

    //Used for location range

    @IsOptional()
    public lat: number;

    @IsOptional()
    public lng: number;

    @IsOptional()
    public placeid: string;

    @IsOptional()
    @ValidateNested()
    public address?: CreateAddressDto;

    @IsOptional()
    public secret: string;

    @IsOptional()
    public tempsecret: string;
}

export default CreateUserDto;
