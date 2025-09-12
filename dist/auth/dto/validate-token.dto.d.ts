export declare class ValidateTokenDto {
    idToken: string;
}
export declare class ValidateTokenResponseDto {
    valid: boolean;
    user: {
        uid: string;
        email: string | undefined;
        displayName: string | undefined;
        photoURL: string | undefined;
        provider: string | undefined;
    };
}
