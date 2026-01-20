import { useLocation } from "react-router-dom";
import PagePlaceholder from "@/components/layout/PagePlaceholder";

const NotFound = () => {
  const location = useLocation();

  return (
    <PagePlaceholder
      eyebrow="404"
      title="This page can't be found"
      description={`We looked for "${location.pathname}" but couldn't find it. Try heading back or explore the shop.`}
      primaryAction={{ label: "Go home", to: "/" }}
      secondaryAction={{ label: "Shop gear", to: "/shop" }}
      highlights={[
        "Rider-focused gear and services",
        "Fast replies if you need help",
        "Use the menu to find categories",
      ]}
    />
  );
};

export default NotFound;
