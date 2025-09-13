import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { FirebaseService } from '../common/firebase/firebase.service';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    uid: string;
    email: string | undefined;
    displayName: string | undefined;
    photoURL: string | undefined;
  };
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(private firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('Missing or invalid Authorization header');
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      this.logger.warn('Missing Firebase ID token');
      throw new UnauthorizedException('Missing Firebase ID token');
    }

    try {
      const decodedToken = await this.firebaseService.verifyIdToken(idToken);

      // Attach user information to the request object
      request.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture,
      };

      this.logger.debug(`Authenticated user: ${decodedToken.uid}`);
      return true;
    } catch (error) {
      this.logger.error('Token verification failed:', error);
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }
}