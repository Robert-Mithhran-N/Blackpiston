import PagePlaceholder from "@/components/layout/PagePlaceholder";

const Garage = () => {
  return (
    <PagePlaceholder
      eyebrow="Garage & Services"
      title="Track-proven service bay"
      description="Dyno tuning, suspension setup, lighting installs, and preventive maintenance handled by riders who wrench every day."
      primaryAction={{ label: "Book an appointment", to: "/contact" }}
      secondaryAction={{ label: "See build options", to: "/build" }}
      highlights={[
        "Custom builds and refresh projects",
        "Dyno and ECU tuning support",
        "Suspension setup for street and track",
        "Lighting and electrical installs",
        "Oil, filter, and safety checks",
      ]}
    />
  );
};

export default Garage;





