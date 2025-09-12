import { AuthService } from './auth.service';
import type { AuthenticatedRequest } from './firebase-auth.guard';
import { ValidateTokenDto, ValidateTokenResponseDto } from './dto/validate-token.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    validateToken(validateTokenDto: ValidateTokenDto): Promise<ValidateTokenResponseDto>;
    logout(req: AuthenticatedRequest): Promise<{
        success: boolean;
    }>;
}
