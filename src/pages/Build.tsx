import PagePlaceholder from "@/components/layout/PagePlaceholder";

const Build = () => {
  return (
    <PagePlaceholder
      eyebrow="Build & Fit"
      title="Custom builds without the guesswork"
      description="Pick your platform, share your riding style, and we’ll recommend parts, fitment, and tuning paths that work together."
      primaryAction={{ label: "Start a build consult", to: "/contact" }}
      secondaryAction={{ label: "Browse shop", to: "/shop" }}
      highlights={[
        "Platform-specific part guidance",
        "Fitment checks before ordering",
        "Optional install and tuning support",
        "Photo/video updates during the build",
      ]}
    />
  );
};

export default Build;


