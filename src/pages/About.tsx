import PagePlaceholder from "@/components/layout/PagePlaceholder";

const About = () => {
  return (
    <PagePlaceholder
      eyebrow="About"
      title="Built by riders, engineered for riders"
      description="BlackPiston Garage is a rider-led workshop focused on safe, reliable builds that still look sharp. We obsess over the small details so your bike feels sorted every ride."
      primaryAction={{ label: "Talk with the team", to: "/contact" }}
      secondaryAction={{ label: "See services", to: "/garage" }}
      highlights={[
        "Independent, rider-owned garage",
        "Platform-specific expertise",
        "Transparent recommendations",
        "Parts tested in real-world conditions",
      ]}
    />
  );
};

export default About;


