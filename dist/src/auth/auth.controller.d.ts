import { AuthService } from './auth.service';
import type { AuthenticatedRequest } from './firebase-auth.guard';
import { ValidateTokenDto, ValidateTokenResponseDto } from './dto/validate-token.dto';
import { RefreshTokenDto, RefreshTokenResponseDto } from './dto/refresh-token.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    validateToken(validateTokenDto: ValidateTokenDto): Promise<ValidateTokenResponseDto>;
    logout(req: AuthenticatedRequest): Promise<{
        success: boolean;
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponseDto>;
}
