import { Product } from "@/types/user";

/**
 * Maps raw API product data to the Product type expected by ProductCard and other components.
 * Centralized here to avoid duplication across Shop, FeaturedProducts, and TopOffers.
 */
export function mapProduct(p: any): Product {
  // Images come from DB as { url, alt, isPrimary } objects
  const imageUrl =
    p.thumbnailUrl ||
    p.images?.find((i: any) => i.isPrimary)?.url ||
    p.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop";

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.categorySlug || p.category?.slug || "accessories",
    price: p.price,
    offerPrice: p.offerPrice || undefined,
    image: imageUrl,
    rating: p.averageRating || p.rating || 0,
    description: p.description || "",
    shortDescription: p.shortDescription || "",
    inStock:
      p.inStock !== false &&
      (p.stockQuantity === undefined || p.stockQuantity > 0),
    featured: p.isFeatured || false,
    isTopOffer: false,
    variants: p.variants,
  };
}
