import PagePlaceholder from "@/components/layout/PagePlaceholder";

const Cart = () => {
  return (
    <PagePlaceholder
      eyebrow="Cart"
      title="Your cart is empty"
      description="Add gear or parts to see totals here. Need help confirming fitment or availability? We can double-check before you buy."
      primaryAction={{ label: "Browse the shop", to: "/shop" }}
      secondaryAction={{ label: "Talk with the team", to: "/contact" }}
      highlights={[
        "Fitment checks before checkout",
        "Fast responses on inventory",
        "Secure checkout coming soon",
      ]}
    />
  );
};

export default Cart;


