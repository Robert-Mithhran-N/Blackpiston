// ============================================================
// Environment Variable Validation — Fail fast on missing secrets
// ============================================================

const REQUIRED_ENV_VARS = [
    'DATABASE_URL',
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
] as const;

const OPTIONAL_ENV_VARS = [
    'GEMINI_API_KEY',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'RAZORPAY_WEBHOOK_SECRET',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
] as const;

export function validateEnvironment(): void {
    console.log('🔐 Validating environment variables...');

    const missing: string[] = [];

    for (const key of REQUIRED_ENV_VARS) {
        if (!process.env[key] || process.env[key]!.trim() === '') {
            missing.push(key);
        }
    }

    if (missing.length > 0) {
        console.error(`\n❌ CRITICAL: Missing required environment variables:\n`);
        for (const key of missing) {
            console.error(`   • ${key}`);
        }
        console.error(`\n   Set these in your .env file and restart the server.\n`);
        process.exit(1);
    }

    // Warn about optional but recommended vars
    const warnings: string[] = [];
    for (const key of OPTIONAL_ENV_VARS) {
        if (!process.env[key] || process.env[key]!.trim() === '') {
            warnings.push(key);
        }
    }

    if (warnings.length > 0) {
        console.warn(`⚠️  Optional environment variables not set (features may be limited):`);
        for (const key of warnings) {
            console.warn(`   • ${key}`);
        }
    }

    // Safety checks
    if (process.env.JWT_SECRET === 'default-secret' || process.env.JWT_SECRET === 'secret') {
        console.error('❌ CRITICAL: JWT_SECRET is set to an insecure default value. Use a strong random secret.');
        process.exit(1);
    }

    if (process.env.JWT_SECRET!.length < 32) {
        console.warn('⚠️  JWT_SECRET is shorter than 32 characters. Consider using a longer, more secure secret.');
    }

    console.log('✅ Environment validation passed');
}
