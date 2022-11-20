import { Address } from './address';
import { Company } from './company';

export class User {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    password: string;
    userType: string;
    address: Address;
    company: Company;
    skills: any[];
    projects: any[];
    lat: number;
    lng: number;
    placeid: string;
    secret?: string;
    tempSecret?: string;

    // Professional's attributes
    alias: string;
    bio: string;
    proStatus: string;
    unitPrice: number;
    unitType: string;
    ratingSum: number;
    ratingCount: number;
    rating: string;
    website: string;
}

