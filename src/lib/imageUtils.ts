/**
 * Shared image utility functions for consistent error handling and Cloudinary URL optimization.
 */

/** Fallback image URL used across the app when product images fail to load */
export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop";

/** Fallback image URL for smaller thumbnails */
export const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop";

/**
 * Stable onError handler for product images.
 * Use this instead of creating inline arrow functions to prevent re-renders.
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
};

/**
 * Stable onError handler for thumbnail images.
 */
export const handleThumbnailError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  (e.target as HTMLImageElement).src = FALLBACK_THUMBNAIL;
};

/**
 * Appends Cloudinary transforms for responsive sizing.
 * Only applies to Cloudinary-hosted URLs.
 */
export function getResponsiveImageUrl(
  url: string,
  width?: number,
  height?: number,
  crop: string = "fill"
): string {
  if (!url || !url.includes("cloudinary.com")) return url;

  // If URL already has transforms, don't double-apply
  if (url.includes("/w_") || url.includes("/h_")) return url;

  const transforms: string[] = ["f_auto", "q_auto"];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop && (width || height)) transforms.push(`c_${crop}`);

  // Insert transforms before the version segment
  return url.replace(
    "/upload/",
    `/upload/${transforms.join(",")}/`
  );
}
