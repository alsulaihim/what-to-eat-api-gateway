import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase/firebase.service';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly databaseService: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      // Extract token from Authorization header
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Missing or invalid authorization header');
      }

      const token = authHeader.substring(7);

      // Verify Firebase token
      const decodedToken = await this.firebaseService.verifyIdToken(token);
      const firebaseUid = decodedToken.uid;

      // Get user from database
      const user = await this.databaseService.user.findUnique({
        where: { firebaseUid },
        select: {
          id: true,
          firebaseUid: true,
          email: true,
          displayName: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Check if user has admin privileges
      const isAdmin = await this.checkAdminPrivileges(user.email, firebaseUid);

      if (!isAdmin) {
        throw new ForbiddenException('Admin privileges required');
      }

      // Add user info to request for use in controllers
      request.user = {
        ...user,
        isAdmin: true,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Token validation failed');
    }
  }

  /**
   * Check if user has admin privileges
   * In production, this could check against:
   * - Database admin role table
   * - Firebase custom claims
   * - Environment variable whitelist
   * - External admin management system
   */
  private async checkAdminPrivileges(email: string, firebaseUid: string): Promise<boolean> {
    try {
      // Method 1: Check Firebase custom claims (recommended)
      try {
        const userRecord = await this.firebaseService.getUserByUid(firebaseUid);
        const customClaims = userRecord.customClaims;
        if (customClaims && customClaims.admin === true) {
          return true;
        }
      } catch (error) {
        // Continue to other methods if Firebase claims check fails
      }

      // Method 2: Environment variable admin list (for development/emergency)
      const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
      if (adminEmails.includes(email)) {
        return true;
      }

      // Method 3: Database-based admin roles (if you extend the schema)
      // You could add an AdminUsers table or isAdmin boolean to User table
      // const adminUser = await this.databaseService.adminUser.findUnique({
      //   where: { firebaseUid }
      // });
      // if (adminUser && adminUser.isActive) {
      //   return true;
      // }

      return false;
    } catch (error) {
      // Log error but don't grant admin access
      console.error('Error checking admin privileges:', error);
      return false;
    }
  }
}