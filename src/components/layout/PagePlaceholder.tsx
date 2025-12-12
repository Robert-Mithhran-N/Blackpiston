import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import BackButton from "./BackButton";
import { Button } from "../ui/button";

type Action = {
  label: string;
  to: string;
};

type PagePlaceholderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryAction?: Action;
  secondaryAction?: Action;
  highlights?: string[];
  children?: ReactNode;
};

const PagePlaceholder = ({
  eyebrow = "Coming soon",
  title,
  description,
  primaryAction,
  secondaryAction,
  highlights = [],
  children,
}: PagePlaceholderProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-16 space-y-12">
        <BackButton />
        <section className="max-w-3xl space-y-6">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              {eyebrow}
            </p>
          )}
          <div className="space-y-4">
            <h1 className="text-4xl font-display tracking-tight text-foreground sm:text-5xl">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {primaryAction && (
              <Button asChild>
                <Link to={primaryAction.to} className="inline-flex items-center gap-2">
                  {primaryAction.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
            {secondaryAction && (
              <Button variant="outline" asChild>
                <Link to={secondaryAction.to}>{secondaryAction.label}</Link>
              </Button>
            )}
          </div>
        </section>

        {highlights.length > 0 && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 shadow-sm"
              >
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium text-foreground">{item}</p>
              </div>
            ))}
          </section>
        )}

        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PagePlaceholder;


