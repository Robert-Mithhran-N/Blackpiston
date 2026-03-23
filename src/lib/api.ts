// Centralized API client for BlackPiston Garage
// All frontend API calls go through here

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function getAuthToken(): string | null {
    // Check admin auth first (stored as JSON { user, token })
    try {
        const adminRaw = localStorage.getItem("blackpiston_admin_auth");
        if (adminRaw) {
            const parsed = JSON.parse(adminRaw);
            if (parsed?.token) return parsed.token;
        }
    } catch { /* ignore */ }

    // Fallback to user token
    return localStorage.getItem("blackpiston_user_token");
}

function getAuthHeaders(): Record<string, string> {
    const token = getAuthToken();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

// ============================================================
// Products
// ============================================================

export async function fetchProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    brand?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    featured?: boolean;
    minPrice?: number;
    maxPrice?: number;
}) {
    const searchParams = new URLSearchParams();
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.set(key, String(value));
            }
        });
    }

    const res = await fetch(`${API_BASE}/products?${searchParams.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
}

export async function fetchProductById(idOrSlug: string) {
    const res = await fetch(`${API_BASE}/products/${idOrSlug}`);
    if (!res.ok) throw new Error("Failed to fetch product");
    return res.json();
}

export async function fetchCategories() {
    const res = await fetch(`${API_BASE}/products/categories/all`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
}

export async function fetchCategoryTree() {
    const res = await fetch(`${API_BASE}/products/categories/tree`);
    if (!res.ok) throw new Error("Failed to fetch category tree");
    return res.json();
}

export async function fetchCategoryChildren(parentId: string) {
    const res = await fetch(`${API_BASE}/products/categories/${parentId}/children`);
    if (!res.ok) throw new Error("Failed to fetch sub-categories");
    return res.json();
}

export async function fetchProductsByCategory(
    slug: string,
    params?: { page?: number; limit?: number }
) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const res = await fetch(
        `${API_BASE}/products/category/${slug}?${searchParams.toString()}`
    );
    if (!res.ok) throw new Error("Failed to fetch products by category");
    return res.json();
}

export async function fetchFeaturedProducts() {
    const res = await fetch(`${API_BASE}/products/featured/list`);
    if (!res.ok) throw new Error("Failed to fetch featured products");
    return res.json();
}

export async function fetchTopOffers() {
    const res = await fetch(`${API_BASE}/products/offers/top`);
    if (!res.ok) throw new Error("Failed to fetch top offers");
    return res.json();
}

// ============================================================
// Image Upload
// ============================================================

export async function uploadImages(files: File[]): Promise<{ url: string; public_id: string; filename: string }[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/upload/images`, {
        method: "POST",
        headers,
        body: formData,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to upload images");
    }
    const data = await res.json();
    return data.files;
}

// ============================================================
// Admin APIs
// ============================================================

export async function fetchDashboardStats() {
    const res = await fetch(`${API_BASE}/admin/dashboard/stats`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch dashboard stats");
    return res.json();
}

export async function fetchAdminProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
}) {
    const searchParams = new URLSearchParams();
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.set(key, String(value));
            }
        });
    }
    const res = await fetch(
        `${API_BASE}/admin/products?${searchParams.toString()}`,
        { headers: getAuthHeaders() }
    );
    if (!res.ok) throw new Error("Failed to fetch admin products");
    return res.json();
}

export async function createProduct(data: Record<string, unknown>) {
    const res = await fetch(`${API_BASE}/admin/products`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create product");
    }
    return res.json();
}

export async function updateProduct(
    id: string,
    data: Record<string, unknown>
) {
    const res = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update product");
    }
    return res.json();
}

export async function deleteProduct(id: string) {
    const res = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete product");
    return res.json();
}

// ============================================================
// Categories Admin
// ============================================================

export async function createCategory(data: Record<string, unknown>) {
    const res = await fetch(`${API_BASE}/admin/categories`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create category");
    }
    return res.json();
}

export async function updateCategory(id: string, data: Record<string, unknown>) {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update category");
    }
    return res.json();
}

export async function deleteCategory(id: string) {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete category");
    return res.json();
}

export async function fetchAdminOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
}) {
    const searchParams = new URLSearchParams();
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.set(key, String(value));
            }
        });
    }
    const res = await fetch(
        `${API_BASE}/orders/admin/all?${searchParams.toString()}`,
        { headers: getAuthHeaders() }
    );
    if (!res.ok) throw new Error("Failed to fetch admin orders");
    return res.json();
}

export async function updateOrderStatus(
    orderId: string,
    data: { status: string; trackingNumber?: string; note?: string }
) {
    const res = await fetch(
        `${API_BASE}/orders/admin/${orderId}/status`,
        {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        }
    );
    if (!res.ok) throw new Error("Failed to update order status");
    return res.json();
}

