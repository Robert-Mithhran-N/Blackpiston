import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Twitter, Mail, Phone, MapPin } from "lucide-react";
// import logo from "@/assets/logo.png";
const logo = "https://res.cloudinary.com/dp890nvg2/image/upload/f_auto,q_auto/v1/blackpiston/assets/logo";
import { contactConfig } from "@/config/contact";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border pb-20 lg:pb-0">
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
                href={contactConfig.social?.facebook || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-metal hover:text-primary hover:bg-secondary/80 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={contactConfig.social?.instagram || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-metal hover:text-primary hover:bg-secondary/80 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={contactConfig.social?.youtube || "#"}
                target="_blank"
                rel="noopener noreferrer"
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
                "General Service",
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

          {/* Contact Info - Using Global Config */}
          <div>
            <h4 className="font-display text-lg text-foreground tracking-wide mb-4">
              CONTACT
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-metal text-sm">
                  {contactConfig.address.full}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a
                  href={contactConfig.phone.link}
                  className="text-metal hover:text-primary transition-colors text-sm"
                >
                  {contactConfig.phone.display}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a
                  href={contactConfig.email.link}
                  className="text-metal hover:text-primary transition-colors text-sm"
                >
                  {contactConfig.email.display}
                </a>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Workshop Hours:<br />
                Mon-Sat: {contactConfig.businessHours?.weekdays}<br />
                Sunday: {contactConfig.businessHours?.sunday}
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
              © {new Date().getFullYear()} BlackPiston Garage. All rights reserved.
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
