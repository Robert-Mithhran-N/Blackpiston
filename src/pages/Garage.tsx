import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wrench,
  Clock,
  ArrowRight,
  Shield,
  Award,
  CheckCircle,
  Phone,
  MapPin,
  Star,
} from "lucide-react";
import { services } from "@/config/services";
import { contactConfig } from "@/config/contact";

const Garage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/20 via-background to-orange-500/10 border-b border-border overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2260%22%20height%3D%2260%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2060%200%20L%200%200%200%2060%22%20fill%3D%22none%22%20stroke%3D%22%23fff%22%20stroke-width%3D%220.5%22%20opacity%3D%220.05%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
          <div className="container relative py-16 md:py-24">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Wrench className="h-3 w-3 mr-1" />
                Professional Service Bay
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Garage & <span className="text-primary">Services</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Track-proven service bay with dyno tuning, suspension setup, lighting installs,
                and preventive maintenance handled by riders who wrench every day.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/contact">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-orange-500 hover:opacity-90">
                    Book Appointment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/build">
                  <Button size="lg" variant="outline">
                    Custom Builds
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-8 border-b border-border bg-muted/30">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Certified Mechanics</p>
                  <p className="text-xs text-muted-foreground">Professional team</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Quality Parts</p>
                  <p className="text-xs text-muted-foreground">OEM & Premium</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Quick Turnaround</p>
                  <p className="text-xs text-muted-foreground">Same-day service</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">500+ Happy Riders</p>
                  <p className="text-xs text-muted-foreground">5-star reviews</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Our <span className="text-primary">Services</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From basic maintenance to custom builds, we offer comprehensive services
                to keep your ride performing at its best.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className="group relative overflow-hidden border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
                >
                  {/* Service Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400&h=300&fit=crop";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                      ₹{service.price.toLocaleString()}
                    </Badge>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{service.duration}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                    <Link to="/contact">
                      <Button className="w-full group/btn">
                        Book Now
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>

                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-gradient-to-br from-primary/10 to-orange-500/10 border-y border-border">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to get your bike serviced?</h2>
              <p className="text-muted-foreground mb-8">
                Contact us to schedule an appointment or visit our garage for a consultation.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <a href={contactConfig.phone.link} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{contactConfig.phone.display}</span>
                </a>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{contactConfig.address.city}, {contactConfig.address.district}</span>
                </div>
              </div>
              <Link to="/contact">
                <Button size="lg" className="bg-gradient-to-r from-primary to-orange-500 hover:opacity-90">
                  Contact Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Garage;
