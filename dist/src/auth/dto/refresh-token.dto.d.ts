export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class RefreshTokenResponseDto {
    success: boolean;
    idToken?: string;
    refreshToken?: string;
    expiresIn?: string;
    error?: string;
}
