import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/seo/SEO";
import BackButton from "@/components/layout/BackButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, FileText, Wrench, ShieldAlert, CreditCard, ShoppingBag } from "lucide-react";
import { contactConfig } from "@/config/contact";

const TermsConditions = () => {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Terms & Conditions", url: "/terms" }
  ];

  const sections = [
    {
      id: "agreement",
      title: "1. Agreement & Acceptance",
      icon: FileText,
      content: (
        <div className="space-y-3">
          <p>
            Welcome to BlackPiston Garage. By accessing, browsing, or placing an order on our website (including booking motorcycle services), you agree to comply with and be bound by the following Terms and Conditions, which govern BlackPiston Garage's relationship with you.
          </p>
          <p>
            If you do not agree with any part of these terms, please do not use our website or purchase our products/services.
          </p>
        </div>
      ),
    },
    {
      id: "accounts",
      title: "2. User Accounts & Registration",
      icon: Scale,
      content: (
        <div className="space-y-3">
          <p>
            To place an order or schedule a garage service, you may be required to register a user account. You agree that:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li>You are at least 18 years of age and capable of entering into legally binding agreements under Indian law.</li>
            <li>You will provide accurate, current, and complete registration information.</li>
            <li>You are solely responsible for maintaining the confidentiality of your username and password.</li>
            <li>We reserve the right to terminate accounts, cancel orders, or refuse services in our sole discretion if suspicious, fraudulent, or abusive activity is detected.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "products",
      title: "3. Products, Pricing & Accuracy",
      icon: ShoppingBag,
      content: (
        <div className="space-y-3">
          <p>
            We sell premium motorcycle gear, helmets, accessories, and performance parts. While we strive to ensure absolute accuracy:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li><strong>Description Accuracy:</strong> We endeavor to display product images, sizes, and descriptions as accurately as possible. Slight color variations may occur depending on your screen settings.</li>
            <li><strong>Pricing:</strong> All prices displayed on our website are in Indian Rupees (INR) and are inclusive of GST unless specified otherwise. Shipping charges, if any, will be added at checkout.</li>
            <li><strong>Stock Availability:</strong> Products are subject to availability. In the event that a product becomes out of stock after order placement, we will contact you immediately to process a full refund or exchange.</li>
            <li><strong>Price Corrections:</strong> We reserve the right to correct pricing errors on our site. If an order is placed on a product with a clear pricing typo, we reserve the right to cancel the order and refund the transaction.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "payments",
      title: "4. Payment Terms & Razorpay",
      icon: CreditCard,
      content: (
        <div className="space-y-3">
          <p>
            We support online payment methods as well as Cash on Delivery (COD):
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li><strong>Online Processing:</strong> Online payments are securely routed and processed through our verified payment gateway partner, <strong>Razorpay</strong>. We support Credit/Debit Cards, Net Banking, UPI (Unified Payments Interface), and popular digital wallets.</li>
            <li><strong>Authorizations:</strong> Your payment must be successfully authorized by the issuing bank/provider before we process your order or confirm your workshop service.</li>
            <li><strong>Transaction Failures:</strong> In case of transaction failures where money is deducted from your account, Razorpay automatically initiates a reversal which usually reflects in 2-5 business days. Please contact support if the issue persists.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "garage-limitations",
      title: "5. Workshop Services & Custom Modifications",
      icon: Wrench,
      content: (
        <div className="space-y-3">
          <p>
            BlackPiston Garage provides professional general servicing, engine diagnostics, suspension setups, and custom upgrades. When you book a service:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li><strong>Scheduling:</strong> Booking times are estimations. While we strive to complete services in the promised window, unexpected mechanical complexities may cause delays.</li>
            <li><strong>Modifications Disclaimer:</strong> ECU remapping, performance exhausts, custom lighting, and other mechanical/electrical modifications are performed at the customer's request. Some aftermarket parts/tunes may affect your manufacturer's warranty.</li>
            <li><strong>RTO & Road Legal Compliance:</strong> It is the sole responsibility of the vehicle owner to ensure custom modifications comply with the Motor Vehicles Act, 1988, and local RTO guidelines in India. BlackPiston Garage is not liable for any regulatory citations, vehicle impoundments, or fines resulting from off-road performance parts used on public highways.</li>
            <li><strong>Vehicle Handover:</strong> We conduct pre-service checklists. Vehicles must be picked up within 48 hours of service completion notifications, failing which a garage storage fee may apply. Vehicles are handed over only after full clearance of the outstanding service invoice.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "liability",
      title: "6. Limitation of Liability & Indemnity",
      icon: ShieldAlert,
      content: (
        <div className="space-y-3">
          <p>
            To the maximum extent permitted by law, BlackPiston Garage, its owners, and employees shall not be liable for any direct, indirect, incidental, punitive, or consequential damages resulting from:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li>The use or inability to use our products (including riding gear and safety gear).</li>
            <li>Any damage to vehicles left in our garage arising from events beyond our control (e.g., natural disasters, grid failure) although all reasonable security precautions are taken.</li>
            <li>Failure of any performance modifications or wear/tear resulting from race-track or public highway usage of modified vehicles.</li>
          </ul>
          <p>
            Our total liability for any claim relating to a transaction is strictly limited to the amount paid by you for that specific product or service.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Terms & Conditions"
        description="Read the Terms & Conditions of BlackPiston Garage. Understand rules governing ordering gear, booking services, shipping rates, and dispute resolution."
        breadcrumbs={breadcrumbs}
      />
      <Header />
      <main className="pb-24">
        {/* Page Hero */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-orange-500/5 border-b border-border">
          <div className="container py-12 md:py-16">
            <div className="max-w-3xl">
              <BackButton />
              <Badge className="mb-3 bg-primary/20 text-primary border-primary/30 uppercase tracking-widest text-[10px] px-2.5 py-0.5 rounded-sm">
                Terms of Use
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight text-white">
                Terms & <span className="text-primary">Conditions</span>
              </h1>
              <p className="text-zinc-400 mt-3 text-base md:text-lg">
                Last Updated: May 26, 2026. Please read these terms carefully before shopping or booking garage services.
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <div className="container py-12">
          <div className="grid gap-10 lg:grid-cols-4">
            {/* Sticky Navigation (Desktop Only) */}
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
                    href="#governing-law"
                    className="py-2 pl-4 text-sm text-zinc-400 hover:text-primary border-l -ml-px border-transparent hover:border-primary transition-all font-ui font-medium"
                  >
                    Governing Law & Disputes
                  </a>
                </nav>
              </div>
            </aside>

            {/* Document Body */}
            <div className="lg:col-span-3 space-y-12">
              <div className="prose prose-invert max-w-none text-zinc-300 font-ui leading-relaxed space-y-6">
                <p className="text-lg text-zinc-400 leading-relaxed font-light">
                  These terms govern your use of the BlackPiston Garage website, store, and services. Under these terms, BlackPiston Garage is the facilitator of purchases and services, and by interacting with our platform, you accept these terms in full.
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

                  {/* Governing Law section */}
                  <section id="governing-law" className="scroll-mt-24 border-t border-zinc-800 pt-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-primary shrink-0">
                        <Scale className="h-4.5 w-4.5" />
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold font-display uppercase tracking-wide text-white">
                        7. Governing Law & Jurisdiction
                      </h2>
                    </div>
                    <div className="pl-0 md:pl-12">
                      <Card className="border-zinc-800 bg-zinc-950/40">
                        <CardContent className="p-6 space-y-3 text-sm md:text-base text-zinc-400">
                          <p>
                            These terms and conditions are governed by and construed in accordance with the laws of India.
                          </p>
                          <p>
                            Any dispute, controversy, or claim arising out of or relating to these terms, including purchases made on our online store or appointments booked for garage services, shall be subject to the exclusive jurisdiction of the competent courts in <strong>Pattukottai / Tanjavur, Tamil Nadu, India</strong>.
                          </p>
                          <p className="mt-4">
                            For any queries regarding terms and conditions, contact our business desk at:
                            <br />
                            <span className="font-semibold text-white mt-2 block">
                              BlackPiston Garage Office
                              <br />
                              Address: {contactConfig.address.full}
                              <br />
                              Email: {contactConfig.email.display}
                              <br />
                              Phone: {contactConfig.phone.display}
                            </span>
                          </p>
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

export default TermsConditions;