export async function fetchAdminPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    method?: string;
}) {
    const searchParams = new URLSearchParams();
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.set(key, String(value));
            }
        });
    }
    const res = await fetch(
        `${API_BASE}/admin/payments?${searchParams.toString()}`,
        { headers: getAuthHeaders() }
    );
    if (!res.ok) throw new Error("Failed to fetch payments");
    return res.json();
}

export async function fetchAdminRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
}) {
    const searchParams = new URLSearchParams();
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.set(key, String(value));
            }
        });
    }
    const res = await fetch(
        `${API_BASE}/admin/requests?${searchParams.toString()}`,
        { headers: getAuthHeaders() }
    );
    if (!res.ok) throw new Error("Failed to fetch requests");
    return res.json();
}

export async function updateRequest(
    id: string,
    data: { status?: string; adminNotes?: string }
) {
    const res = await fetch(`${API_BASE}/admin/requests/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update request");
    return res.json();
}

export async function fetchLowStockProducts() {
    const res = await fetch(`${API_BASE}/admin/inventory/low-stock`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch low stock products");
    return res.json();
}

export async function fetchAdminUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
}) {
    const searchParams = new URLSearchParams();
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.set(key, String(value));
            }
        });
    }
    const res = await fetch(
        `${API_BASE}/admin/users?${searchParams.toString()}`,
        { headers: getAuthHeaders() }
    );
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
}

export async function fetchAdminTopOffers() {
    const res = await fetch(`${API_BASE}/admin/top-offers`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch top offers");
    return res.json();
}

export async function createTopOffer(data: Record<string, unknown>) {
    const res = await fetch(`${API_BASE}/admin/top-offers`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create top offer");
    return res.json();
}

export async function updateTopOffer(
    id: string,
    data: Record<string, unknown>
) {
    const res = await fetch(`${API_BASE}/admin/top-offers/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update top offer");
    return res.json();
}

export async function deleteTopOffer(id: string) {
    const res = await fetch(`${API_BASE}/admin/top-offers/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete top offer");
    return res.json();
}

// ============================================================
// Categories
// ============================================================

export async function fetchCategoriesByType() {
    const res = await fetch(
        `${API_BASE}/products/categories/all`
    );
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
}

// ============================================================
// Search & Tags
// ============================================================

export async function searchProducts(params: {
    q?: string;
    tags?: string;
    page?: number;
    limit?: number;
}) {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set("q", params.q);
    if (params.tags) searchParams.set("tags", params.tags);
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));

    const res = await fetch(
        `${API_BASE}/products/search?${searchParams.toString()}`
    );
    if (!res.ok) throw new Error("Search failed");
    return res.json();
}

export async function fetchTagSuggestions(prefix: string) {
    const params = new URLSearchParams({ prefix });
    const res = await fetch(
        `${API_BASE}/products/tags/suggestions?${params.toString()}`
    );
    if (!res.ok) throw new Error("Failed to fetch tag suggestions");
    return res.json();
}

// ============================================================
// Admin Categories (CRUD) - Removed duplicate functions
// ============================================================

// ============================================================
// User Profile & Addresses
// ============================================================

export async function updateProfile(data: { name?: string; phone?: string }) {
    const res = await fetch(`${API_BASE}/users/update`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update profile");
    }
    return res.json();
}

export async function updatePassword(data: { currentPassword?: string; newPassword?: string }) {
    const res = await fetch(`${API_BASE}/users/password`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update password");
    }
    return res.json();
}

export async function addSavedAddress(data: Record<string, any>) {
    const res = await fetch(`${API_BASE}/users/addresses`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to add address");
    }
    return res.json();
}

export async function updateSavedAddress(id: string, data: Record<string, any>) {
    const res = await fetch(`${API_BASE}/users/addresses/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update address");
    }
    return res.json();
}

export async function deleteSavedAddress(id: string) {
    const res = await fetch(`${API_BASE}/users/addresses/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete address");
    }
    return res.json();
}

// ============================================================
// User Orders
// ============================================================

export async function fetchMyOrders(params?: {
    page?: number;
    limit?: number;
}) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const res = await fetch(
        `${API_BASE}/orders/my-orders?${searchParams.toString()}`,
        { headers: getAuthHeaders() }
    );
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
}

export async function placeOrder(data: {
    products: {
        productId: string;
        name: string;
        sku?: string;
        image?: string;
        quantity: number;
        unitPrice: number;
        variantSize?: string;
        variantColor?: string;
    }[];
    shippingAddress: Record<string, string>;
    billingAddress?: Record<string, string>;
    paymentMethod?: string;
    couponCode?: string;
}) {
    const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to place order");
    }
    return res.json();
}

export async function cancelOrder(orderId: string, reason?: string) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to cancel order");
    }
    return res.json();
}

// ============================================================
// Stock Verification (pre-checkout)
// ============================================================

export async function verifyStock(items: {
    productId: string;
    variantId?: string;
    quantity: number;
}[]): Promise<{
    available: boolean;
    items: {
        productId: string;
        variantId?: string;
        requested: number;
        currentStock: number;
        available: boolean;
        productName?: string;
    }[];
}> {
    const res = await fetch(`${API_BASE}/orders/verify-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to verify stock");
    }
    return res.json();
    return res.json();
}

// ============================================================
// Admin - Blog
// ============================================================

export async function fetchAdminBlog(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status) searchParams.set("status", params.status);

    const res = await fetch(`${API_BASE}/admin/blog?${searchParams.toString()}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch blogs");
    return res.json();
}

export async function createBlogPost(data: any) {
    const res = await fetch(`${API_BASE}/admin/blog`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create blog post");
    return res.json();
}

export async function updateBlogPost(id: string, data: any) {
    const res = await fetch(`${API_BASE}/admin/blog/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update blog post");
    return res.json();
}

export async function deleteBlogPost(id: string) {
    const res = await fetch(`${API_BASE}/admin/blog/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete blog post");
    return res.json();
}

// ============================================================
// Admin - Services
// ============================================================

export async function fetchAdminServices(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status) searchParams.set("status", params.status);

    const res = await fetch(`${API_BASE}/admin/services?${searchParams.toString()}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch services");
    return res.json();
}

export async function createService(data: any) {
    const res = await fetch(`${API_BASE}/admin/services`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create service");
    return res.json();
}

export async function updateService(id: string, data: any) {
    const res = await fetch(`${API_BASE}/admin/services/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update service");
    return res.json();
}

export async function deleteService(id: string) {
    const res = await fetch(`${API_BASE}/admin/services/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete service");
    return res.json();
}

// ============================================================
// Admin - Builds
// ============================================================

export async function fetchAdminBuilds(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status) searchParams.set("status", params.status);

    const res = await fetch(`${API_BASE}/admin/builds?${searchParams.toString()}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch builds");
    return res.json();
}

export async function createBuild(data: any) {
    const res = await fetch(`${API_BASE}/admin/builds`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create build");
    return res.json();
}

export async function updateBuild(id: string, data: any) {
    const res = await fetch(`${API_BASE}/admin/builds/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update build");
    return res.json();
}

export async function deleteBuild(id: string) {
    const res = await fetch(`${API_BASE}/admin/builds/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete build");
    return res.json();
}

// ============================================================
// Admin - Requests (Messages) & Payments & Appointments
// ============================================================

export async function deleteRequest(id: string) {
    const res = await fetch(`${API_BASE}/admin/requests/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete request");
    return res.json();
}

export async function updatePayment(id: string, data: { paymentStatus?: string; amountReceived?: number; receivedDate?: Date }) {
    const res = await fetch(`${API_BASE}/admin/payments/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update payment");
    return res.json();
}

export async function fetchAdminAppointments(params?: { page?: number; limit?: number; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.status) searchParams.set("status", params.status);

    const res = await fetch(`${API_BASE}/admin/appointments?${searchParams.toString()}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch appointments");
    return res.json();
}

export async function updateAppointment(id: string, data: any) {
    const res = await fetch(`${API_BASE}/admin/appointments/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update appointment");
    return res.json();
}

// ============================================================
// Coupons
// ============================================================

export async function applyCoupon(code: string, cartTotal: number) {
    const res = await fetch(`${API_BASE}/coupons/apply`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ code, cartTotal }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to apply coupon");
    }
    return res.json();
}

export async function fetchAdminCoupons() {
    const res = await fetch(`${API_BASE}/coupons/admin`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch coupons");
    return res.json();
}

export async function createCoupon(data: any) {
    const res = await fetch(`${API_BASE}/coupons/admin`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create coupon");
    }
    return res.json();
}

export async function updateCoupon(id: string, data: any) {
    const res = await fetch(`${API_BASE}/coupons/admin/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update coupon");
    }
    return res.json();
}

export async function deleteCoupon(id: string) {
    const res = await fetch(`${API_BASE}/coupons/admin/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete coupon");
    return res.json();
}

// ============================================================
// Wishlist
// ============================================================

export async function fetchWishlist() {
    const res = await fetch(`${API_BASE}/wishlist`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch wishlist");
    return res.json();
}

export async function addToWishlist(productId: string) {
    const res = await fetch(`${API_BASE}/wishlist/add`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to add to wishlist");
    }
    return res.json();
}

export async function removeFromWishlist(productId: string) {
    const res = await fetch(`${API_BASE}/wishlist/${productId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to remove from wishlist");
    }
    return res.json();
}

