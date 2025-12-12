import PagePlaceholder from "@/components/layout/PagePlaceholder";
import { useMemo } from "react";
import { useParams } from "react-router-dom";

const ShopCategory = () => {
  const { category } = useParams();

  // TODO: Fetch category content from API
  const categoryContent: Record<
    string,
    { title: string; description: string; highlights: string[] }
  > = {};

  const content = useMemo(() => {
    if (!category) return null;
    return categoryContent[category] ?? null;
  }, [category, categoryContent]);

  const fallbackDescription =
    "This collection is getting stocked. Tell us what you need and we'll line up the right gear.";

  const title = content?.title ?? "Shop collection";
  const description = content?.description ?? fallbackDescription;
  const highlights = content?.highlights ?? ["Curated gear incoming", "Ask for sizing or fit help", "We source quickly"];

  return (
    <PagePlaceholder
      eyebrow="Shop"
      title={title}
      description={description}
      primaryAction={{ label: "View cart", to: "/cart" }}
      secondaryAction={{ label: "Need fit advice?", to: "/contact" }}
      highlights={highlights}
    />
  );
};

export default ShopCategory;


