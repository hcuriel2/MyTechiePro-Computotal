interface DataStoredInToken {
    _id: string;
    userType: string;
    sessionVersion?: number;
    mfaVerified?: boolean;
}

export default DataStoredInToken;
