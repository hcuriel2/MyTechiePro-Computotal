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

export type AdminRole = "Admin" | "Editor" | "Read-only";

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    password: string;
    userType: "Admin" | "Client" | "Professional";
    adminRole?: AdminRole;
    address?: Address;
    company?: string;
    dba?: string;
    gstNumber?: string;
    pstNumber?: string;
    businessNumber?: string;
    dunsNumber?: string;
    proStatus?: "Busy" | "Active";
    skills?: string[];
    unitPrice?: number;
    ratingSum?: number;
    ratingCount?: number;
    rating?: number;
    unitType?: "Hour" | "Solution" | "Flat fee";
    bio?: string;
    inquiry?: string;
    performance?: Performance[];
    website?: string;
    // Internal MFA fields: `secret` is the active TOTP key; `tempSecret` is an
    // enrollment or replacement key that is not active until a code is confirmed.
    secret?: string;
    tempSecret?: string;
    approved: boolean;
    verified: boolean;
    verificationToken?: string;
    verificationTokenUsed?: boolean;
    verificationSessionId?: string;
}

export default User;
