import PagePlaceholder from "@/components/layout/PagePlaceholder";

const questions = [
  {
    q: "Do you install the parts you sell?",
    a: "Yes. We can handle installs, tuning, and post-install checks. Share your bike and parts list and we’ll schedule you.",
  },
  {
    q: "How long do builds take?",
    a: "Simple installs can be same-day. Full builds depend on sourcing and scope. We’ll share timelines up front.",
  },
  {
    q: "Can you help with fitment?",
    a: "Absolutely. We verify fitment before ordering so you avoid returns and downtime.",
  },
  {
    q: "Do you ship parts?",
    a: "Yes, with tracked shipping. If you prefer pickup or install, we’ll arrange that too.",
  },
];

const FAQ = () => {
  return (
    <PagePlaceholder
      eyebrow="FAQ"
      title="Questions we get the most"
      description="Quick answers for new riders and returning customers. If you don’t see what you need, reach out and we’ll clarify."
      primaryAction={{ label: "Talk with us", to: "/contact" }}
      secondaryAction={{ label: "View services", to: "/garage" }}
    >
      <div className="grid gap-6 md:grid-cols-2">
        {questions.map((item) => (
          <div key={item.q} className="rounded-xl border border-border bg-card/60 p-5 shadow-sm">
            <p className="text-sm font-semibold text-foreground">{item.q}</p>
            <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
          </div>
        ))}
      </div>
    </PagePlaceholder>
  );
};

export default FAQ;





