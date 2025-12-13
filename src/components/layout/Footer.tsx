import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Twitter, Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      {/* Main Footer */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img src={logo} alt="BlackPiston Garage" className="h-16 w-auto" />
            </Link>
            <p className="text-metal text-sm">
              Premium motorcycle gear and professional workshop services. 
              Gear up. Ride hard. Modify smarter.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-metal hover:text-primary hover:bg-secondary/80 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-metal hover:text-primary hover:bg-secondary/80 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-metal hover:text-primary hover:bg-secondary/80 transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-metal hover:text-primary hover:bg-secondary/80 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-display text-lg text-foreground tracking-wide mb-4">
              SHOP
            </h4>
            <ul className="space-y-2">
              {["Helmets", "Riding Jackets", "Riding Boots", "Lights & DRLs", "Accessories", "All Products"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      to="/shop"
                      className="text-metal hover:text-primary transition-colors text-sm"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="font-display text-lg text-foreground tracking-wide mb-4">
              SERVICES
            </h4>
            <ul className="space-y-2">
              {[
                "Custom Builds",
                "ECU Tuning",
                "Suspension Setup",
                "Lighting Install",
                "Oil & Filter Service",
                "Book Appointment",
              ].map((item) => (
                <li key={item}>
                  <Link
                    to="/garage"
                    className="text-metal hover:text-primary transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display text-lg text-foreground tracking-wide mb-4">
              CONTACT
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-metal text-sm">
                  123 Garage Street, Motor City, MC 12345
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a
                  href="tel:+1234567890"
                  className="text-metal hover:text-primary transition-colors text-sm"
                >
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a
                  href="mailto:info@blackpistongarage.com"
                  className="text-metal hover:text-primary transition-colors text-sm"
                >
                  info@blackpistongarage.com
                </a>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Workshop Hours:<br />
                Mon-Fri: 9AM - 7PM<br />
                Sat: 10AM - 5PM<br />
                Sun: Closed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © 2024 BlackPiston Garage. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                to="/faq"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                FAQ
              </Link>
              <Link
                to="/shipping"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Shipping & Returns
              </Link>
              <Link
                to="/warranty"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Warranty
              </Link>
              <Link
                to="/privacy"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
