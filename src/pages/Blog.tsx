import PagePlaceholder from "@/components/layout/PagePlaceholder";

const Blog = () => {
  return (
    <PagePlaceholder
      eyebrow="Blog"
      title="Riding notes, tech tips, and build diaries"
      description="Guides, product breakdowns, and behind-the-scenes looks at how we set up customer bikes. Articles are on the way."
      primaryAction={{ label: "Request a topic", to: "/contact" }}
      secondaryAction={{ label: "View services", to: "/garage" }}
      highlights={[
        "Maintenance checklists",
        "Gear and parts reviews",
        "Dyno and tuning insights",
        "Customer build spotlights",
      ]}
    />
  );
};

export default Blog;





