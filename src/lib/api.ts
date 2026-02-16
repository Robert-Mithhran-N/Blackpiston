// Centralized API client for BlackPiston Garage
// All frontend API calls go through here

const API_BASE = "http://localhost:3001/api";

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("blackpiston_user_token");
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

export async function uploadImages(files: File[]): Promise<{ url: string; filename: string }[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const token = localStorage.getItem("blackpiston_user_token");
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/upload/images`, {
        method: "POST",
        headers,
        body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload images");
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
    if (!res.ok) throw new Error("Failed to create product");
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
    if (!res.ok) throw new Error("Failed to update product");
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
