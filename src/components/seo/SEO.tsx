import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogType?: "website" | "article" | "product";
  ogImage?: string;
  twitterCard?: "summary" | "summary_large_image";
  jsonLd?: Record<string, any> | Record<string, any>[];
  breadcrumbs?: BreadcrumbItem[];
  brandSeo?: boolean;
}

export const SEO = ({
  title,
  description = "Premium motorcycle gear, accessories, and professional workshop services at BlackPiston Garage. Shop helmets, riding jackets, custom parts, and book ECU tuning, styling, or maintenance.",
  keywords = [
    "BlackPiston",
    "Black Piston",
    "BlackPiston Garage",
    "PitShop",
    "BlackPiston India",
    "BlackPiston Garage India",
    "motorcycle gear",
    "riding helmets",
    "riding jackets",
    "bike exhaust",
    "motorcycle tuning",
    "garage services",
    "bike styling"
  ],
  canonicalUrl,
  ogType = "website",
  ogImage = "https://blackpistongarage.com/og-image.jpg",
  twitterCard = "summary_large_image",
  jsonLd,
  breadcrumbs,
  brandSeo = true,
}: SEOProps) => {
  const location = useLocation();

  useEffect(() => {
    // ── 1. Document Title ──
    const baseTitle = "BlackPiston Garage | Premium Motorcycle Gear & Custom Workshop";
    let finalTitle = baseTitle;

    if (title) {
      if (brandSeo) {
        finalTitle = `${title} | BlackPiston Garage`;
      } else {
        finalTitle = title;
      }
    }
    document.title = finalTitle;

    // ── 2. Meta Tags Helper ──
    const updateOrCreateMeta = (attr: string, attrVal: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${attrVal}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Standard Meta Tags
    updateOrCreateMeta("name", "description", description);
    updateOrCreateMeta("name", "keywords", keywords.join(", "));
    updateOrCreateMeta("name", "author", "BlackPiston Garage");
    updateOrCreateMeta("name", "robots", "index, follow");

    // OpenGraph Meta Tags
    const resolvedUrl = canonicalUrl || `${window.location.origin}${location.pathname}${location.search}`;
    updateOrCreateMeta("property", "og:title", title ? `${title} | BlackPiston` : "BlackPiston Garage");
    updateOrCreateMeta("property", "og:description", description);
    updateOrCreateMeta("property", "og:image", ogImage);
    updateOrCreateMeta("property", "og:url", resolvedUrl);
    updateOrCreateMeta("property", "og:type", ogType);
    updateOrCreateMeta("property", "og:site_name", "BlackPiston Garage");

    // Twitter Card Meta Tags
    updateOrCreateMeta("name", "twitter:card", twitterCard);
    updateOrCreateMeta("name", "twitter:title", title ? `${title} | BlackPiston` : "BlackPiston Garage");
    updateOrCreateMeta("name", "twitter:description", description);
    updateOrCreateMeta("name", "twitter:image", ogImage);
    updateOrCreateMeta("name", "twitter:site", "@BlackPistonGarage");

    // ── 3. Canonical Link ──
    let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", resolvedUrl);

    // ── 4. JSON-LD Schemas ──
    let script = document.getElementById("jsonld-seo") as HTMLScriptElement | null;
    if (script) {
      script.textContent = "";
    } else {
      script = document.createElement("script");
      script.id = "jsonld-seo";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    const defaultSchemas = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://blackpistongarage.com/#organization",
        "name": "BlackPiston Garage",
        "alternateName": ["Black Piston", "BlackPiston", "PitShop", "BlackPiston Garage India"],
        "url": "https://blackpistongarage.com",
        "logo": "https://blackpistongarage.com/logo.png",
        "sameAs": [
          "https://www.facebook.com/BlackPistonGarage",
          "https://www.instagram.com/blackpiston_garage",
          "https://twitter.com/BlackPistonG"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-9876543210",
          "contactType": "customer service",
          "areaServed": "IN",
          "availableLanguage": ["en", "hi"]
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": "https://blackpistongarage.com/#website",
        "name": "BlackPiston Garage",
        "url": "https://blackpistongarage.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://blackpistongarage.com/shop?search={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ];

    const schemasToInject: any[] = [...defaultSchemas];

    // Append dynamic breadcrumbs schema if provided
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.url.startsWith("http") ? item.url : `${window.location.origin}${item.url}`
        }))
      };
      schemasToInject.push(breadcrumbSchema);
    }

    // Append dynamic custom schemas if provided
    if (jsonLd) {
      if (Array.isArray(jsonLd)) {
        schemasToInject.push(...jsonLd);
      } else {
        schemasToInject.push(jsonLd);
      }
    }

    script.textContent = JSON.stringify(schemasToInject, null, 2);

    // Clean up title/schemas on unmount (standard dynamic SPA cleanup)
    return () => {
      // Revert title to fallback
      document.title = baseTitle;
      const scriptToClean = document.getElementById("jsonld-seo");
      if (scriptToClean) {
        scriptToClean.textContent = JSON.stringify(defaultSchemas, null, 2);
      }
    };
  }, [title, description, keywords.join(","), canonicalUrl, ogType, ogImage, twitterCard, jsonLd, breadcrumbs, brandSeo, location.pathname]);

  return null; // SEO component operates through side effects and has no UI element
};

export default SEO;
