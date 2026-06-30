import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/seo/SEO";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { contactConfig } from "@/config/contact";
import { toast } from "sonner";
import { createRequest } from "@/lib/api";

const Contact = () => {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "MotorcycleRepair",
    "@id": "https://blackpistongarage.com/#localbusiness",
    "name": "BlackPiston Garage",
    "image": "https://blackpistongarage.com/logo.png",
    "telephone": contactConfig.phone.raw,
    "email": contactConfig.email.display,
    "url": "https://blackpistongarage.com",
    "logo": "https://blackpistongarage.com/logo.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": contactConfig.address.line1 + ", " + contactConfig.address.line2,
      "addressLocality": contactConfig.address.city,
      "addressRegion": "Tamil Nadu",
      "postalCode": contactConfig.address.pincode,
      "addressCountry": "IN"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "20:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "sameAs": [
      contactConfig.social?.instagram,
      contactConfig.social?.facebook,
      contactConfig.social?.youtube
    ].filter(Boolean)
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Contact", url: "/contact" }
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createRequest({
        userName: formData.name,
        userEmail: formData.email,
        userPhone: formData.phone,
        productName: formData.subject, // Store subject here
        message: formData.message,
        requestType: "OTHER", // General contact message
      });

      toast.success("Message sent successfully!", {
        description: "We'll get back to you within 24 hours.",
      });
      
      setFormData({
        name: "",
        phone: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error: any) {
      toast.error("Failed to send message", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Contact Us"
        description="Get in touch with BlackPiston Garage. Locate our workshop in Pattukottai, Tanjavur, call our team, or send a request for motorcycle styling and dyno tuning."
        breadcrumbs={breadcrumbs}
        jsonLd={localBusinessSchema}
      />
      <Header />
      <main className="pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/20 via-background to-orange-500/10 border-b border-border">
          <div className="container py-16 md:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <MessageCircle className="h-3 w-3 mr-1" />
                Get in Touch
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Contact <span className="text-primary">Us</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Have questions about our products or services? We're here to help!
              </p>
            </div>
          </div>
        </section>

        <div className="container py-12">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Get in Touch</h2>
              <p className="text-muted-foreground">
                Visit our garage, give us a call, or drop us a message. We typically respond within 24 hours.
              </p>

              {/* Contact Cards */}
              <div className="space-y-4">
                {/* Address */}
                <Card className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Visit Our Garage</h3>
                      <p className="text-muted-foreground text-sm">
                        {contactConfig.address.line1}<br />
                        {contactConfig.address.line2}<br />
                        {contactConfig.address.district} - {contactConfig.address.pincode}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Phone */}
                <Card className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Call Us</h3>
                      <a
                        href={contactConfig.phone.link}
                        className="text-primary hover:underline text-lg font-medium"
                      >
                        {contactConfig.phone.display}
                      </a>
                      <p className="text-muted-foreground text-sm mt-1">
                        Available during business hours
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Email */}
                <Card className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email Us</h3>
                      <a
                        href={contactConfig.email.link}
                        className="text-primary hover:underline"
                      >
                        {contactConfig.email.display}
                      </a>
                      <p className="text-muted-foreground text-sm mt-1">
                        We reply within 24 hours
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Business Hours */}
                <Card className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Business Hours</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><span className="text-foreground">Mon - Sat:</span> {contactConfig.businessHours?.weekdays}</p>
                        <p><span className="text-foreground">Sunday:</span> {contactConfig.businessHours?.sunday}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="border-2">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input 
                          name="name"
                          placeholder="Your name" 
                          value={formData.name}
                          onChange={handleChange}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone</label>
                        <Input 
                          name="phone"
                          type="tel" 
                          placeholder="Your phone number" 
                          value={formData.phone}
                          onChange={handleChange}
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input 
                        name="email"
                        type="email" 
                        placeholder="your.email@example.com" 
                        value={formData.email}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject</label>
                      <Input 
                        name="subject"
                        placeholder="How can we help you?" 
                        value={formData.subject}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message</label>
                      <Textarea
                        name="message"
                        placeholder="Tell us about your requirements..."
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-primary to-orange-500 hover:opacity-90"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
