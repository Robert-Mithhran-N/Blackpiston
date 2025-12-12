import PagePlaceholder from "@/components/layout/PagePlaceholder";

const Shop = () => {
  return (
    <PagePlaceholder
      eyebrow="Shop"
      title="Ride-ready gear and parts"
      description="Browse curated helmets, jackets, lighting, and performance parts tuned for riders who expect more from their machines."
      primaryAction={{ label: "Explore helmets", to: "/shop/helmets" }}
      secondaryAction={{ label: "View services", to: "/garage" }}
      highlights={[
        "Certified protection from trusted brands",
        "Aftermarket parts selected for reliability",
        "Fast shipping and rider-first support",
      ]}
    />
  );
};

export default Shop;


