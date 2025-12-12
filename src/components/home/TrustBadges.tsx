import { Shield, Truck, RotateCcw, Wrench, Award, HeadphonesIcon } from "lucide-react";

const TrustBadges = () => {
  // TODO: Fetch badges from API
  const badges: Array<{
    icon: typeof Shield;
    title: string;
    description: string;
  }> = [];
  return (
    <section className="py-16 bg-secondary/50 border-y border-border">
      <div className="container">
        {badges.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No trust badges available
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {badges.map((badge, index) => (
            <div
              key={badge.title}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-card border border-border group-hover:border-primary/50 transition-colors mb-4">
                <badge.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-ui font-semibold text-foreground text-sm mb-1">
                {badge.title}
              </h3>
              <p className="text-xs text-metal">
                {badge.description}
              </p>
            </div>
          ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrustBadges;
