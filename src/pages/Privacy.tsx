import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/layout/BackButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Eye, Lock, Database, CreditCard, RefreshCw } from "lucide-react";
import { contactConfig } from "@/config/contact";

const Privacy = () => {
  useEffect(() => {
    document.title = "Privacy Policy | BlackPiston Garage";
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Read the Privacy Policy of BlackPiston Garage. Learn how we collect, protect, and use your data for riding gear orders and garage services securely through Razorpay."
      );
    }
  }, []);

  const sections = [
    {
      id: "collection",
      title: "1. Information We Collect",
      icon: Database,
      content: (
        <div className="space-y-3">
          <p>
            We collect information from you when you register on our site, place an order, book a garage service, or fill out a form. This includes:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li><strong>Personal Identity Data:</strong> Full name, billing and shipping addresses, phone number, and email address.</li>
            <li><strong>Motorcycle Vehicle Data:</strong> Make, model, year of manufacture, license registration number, and service history (collected specifically for garage bookings and customization service history).</li>
            <li><strong>Transaction & Order Data:</strong> Details of products purchased, service slots booked, order totals, and transaction dates.</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, and activity logs on our website.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "usage",
      title: "2. How We Use Your Information",
      icon: Eye,
      content: (
        <div className="space-y-3">
          <p>
            All information we collect from you is utilized to run our business operations and provide a seamless rider experience:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li>To process transactions and ship riding gear, helmets, and accessories.</li>
            <li>To schedule and execute garage services, engine tunes, modifications, and pick-ups.</li>
            <li>To send periodic emails and SMS notifications regarding order status, shipping tracking numbers, or service booking confirmation.</li>
            <li>To improve customer support efficiency and verify accounts.</li>
            <li>To prevent fraud, verify legitimacy, and comply with safety regulations.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "payments",
      title: "3. Secure Payments & Razorpay Partner",
      icon: CreditCard,
      content: (
        <div className="space-y-3 border border-orange-500/20 bg-orange-500/5 rounded-xl p-4">
          <p className="font-semibold text-primary">Payment Security is Our Top Priority</p>
          <p className="text-zinc-300">
            All online payments on BlackPiston Garage are securely processed through our third-party payment gateway partner, <strong>Razorpay</strong>.
          </p>
          <p>
            During checkout, you will be redirected to Razorpay’s secure interface. We **do not collect, store, or have access to** your credit/debit card numbers, net banking credentials, UPI pins, or CVVs. All payment credentials are encrypted using industry-standard Secure Socket Layer (SSL) technology and processed in complete compliance with the Payment Card Industry Data Security Standard (PCI-DSS).
          </p>
        </div>
      ),
    },
    {
      id: "protection",
      title: "4. How We Protect Your Data",
      icon: Lock,
      content: (
        <div className="space-y-3">
          <p>
            We implement a variety of security measures to maintain the safety of your personal information:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li>Our website is secured via high-grade Secure Sockets Layer (SSL/HTTPS) technology, ensuring all data transmitted between your browser and our servers is encrypted.</li>
            <li>We restrict database access to authorized personnel who are bound by confidentiality agreements.</li>
            <li>We perform periodic software and server updates to protect against security vulnerabilities.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "cookies",
      title: "5. Cookies & Tracking Technology",
      icon: RefreshCw,
      content: (
        <div className="space-y-3">
          <p>
            Yes, we use cookies (small files transferred to your computer's hard drive through your Web browser) to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li>Help remember and process the items in your shopping cart.</li>
            <li>Understand and save your preferences for future visits.</li>
            <li>Compile aggregate data about site traffic and site interactions so that we can offer better site experiences and tools in the future.</li>
          </ul>
          <p>
            You can choose to disable cookies through your browser settings, though doing so may disable certain shopping features on our store.
          </p>
        </div>
      ),
    },
    {
      id: "disclosure",
      title: "6. Third-Party Disclosures",
      icon: Shield,
      content: (
        <div className="space-y-3">
          <p>
            We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or shipping products to you:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li><strong>Logistics Partners:</strong> Courier companies that deliver your helmets and riding jackets.</li>
            <li><strong>Payment Gateways:</strong> Razorpay for verifying transactions and processing refunds.</li>
            <li><strong>Legal Compliance:</strong> We may release your information when we believe release is appropriate to comply with the law, enforce our site policies, or protect ours or others' rights, property, or safety.</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-24">
        {/* Page Hero */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-orange-500/5 border-b border-border">
          <div className="container py-12 md:py-16">
            <div className="max-w-3xl">
              <BackButton />
              <Badge className="mb-3 bg-primary/20 text-primary border-primary/30 uppercase tracking-widest text-[10px] px-2.5 py-0.5 rounded-sm">
                Compliance
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight text-white">
                Privacy <span className="text-primary">Policy</span>
              </h1>
              <p className="text-zinc-400 mt-3 text-base md:text-lg">
                Last Updated: May 26, 2026. Your trust and privacy are paramount to the BlackPiston team. Here is how we safeguard your data.
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <div className="container py-12">
          <div className="grid gap-10 lg:grid-cols-4">
            {/* Sticky Table of Contents (Desktop Only) */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-2">
                  Navigation
                </p>
                <nav className="flex flex-col gap-1 border-l border-zinc-800">
                  {sections.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className="py-2 pl-4 text-sm text-zinc-400 hover:text-primary border-l -ml-px border-transparent hover:border-primary transition-all font-ui font-medium"
                    >
                      {sec.title.substring(3)}
                    </a>
                  ))}
                  <a
                    href="#contact"
                    className="py-2 pl-4 text-sm text-zinc-400 hover:text-primary border-l -ml-px border-transparent hover:border-primary transition-all font-ui font-medium"
                  >
                    Contact Privacy Office
                  </a>
                </nav>
              </div>
            </aside>

            {/* Document Body */}
            <div className="lg:col-span-3 space-y-12">
              <div className="prose prose-invert max-w-none text-zinc-300 font-ui leading-relaxed space-y-6">
                <p className="text-lg text-zinc-400 leading-relaxed font-light">
                  BlackPiston Garage (also referred to as "we", "us", or "our") respects the privacy of our website visitors and clients. This privacy policy describes the types of information we collect, how we use it, how we secure it, and with whom we share it. This policy applies to all users of our online store, garage scheduling services, and related apps.
                </p>

                <div className="border-t border-zinc-800 pt-8 space-y-10">
                  {sections.map((sec) => {
                    const Icon = sec.icon;
                    return (
                      <section key={sec.id} id={sec.id} className="scroll-mt-24 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-primary shrink-0">
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <h2 className="text-xl md:text-2xl font-bold font-display uppercase tracking-wide text-white">
                            {sec.title}
                          </h2>
                        </div>
                        <div className="pl-0 md:pl-12 text-zinc-400 text-sm md:text-base">
                          {sec.content}
                        </div>
                      </section>
                    );
                  })}

                  {/* Contact section */}
                  <section id="contact" className="scroll-mt-24 scroll-margin-top border-t border-zinc-800 pt-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-primary shrink-0">
                        <Shield className="h-4.5 w-4.5" />
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold font-display uppercase tracking-wide text-white">
                        7. Privacy Contact & Grievances
                      </h2>
                    </div>
                    <div className="pl-0 md:pl-12">
                      <Card className="border-zinc-800 bg-zinc-950/40">
                        <CardContent className="p-6 space-y-3 text-sm md:text-base text-zinc-400">
                          <p>
                            If you have questions, concerns, or requests regarding this Privacy Policy, your account data, or compliance, please reach out to us at:
                          </p>
                          <div className="space-y-1 mt-3">
                            <p className="font-semibold text-white">BlackPiston Garage Privacy Cell</p>
                            <p>Address: {contactConfig.address.full}</p>
                            <p>Email: <a href={contactConfig.email.link} className="text-primary hover:underline">{contactConfig.email.display}</a></p>
                            <p>Phone: <a href={contactConfig.phone.link} className="text-primary hover:underline">{contactConfig.phone.display}</a></p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
