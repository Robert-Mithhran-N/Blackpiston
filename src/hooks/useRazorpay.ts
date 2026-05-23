import { useState, useCallback, useRef } from "react";
import { createPaymentOrder, verifyPayment, retryPayment } from "@/lib/api";

// Razorpay checkout script URL
const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    theme?: {
        color?: string;
    };
    modal?: {
        ondismiss?: () => void;
        escape?: boolean;
        confirm_close?: boolean;
    };
    retry?: {
        enabled: boolean;
    };
    timeout?: number;
    notes?: Record<string, string>;
}

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => {
            open: () => void;
            close: () => void;
            on: (event: string, handler: (response: any) => void) => void;
        };
    }
}

export type PaymentState =
    | "idle"
    | "creating_order"
    | "awaiting_payment"
    | "verifying"
    | "success"
    | "failed"
    | "dismissed"
    | "error";

interface UseRazorpayReturn {
    paymentState: PaymentState;
    error: string | null;
    orderId: string | null;
    orderNumber: string | null;
    initiatePayment: (params: InitiatePaymentParams) => Promise<void>;
    retryFailedPayment: (orderId: string) => Promise<void>;
    reset: () => void;
}

interface InitiatePaymentParams {
    items: { productId: string; variantId?: string; quantity: number }[];
    shippingAddress: Record<string, string>;
    billingAddress?: Record<string, string>;
    couponCode?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
}

/**
 * Load Razorpay checkout script dynamically.
 * Caches the promise so it only loads once.
 */
let scriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
    if (scriptPromise) return scriptPromise;

    scriptPromise = new Promise((resolve, reject) => {
        if (typeof window.Razorpay !== "undefined") {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = RAZORPAY_SCRIPT_URL;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
            scriptPromise = null;
            reject(new Error("Failed to load Razorpay SDK"));
        };
        document.body.appendChild(script);
    });

    return scriptPromise;
}

export function useRazorpay(): UseRazorpayReturn {
    const [paymentState, setPaymentState] = useState<PaymentState>("idle");
    const [error, setError] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [orderNumber, setOrderNumber] = useState<string | null>(null);

    // Prevent double-click / concurrent payments
    const isProcessingRef = useRef(false);

    const reset = useCallback(() => {
        setPaymentState("idle");
        setError(null);
        setOrderId(null);
        setOrderNumber(null);
        isProcessingRef.current = false;
    }, []);

    /**
     * Open Razorpay checkout modal with the given options.
     */
    const openRazorpayCheckout = useCallback(
        (
            razorpayData: {
                orderId: string;
                amount: number;
                currency: string;
                key_id: string;
            },
            internalOrderId: string,
            prefill: { name?: string; email?: string; contact?: string }
        ): Promise<RazorpayResponse> => {
            return new Promise((resolve, reject) => {
                const options: RazorpayOptions = {
                    key: razorpayData.key_id,
                    amount: razorpayData.amount,
                    currency: razorpayData.currency,
                    name: "BlackPiston Garage",
                    description: "Purchase from BlackPiston Garage",
                    order_id: razorpayData.orderId,
                    handler: (response) => {
                        resolve(response);
                    },
                    prefill,
                    theme: {
                        color: "#f97316", // Orange theme matching the brand
                    },
                    modal: {
                        ondismiss: () => {
                            reject(new Error("PAYMENT_DISMISSED"));
                        },
                        escape: true,
                        confirm_close: true,
                    },
                    retry: {
                        enabled: false, // We handle retries ourselves
                    },
                    timeout: 300, // 5 minutes
                    notes: {
                        order_id: internalOrderId,
                    },
                };

                try {
                    const rzp = new window.Razorpay(options);
                    rzp.on("payment.failed", (response: any) => {
                        reject(
                            new Error(
                                response.error?.description || "Payment failed"
                            )
                        );
                    });
                    rzp.open();
                } catch (err: any) {
                    reject(new Error(err.message || "Failed to open payment"));
                }
            });
        },
        []
    );

    /**
     * Full payment flow: create order → open Razorpay → verify.
     */
    const initiatePayment = useCallback(
        async (params: InitiatePaymentParams) => {
            // Prevent duplicate payments
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;

            setPaymentState("creating_order");
            setError(null);

            try {
                // Step 1: Load Razorpay script
                await loadRazorpayScript();

                // Step 2: Create payment order on backend
                const result = await createPaymentOrder({
                    items: params.items,
                    shippingAddress: params.shippingAddress,
                    billingAddress: params.billingAddress,
                    couponCode: params.couponCode,
                });

                setOrderId(result.order.id);
                setOrderNumber(result.order.orderNumber);

                // Step 3: Open Razorpay checkout
                setPaymentState("awaiting_payment");

                const razorpayResponse = await openRazorpayCheckout(
                    result.razorpay,
                    result.order.id,
                    {
                        name: params.customerName,
                        email: params.customerEmail,
                        contact: params.customerPhone,
                    }
                );

                // Step 4: Verify payment on backend
                setPaymentState("verifying");

                await verifyPayment({
                    razorpay_order_id: razorpayResponse.razorpay_order_id,
                    razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                    razorpay_signature: razorpayResponse.razorpay_signature,
                    order_id: result.order.id,
                });

                setPaymentState("success");
            } catch (err: any) {
                if (err.message === "PAYMENT_DISMISSED") {
                    setPaymentState("dismissed");
                    setError("Payment was cancelled. You can retry anytime.");
                } else {
                    setPaymentState("failed");
                    setError(err.message || "Payment failed");
                }
            } finally {
                isProcessingRef.current = false;
            }
        },
        [openRazorpayCheckout]
    );

    /**
     * Retry a failed payment — creates new Razorpay order for existing DB order.
     */
    const retryFailedPayment = useCallback(
        async (failedOrderId: string) => {
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;

            setPaymentState("creating_order");
            setError(null);

            try {
                await loadRazorpayScript();

                const result = await retryPayment(failedOrderId);

                setOrderId(result.order.id);
                setOrderNumber(result.order.orderNumber);

                setPaymentState("awaiting_payment");

                const razorpayResponse = await openRazorpayCheckout(
                    result.razorpay,
                    result.order.id,
                    {}
                );

                setPaymentState("verifying");

                await verifyPayment({
                    razorpay_order_id: razorpayResponse.razorpay_order_id,
                    razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                    razorpay_signature: razorpayResponse.razorpay_signature,
                    order_id: result.order.id,
                });

                setPaymentState("success");
            } catch (err: any) {
                if (err.message === "PAYMENT_DISMISSED") {
                    setPaymentState("dismissed");
                    setError("Payment was cancelled. You can retry anytime.");
                } else {
                    setPaymentState("failed");
                    setError(err.message || "Payment retry failed");
                }
            } finally {
                isProcessingRef.current = false;
            }
        },
        [openRazorpayCheckout]
    );

    return {
        paymentState,
        error,
        orderId,
        orderNumber,
        initiatePayment,
        retryFailedPayment,
        reset,
    };
}
