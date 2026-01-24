/**
 * Environment variable validation and configuration
 * Ensures all required environment variables are present at runtime
 */

interface EnvConfig {
    DATABASE_URL: string;
    DIRECT_URL: string;
    JWT_SECRET: string;
    NODE_ENV: 'development' | 'production' | 'test';
}

function validateEnv(): EnvConfig {
    const required = ['DATABASE_URL', 'JWT_SECRET'];
    const missing: string[] = [];

    for (const key of required) {
        if (!process.env[key]) {
            missing.push(key);
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            `Please check your .env file and ensure all required variables are set.\n` +
            `See .env.example for reference.`
        );
    }

    // Validate JWT_SECRET strength
    const jwtSecret = process.env.JWT_SECRET!;
    if (jwtSecret === 'your-secret-key-change-in-production' || 
        jwtSecret === 'your-secret-key-change-in-production-generate-with-crypto-randomBytes' ||
        jwtSecret.length < 32) {
        throw new Error(
            'JWT_SECRET is insecure!\n' +
            'Generate a secure secret with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"\n' +
            'Never use default or short secrets in production.'
        );
    }

    return {
        DATABASE_URL: process.env.DATABASE_URL!,
        DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL!,
        JWT_SECRET: jwtSecret,
        NODE_ENV: (process.env.NODE_ENV as any) || 'development',
    };
}

// Validate on module load
let env: EnvConfig;

try {
    env = validateEnv();
} catch (error) {
    console.error('❌ Environment validation failed:');
    console.error((error as Error).message);
    process.exit(1);
}

export default env;
