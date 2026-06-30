import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/seo/SEO";
import BackButton from "@/components/layout/BackButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Navigation, Calendar, Wrench, AlertTriangle, ShieldCheck } from "lucide-react";
import { contactConfig } from "@/config/contact";

const Shipping = () => {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Shipping Policy", url: "/shipping" }
  ];

  const sections = [
    {
      id: "rates",
      title: "1. Delivery Charges & COD Fees",
      icon: Truck,
      content: (
        <div className="space-y-3">
          <p>
            We process deliveries all across India. Our shipping charges are calculated as follows:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li><strong>Free Standard Delivery:</strong> Applicable on all prepaid orders totaling <strong>₹1,999 or more</strong>.</li>
            <li><strong>Standard Flat Rate:</strong> A shipping fee of <strong>₹99</strong> is charged on orders below ₹1,999.</li>
            <li><strong>Cash on Delivery (COD) Convenience Fee:</strong> All Cash on Delivery orders incur a flat convenience fee of <strong>₹49</strong>, regardless of the order value. This fee is charged by logistics providers to handle cash management.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "timelines",
      title: "2. Shipping & Delivery Timelines",
      icon: Navigation,
      content: (
        <div className="space-y-3">
          <p>
            We make every effort to ship your riding gear and custom accessories as quickly as possible:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li><strong>Processing & Dispatch:</strong> Most gear, helmets, and in-stock parts are packaged and handed to our courier partners within <strong>1-2 business days</strong> of payment authorization.</li>
            <li><strong>Transit Duration:</strong> Delivery times vary based on your location:
              <ul className="list-circle pl-5 mt-1 text-zinc-500">
                <li>Major Metro Cities (Delhi, Mumbai, Bengaluru, Chennai, etc.): <strong>3-5 business days</strong>.</li>
                <li>Rest of India: <strong>5-7 business days</strong>.</li>
              </ul>
            </li>
            <li><strong>Sundays & Public Holidays:</strong> Deliveries are not processed or completed on national holidays or Sundays.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "tracking",
      title: "3. Order Tracking",
      icon: ShieldCheck,
      content: (
        <div className="space-y-3">
          <p>
            Once your order is handed over to our logistics partner (e.g., Delhivery, Blue Dart, or DTDC), we will send you a shipment confirmation email and SMS.
          </p>
          <p>
            This message will contain a direct **Tracking Link** and a **Tracking Number / AWB**. You can monitor the real-time status of your parcel directly via the courier partner's portal. Please allow up to 24 hours from dispatch for the tracking details to update.
          </p>
        </div>
      ),
    },
    {
      id: "garage-pickup",
      title: "4. Garage Service Pick-up & Scheduling",
      icon: Wrench,
      content: (
        <div className="space-y-3">
          <p>
            For local workshop services (Pattukottai, Tanjavur, and adjacent regions):
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li><strong>Self Drop-off:</strong> You drop off your motorcycle at our workshop located at Pattukottai at your scheduled booking time slot.</li>
            <li><strong>Valet Pickup & Drop Service:</strong> We offer a premium motorcycle pick-up and delivery service for garage repair/tuning jobs in a 15km radius. A flat charge of ₹150 applies for one-way transport. This transport is handled using specialized ramp-equipped towing vans to guarantee no scratch or tip-over risks.</li>
            <li><strong>Scheduling Pickup:</strong> You can choose this pickup option during the online service booking flow or by calling the garage desk.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "damages",
      title: "5. Handling Transit Damages",
      icon: AlertTriangle,
      content: (
        <div className="space-y-3 border border-orange-500/20 bg-orange-500/5 rounded-xl p-4">
          <p className="font-semibold text-primary">Report Shipping Damage Promptly</p>
          <p>
            All products are bubble-wrapped and packaged in high-grade corrugated boxes to survive transit conditions. However, if a package is damaged in transit:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400 mt-2">
            <li>Do not accept the delivery if the external box is severely crushed or torn open.</li>
            <li>If accepted, record a quick unboxing video and report damages with photos **within 24 hours** to <a href={contactConfig.email.link} className="text-primary hover:underline">{contactConfig.email.display}</a>.</li>
            <li>We will initiate an insurance claim and immediately dispatch a replacement item at no additional charge.</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Shipping & Delivery Policy"
        description="Learn about dispatch schedules, tracking, delivery timelines, and transit insurance for helmets and riding gear at BlackPiston Garage."
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
                Logistics
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight text-white">
                Shipping & <span className="text-primary">Delivery</span>
              </h1>
              <p className="text-zinc-400 mt-3 text-base md:text-lg">
                Last Updated: May 26, 2026. Standard dispatch timelines, courier rates, and local garage vehicle pick-up details.
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
                    href="#exceptions"
                    className="py-2 pl-4 text-sm text-zinc-400 hover:text-primary border-l -ml-px border-transparent hover:border-primary transition-all font-ui font-medium"
                  >
                    Delays & Force Majeure
                  </a>
                </nav>
              </div>
            </aside>

            {/* Document Body */}
            <div className="lg:col-span-3 space-y-12">
              <div className="prose prose-invert max-w-none text-zinc-300 font-ui leading-relaxed space-y-6">
                <p className="text-lg text-zinc-400 leading-relaxed font-light">
                  BlackPiston Garage partners with India's leading logistics providers to ensure your riding gear, parts, and accessories reach you in perfect condition. Below are the terms regarding shipping rates, options, and timelines.
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

                  {/* Exceptions / Force Majeure section */}
                  <section id="exceptions" className="scroll-mt-24 border-t border-zinc-800 pt-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-primary shrink-0">
                        <Calendar className="h-4.5 w-4.5" />
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold font-display uppercase tracking-wide text-white">
                        6. Unexpected Delays & Force Majeure
                      </h2>
                    </div>
                    <div className="pl-0 md:pl-12">
                      <Card className="border-zinc-800 bg-zinc-950/40">
                        <CardContent className="p-6 text-sm md:text-base text-zinc-400">
                          <p className="mb-3">
                            While we always endeavor to deliver packages within the standard window, minor delivery delays may happen due to factors beyond our control:
                          </p>
                          <ul className="list-disc pl-5 space-y-1.5 mb-4">
                            <li>Extreme weather conditions, floods, or natural events.</li>
                            <li>Transport union strikes, logistics hub congestions, or festive season volume spikes.</li>
                            <li>Incomplete delivery addresses or incorrect customer contact details provided at checkout.</li>
                          </ul>
                          <p>
                            For any inquiries regarding delayed orders or shipping status, please contact our dispatch cell:
                            <br />
                            <span className="font-semibold text-white mt-2 block">
                              BlackPiston Garage Dispatch
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

export default Shipping;
