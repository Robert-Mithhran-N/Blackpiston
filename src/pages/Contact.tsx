import PagePlaceholder from "@/components/layout/PagePlaceholder";

const Contact = () => {
  return (
    <PagePlaceholder
      eyebrow="Contact"
      title="We’ll get you an answer fast"
      description="Tell us about your bike, riding style, or the parts you’re eyeing. We reply with fitment guidance and timelines."
      primaryAction={{ label: "Call the garage", to: "/garage" }}
      secondaryAction={{ label: "Back to home", to: "/" }}
      highlights={[
        "Phone: +1 (234) 567-890",
        "Email: info@blackpistongarage.com",
        "Workshop hours: Mon-Fri 9-7, Sat 10-5",
      ]}
    />
  );
};

export default Contact;





