import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTABanner = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-flame-end/5 blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="bg-gradient-to-r from-card via-secondary to-card rounded-2xl p-8 md:p-12 border border-border">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div>
              <p className="text-primary font-ui font-semibold text-sm uppercase tracking-widest mb-2">
                Ready to Upgrade?
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-wide mb-4">
                BOOK YOUR GARAGE<br />
                <span className="text-gradient-flame">APPOINTMENT TODAY</span>
              </h2>
              <p className="text-metal-light mb-6">
                From simple oil changes to complete custom builds — our certified mechanics are ready to work on your machine. Same-day appointments available.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/garage">
                  <Button 
                    size="lg" 
                    className="bg-gradient-flame hover:opacity-90 transition-all font-ui font-semibold px-8 group"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Appointment
                  </Button>
                </Link>
                <Link to="/garage">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-metal text-metal-light hover:bg-secondary hover:text-foreground font-ui font-semibold px-8 group"
                  >
                    View Services
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Content - Stats */}
            {/* TODO: Fetch stats from API */}
            {/* <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/50 rounded-lg p-6 border border-border text-center">
                <p className="font-display text-4xl text-gradient-flame">0</p>
                <p className="text-metal text-sm mt-1">Bikes Serviced</p>
              </div>
              <div className="bg-background/50 rounded-lg p-6 border border-border text-center">
                <p className="font-display text-4xl text-gradient-flame">0%</p>
                <p className="text-metal text-sm mt-1">Happy Customers</p>
              </div>
              <div className="bg-background/50 rounded-lg p-6 border border-border text-center">
                <p className="font-display text-4xl text-gradient-flame">0</p>
                <p className="text-metal text-sm mt-1">Expert Mechanics</p>
              </div>
              <div className="bg-background/50 rounded-lg p-6 border border-border text-center">
                <p className="font-display text-4xl text-gradient-flame">0★</p>
                <p className="text-metal text-sm mt-1">Average Rating</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
