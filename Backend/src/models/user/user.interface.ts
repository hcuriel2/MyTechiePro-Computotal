/*
// Original implementation
interface User {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    password: string;
    userType: string;
    address?: {
        street: string;
        city: string;
        lat: number;
        lng: number;
        placeid: string;
    };
    company : string;
    approved: Boolean;
    verified: Boolean;
}

export default User;
*/

interface Address {
    city: string;
    country?: string;
    street: string;
    postalCode?: string;
    lat: number;
    lng: number;
    placeid?: string;
}

interface Performance {
    rating: number;
    feedback: string;
    clientName: string;
    service: string;
}

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    password: string;
    userType: 'Admin' | 'Client' | 'Professional';
    address?: Address;
    company?: string;
    proStatus?: 'Busy' | 'Active';
    skills?: string[];
    unitPrice?: number;
    ratingSum?: number;
    ratingCount?: number;
    rating?: number;
    unitType?: 'Hour' | 'Solution' | 'Flat fee';
    bio?: string;
    inquiry?: string;
    performance?: Performance[];
    website?: string;
    secret?: string;
    tempSecret?: string;
    approved: boolean;
    verified: boolean;
}

export default User;
