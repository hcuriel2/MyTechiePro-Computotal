import { IsOptional, IsString, ValidateNested, IsEnum, IsNotEmpty, IsNumber, IsEmail } from "class-validator";

import CreateAddressDto from "./address.dto";
import { Type } from 'class-transformer';


    enum UserType {
        Client = "Client",
        Professional = "Professional",
        // Add other user types as needed
    }
    
    class CreateUserDto {
        @IsString()
        public firstName: string;
    
        @IsString()
        public lastName: string;
    
        @IsString()
        public phoneNumber: string;
    
        @IsEmail()
        public email: string;
    
        @IsString()
        public password: string;
    
        @IsEnum(UserType)
        readonly userType: UserType;
    
        @IsOptional()
        readonly proStatus?: string; // Assuming this is specific to professionals
    
        @IsOptional()
        public company?: string; // Assuming this might be specific to professionals or optional for clients
    
        @IsOptional()
        public alias?: string;
    
        // Assuming rating, unitPrice, etc., are specific to professional users
        @IsOptional()
        @IsNumber()
        public rating?: number;
    
        @IsOptional()
        @IsNumber()
        public unitPrice?: number;
    
        @IsOptional()
        @IsString()
        public unitType?: string;
    
        @IsOptional()
        @IsString()
        public bio?: string;
    
        @IsOptional()
        @IsString()
        public website?: string;
    
        @IsOptional()
        @IsString()
        public inquiry?: string;
    
        @IsOptional()
        @IsNumber()
        public ratingSum?: number;
    
        @IsOptional()
        @IsNumber()
        public ratingCount?: number;
    
        @IsOptional()
        @IsNumber()
        public lat?: number;
    
        @IsOptional()
        @IsNumber()
        public lng?: number;
    
        @IsOptional()
        @IsString()
        public placeid?: string;
    
        @IsOptional()
        @ValidateNested()
        @Type(() => CreateAddressDto) // Ensure nested validation for address
        public address?: CreateAddressDto;
    
        @IsOptional()
        @IsString()
        public secret?: string;
    
        @IsOptional()
        @IsString()
        public tempsecret?: string;
    }
    
    export default CreateUserDto;




    /*

import { IsOptional, IsString, ValidateNested, IsEnum, IsNotEmpty, IsEmail } from "class-validator";

import CreateAddressDto from "./address.dto";
import { Type } from 'class-transformer';

class CreateUserDto {
    @IsString()
    public firstName: string;

    @IsString()
    public lastName: string;

    @IsString()
    public phoneNumber: string;

    @IsEmail()
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


    */