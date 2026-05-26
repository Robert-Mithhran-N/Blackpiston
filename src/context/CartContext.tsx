import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, Product } from "@/types/user";

interface CartContextType {
    cartItems: CartItem[];
    cartCount: number;
    cartTotal: number;
    cartShippingTotal: number;
    addToCart: (product: Product, quantity?: number, variantId?: string, variantLabel?: string) => void;
    removeFromCart: (productId: string, variantId?: string) => void;
    updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "blackpiston_cart";

function getStoredCart(): CartItem[] {
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>(getStoredCart);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }, [cartItems]);

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const cartTotal = cartItems.reduce((sum, item) => {
        const variant = item.variantId && item.product.variants
            ? item.product.variants.find(v => v.id === item.variantId)
            : null;
        const price = variant?.price ?? item.product.offerPrice ?? item.product.price;
        return sum + price * item.quantity;
    }, 0);

    const cartShippingTotal = cartItems.reduce((sum, item) => {
        const variant = item.variantId && item.product.variants
            ? item.product.variants.find(v => v.id === item.variantId)
            : null;
        const deliveryCharge = variant?.deliveryCharge ?? item.product.deliveryCharge ?? 0;
        return sum + deliveryCharge * item.quantity;
    }, 0);

    const addToCart = (product: Product, quantity = 1, variantId?: string, variantLabel?: string) => {
        setCartItems(prev => {
            const existingIndex = prev.findIndex(
                item => item.product.id === product.id && item.variantId === variantId
            );
            if (existingIndex >= 0) {
                return prev.map((item, i) =>
                    i === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prev, { product, variantId, variantLabel, quantity }];
        });
    };

    const removeFromCart = (productId: string, variantId?: string) => {
        setCartItems(prev =>
            prev.filter(item => !(item.product.id === productId && item.variantId === variantId))
        );
    };

    const updateQuantity = (productId: string, variantId: string | undefined, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId, variantId);
            return;
        }
        setCartItems(prev =>
            prev.map(item =>
                item.product.id === productId && item.variantId === variantId
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => setCartItems([]);

    return (
        <CartContext.Provider value={{ cartItems, cartCount, cartTotal, cartShippingTotal, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
}
