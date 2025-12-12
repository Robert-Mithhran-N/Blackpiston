import PagePlaceholder from "@/components/layout/PagePlaceholder";

const Warranty = () => {
  return (
    <PagePlaceholder
      eyebrow="Warranty"
      title="Warranty and support"
      description="Most products include manufacturer warranties. We help you document issues, process claims, and get rolling again quickly."
      primaryAction={{ label: "Start a claim", to: "/contact" }}
      secondaryAction={{ label: "Shop gear", to: "/shop" }}
      highlights={[
        "Manufacturer warranty assistance",
        "Install verification to protect coverage",
        "Quick diagnostics for ride-critical parts",
      ]}
    />
  );
};

export default Warranty;


