import PagePlaceholder from "@/components/layout/PagePlaceholder";

const Shipping = () => {
  return (
    <PagePlaceholder
      eyebrow="Shipping & Returns"
      title="How we ship your gear"
      description="Tracked shipping, careful packing, and quick support if anything arrives wrong. Tell us your deadline and we’ll aim to hit it."
      primaryAction={{ label: "Ask about delivery", to: "/contact" }}
      secondaryAction={{ label: "Back to shop", to: "/shop" }}
      highlights={[
        "Tracked shipments with status updates",
        "Pickup or install available locally",
        "Hassle-free exchanges on unused items",
      ]}
    />
  );
};

export default Shipping;





