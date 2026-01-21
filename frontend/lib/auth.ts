import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthUser {
    userId: string;
    email: string;
    role: string;
}

/**
 * Verify JWT token and return decoded user
 */
export function verifyToken(token: string): AuthUser | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
        return decoded;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

/**
 * Extract token from Authorization header
 */
export function getTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    
    return authHeader.substring(7);
}

/**
 * Get authenticated user from request
 */
export function getAuthUser(request: NextRequest): AuthUser | null {
    const token = getTokenFromRequest(request);
    
    if (!token) {
        return null;
    }
    
    return verifyToken(token);
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser | null, allowedRoles: string[]): boolean {
    if (!user) {
        return false;
    }
    
    return allowedRoles.includes(user.role);
}
