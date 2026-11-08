// Legacy accounts and cookies start at version zero. Recovery and factor changes
// advance the stored version so old cookies cannot authorize subsequent requests.
export function sessionVersionMatches(user: any, token: any): boolean {
    return (token.sessionVersion === undefined ? 0 : token.sessionVersion) ===
        (user.sessionVersion || 0) && (!user.secret || token.mfaVerified === true);
}
