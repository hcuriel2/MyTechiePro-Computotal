import { Address } from './address';
import { Company } from './company';

export class User {
    _id: string;
    firstName: string;
    dba?: string;
    gstNumber?: string;
    pstNumber?: string;
    businessNumber?: string;
    dunsNumber?: string;
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
    // Login request only: despite the legacy property name, this holds the 6-digit
    // authenticator code. The server never sends the actual shared key to the client.
    secret?: string;
    // Backend-only pending key. The API strips this from user responses; the client
    // relies on mfaEnabled instead of ever receiving this value.
    tempSecret?: string;
    // True when this account has finished authenticator setup.
    mfaEnabled?: boolean;

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

