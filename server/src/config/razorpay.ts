import Razorpay from 'razorpay';

// Validate required environment variables at startup
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.warn(
        '⚠️  Razorpay keys not configured. Payment features will be disabled.\n' +
        '   Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.'
    );
}

// Create Razorpay instance (may be null if keys not set)
let razorpayInstance: InstanceType<typeof Razorpay> | null = null;

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
    });
    console.log('✅ Razorpay initialized successfully');
}

export function getRazorpayInstance(): InstanceType<typeof Razorpay> {
    if (!razorpayInstance) {
        throw new Error('Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
    }
    return razorpayInstance;
}

export function getRazorpayKeyId(): string {
    if (!RAZORPAY_KEY_ID) {
        throw new Error('RAZORPAY_KEY_ID is not configured.');
    }
    return RAZORPAY_KEY_ID;
}

export function getRazorpayKeySecret(): string {
    if (!RAZORPAY_KEY_SECRET) {
        throw new Error('RAZORPAY_KEY_SECRET is not configured.');
    }
    return RAZORPAY_KEY_SECRET;
}

export function getRazorpayWebhookSecret(): string {
    if (!RAZORPAY_WEBHOOK_SECRET) {
        throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured.');
    }
    return RAZORPAY_WEBHOOK_SECRET;
}

export { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET };
