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
