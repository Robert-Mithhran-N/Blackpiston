import crypto from 'crypto';
import prisma from '../config/database.js';
import { getRazorpayWebhookSecret } from '../config/razorpay.js';
import { handlePaymentSuccess, handlePaymentFailure } from './paymentService.js';

/**
 * Verify Razorpay webhook signature using HMAC SHA256.
 */
export function verifyWebhookSignature(body: string | Buffer, signature: string): boolean {
    const secret = getRazorpayWebhookSecret();
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

    try {
        return crypto.timingSafeEqual(
            Buffer.from(expectedSignature, 'hex'),
            Buffer.from(signature, 'hex')
        );
    } catch {
        return false;
    }
}

/**
 * Process a Razorpay webhook event idempotently.
 * Returns true if the event was processed, false if it was a duplicate.
 */
export async function processWebhookEvent(
    eventId: string,
    eventType: string,
    payload: any
): Promise<boolean> {
    // Check if we already processed this event (idempotency)
    const existing = await prisma.webhookEvent.findUnique({
        where: { eventId },
    });

    if (existing?.processed) {
        console.log(`⏭️  Webhook event already processed: ${eventId}`);
        return false;
    }

    // Store the event
    if (!existing) {
        await prisma.webhookEvent.create({
            data: {
                eventId,
                eventType,
                payload,
                processed: false,
            },
        });
    }

    try {
        // Route to the appropriate handler
        switch (eventType) {
            case 'payment.captured':
                await handlePaymentCaptured(payload);
                break;
            case 'payment.failed':
                await handlePaymentFailed(payload);
                break;
            case 'order.paid':
                await handleOrderPaid(payload);
                break;
            case 'refund.processed':
                await handleRefundProcessed(payload);
                break;
            default:
                console.log(`ℹ️  Unhandled webhook event type: ${eventType}`);
        }

        // Mark as processed
        await prisma.webhookEvent.update({
            where: { eventId },
            data: {
                processed: true,
                processedAt: new Date(),
            },
        });

        return true;
    } catch (error) {
        console.error(`❌ Failed to process webhook event ${eventId}:`, error);
        throw error;
    }
}

// ============================================================
// Webhook Event Handlers
// ============================================================

/**
 * Handle payment.captured webhook — backup for frontend verify.
 * This is the source of truth for payment state.
 */
async function handlePaymentCaptured(payload: any): Promise<void> {
    const paymentEntity = payload.payment?.entity;
    if (!paymentEntity) return;

    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;

    // Find the order by razorpayOrderId
    const order = await prisma.order.findFirst({
        where: { razorpayOrderId },
    });

    if (!order) {
        console.warn(`⚠️  Webhook: Order not found for razorpay_order_id: ${razorpayOrderId}`);
        return;
    }

    // Already paid — idempotent
    if (order.paymentStatus === 'PAID') {
        // Just update the webhook verification flag
        await prisma.payment.updateMany({
            where: { orderId: order.id },
            data: { webhookVerified: true },
        });
        return;
    }

    // Mark as paid via the success handler
    await handlePaymentSuccess(order.id, razorpayPaymentId, '');

    // Mark webhook verification
    await prisma.payment.updateMany({
        where: { orderId: order.id },
        data: { webhookVerified: true },
    });

    console.log(`✅ Webhook: Payment captured for order ${order.orderNumber}`);
}

/**
 * Handle payment.failed webhook.
 */
async function handlePaymentFailed(payload: any): Promise<void> {
    const paymentEntity = payload.payment?.entity;
    if (!paymentEntity) return;

    const razorpayOrderId = paymentEntity.order_id;
    const errorDescription = paymentEntity.error_description || 'Payment failed';

    const order = await prisma.order.findFirst({
        where: { razorpayOrderId },
    });

    if (!order) {
        console.warn(`⚠️  Webhook: Order not found for razorpay_order_id: ${razorpayOrderId}`);
        return;
    }

    // Don't override a successful payment
    if (order.paymentStatus === 'PAID') return;

    await handlePaymentFailure(order.id, `Webhook: ${errorDescription}`);

    console.log(`❌ Webhook: Payment failed for order ${order.orderNumber}: ${errorDescription}`);
}

/**
 * Handle order.paid webhook — redundant confirmation.
 */
async function handleOrderPaid(payload: any): Promise<void> {
    const orderEntity = payload.order?.entity;
    if (!orderEntity) return;

    const razorpayOrderId = orderEntity.id;

    const order = await prisma.order.findFirst({
        where: { razorpayOrderId },
    });

    if (!order) return;

    // If somehow the order isn't marked as paid yet, we don't have the
    // payment_id/signature here, so just log it. payment.captured handles the actual update.
    if (order.paymentStatus !== 'PAID') {
        console.log(`ℹ️  Webhook: order.paid received but order ${order.orderNumber} not yet marked as PAID. Waiting for payment.captured.`);
    }
}

/**
 * Handle refund.processed webhook.
 */
async function handleRefundProcessed(payload: any): Promise<void> {
    const refundEntity = payload.refund?.entity;
    if (!refundEntity) return;

    const razorpayPaymentId = refundEntity.payment_id;
    const refundAmount = refundEntity.amount / 100; // Convert from paise
    const refundId = refundEntity.id;

    // Find payment by razorpayPaymentId
    const payment = await prisma.payment.findFirst({
        where: { razorpayPaymentId },
        include: { order: true },
    });

    if (!payment) {
        console.warn(`⚠️  Webhook: Payment not found for razorpay_payment_id: ${razorpayPaymentId}`);
        return;
    }

    // Update payment with refund details
    const isFullRefund = refundAmount >= payment.amountDue;
    await prisma.payment.update({
        where: { id: payment.id },
        data: {
            refundStatus: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
            refundAmount: refundAmount,
            refundId: refundId,
            paymentStatus: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
            webhookVerified: true,
        },
    });

    // Update order
    await prisma.order.update({
        where: { id: payment.orderId },
        data: {
            paymentStatus: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        },
    });

    console.log(`💰 Webhook: Refund processed for order ${payment.order.orderNumber}: ₹${refundAmount}`);
}
