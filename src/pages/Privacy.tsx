import PagePlaceholder from "@/components/layout/PagePlaceholder";

const Privacy = () => {
  return (
    <PagePlaceholder
      eyebrow="Privacy"
      title="Your data, kept simple"
      description="We only collect what we need to process orders, schedule services, and keep you updated. We do not sell or share your data."
      primaryAction={{ label: "Contact support", to: "/contact" }}
      secondaryAction={{ label: "Return home", to: "/" }}
      highlights={[
        "No data resale or ad tracking",
        "Secure payment processing partners",
        "Opt out of marketing any time",
      ]}
    />
  );
};

export default Privacy;





