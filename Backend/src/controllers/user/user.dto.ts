import { IsOptional, IsString, ValidateNested, IsEnum, IsNotEmpty, IsNumber, IsEmail, ValidateIf, Matches, MaxLength } from "class-validator";

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
    
        // Business registration applies only to Professionals.
        @ValidateIf(o => o.userType === 'Professional')
        @IsString({ message: 'DBA must be text.' })
        @Matches(/\S/, { message: 'DBA is required.' })
        @MaxLength(200, { message: 'DBA must be at most 200 characters.' })
        public dba?: string;

        // Business registration applies only to Professionals.
        @ValidateIf(o => o.userType === 'Professional')
        @IsString({ message: 'GST Number must be text.' })
        @Matches(/\S/, { message: 'GST Number is required.' })
        @MaxLength(50, { message: 'GST Number must be at most 50 characters.' })
        public gstNumber?: string;

        // Business registration applies only to Professionals.
        @ValidateIf(o => o.userType === 'Professional')
        @IsString({ message: 'PST Number must be text.' })
        @Matches(/\S/, { message: 'PST Number is required.' })
        @MaxLength(50, { message: 'PST Number must be at most 50 characters.' })
        public pstNumber?: string;

        // Business registration applies only to Professionals.
        @ValidateIf(o => o.userType === 'Professional' && o.businessNumber !== undefined && o.businessNumber !== null && o.businessNumber !== '')
        @IsString({ message: 'Business Number must be text.' })
        @Matches(/\S/, { message: 'Business Number must not be blank.' })
        @MaxLength(50, { message: 'Business Number must be at most 50 characters.' })
        public businessNumber?: string;

        // Business registration applies only to Professionals.
        @ValidateIf(o => o.userType === 'Professional' && o.dunsNumber !== undefined && o.dunsNumber !== null && o.dunsNumber !== '')
        @IsString({ message: 'D-U-N-S Number must be text.' })
        @Matches(/\S/, { message: 'D-U-N-S Number must not be blank.' })
        @MaxLength(50, { message: 'D-U-N-S Number must be at most 50 characters.' })
        public dunsNumber?: string;

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