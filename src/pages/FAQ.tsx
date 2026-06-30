import PagePlaceholder from "@/components/layout/PagePlaceholder";
import SEO from "@/components/seo/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const questions = [
  {
    q: "Do you install the parts you sell?",
    a: "Yes. We can handle installs, tuning, and post-install checks. Share your bike and parts list and we’ll schedule you.",
  },
  {
    q: "How long does a service take?",
    a: "Simple installs can be same-day. Larger jobs depend on parts availability and scope. We’ll share timelines up front.",
  },
  {
    q: "Can you help me choose the right parts?",
    a: "Absolutely. We verify compatibility before ordering so you avoid returns and downtime.",
  },
  {
    q: "Do you ship parts?",
    a: "Yes, with tracked shipping. If you prefer pickup or install, we’ll arrange that too.",
  },
];

const FAQ = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "FAQ", url: "/faq" }
  ];

  return (
    <PagePlaceholder
      eyebrow="FAQ"
      title="Questions we get the most"
      description="Quick answers for new riders and returning customers. If you don’t see what you need, reach out and we’ll clarify."
      primaryAction={{ label: "Talk with us", to: "/contact" }}
      secondaryAction={{ label: "View services", to: "/garage" }}
    >
      <SEO
        title="Frequently Asked Questions (FAQ)"
        description="Quick answers for new riders and returning customers about installs, timings, parts selection, and shipping options at BlackPiston Garage."
        breadcrumbs={breadcrumbs}
        jsonLd={faqSchema}
      />
      <div className="max-w-3xl mx-auto w-full">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {questions.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border/80 bg-card/45 rounded-xl px-5 py-1.5 shadow-sm transition-all duration-300 hover:border-primary/40 hover:bg-card/70 data-[state=open]:border-primary/50 data-[state=open]:bg-card/90"
            >
              <AccordionTrigger className="text-base font-semibold text-foreground hover:no-underline py-4 text-left">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-1 pb-4">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </PagePlaceholder>
  );
};

export default FAQ;





