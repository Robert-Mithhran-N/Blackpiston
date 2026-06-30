import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/seo/SEO";
import BackButton from "@/components/layout/BackButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, RotateCcw, Calendar, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";
import { contactConfig } from "@/config/contact";

const RefundPolicy = () => {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Refund Policy", url: "/refund-policy" }
  ];

  const refundSections = [
    {
      id: "returns",
      title: "1. 7-Day Return Policy (Riding Gear & Accessories)",
      icon: RotateCcw,
      content: (
        <div className="space-y-3">
          <p>
            We want you to be completely satisfied with your purchase. We offer a <strong>7-day return and exchange policy</strong> for unused, standard riding jackets, riding boots, motorcycle gloves, luggage bags, and general accessories:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li>The item must be completely unused, unwashed, and in the exact same condition that you received it.</li>
            <li>It must be returned in the original packaging, with all brand tags, manuals, stickers, and invoices intact.</li>
            <li>Returns must be requested within 7 calendar days from the date of delivery.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "helmet-exemption",
      title: "2. Crucial Helmet & Safety Gear Exemption",
      icon: ShieldAlert,
      content: (
        <div className="space-y-3 border border-red-500/20 bg-red-500/5 rounded-xl p-4">
          <p className="font-semibold text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            Safety-First Policy for Helmets & Body Armor
          </p>
          <p className="text-zinc-300">
            To ensure the absolute safety and integrity of safety equipment provided to all our riders, <strong>helmets, riding armor, and back protectors are NOT eligible for return or exchange for change of mind or sizing once worn or tags are removed.</strong>
          </p>
          <p>
            An impact protection helmet’s interior foam conforms to the wearer’s skull structure, and safety gear cannot be resold if worn due to safety validation concerns. We will ONLY accept helmet/safety gear returns in case of:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li>Manufacturing defects (subject to brand warranty guidelines).</li>
            <li>Verified transport damage reported within 24 hours of delivery.</li>
          </ul>
          <p className="text-xs text-zinc-400 italic mt-2">
            * We strongly advise using our size charts or visiting our physical showroom in Pattukottai to verify helmet sizes before purchasing.
          </p>
        </div>
      ),
    },
    {
      id: "damage-claims",
      title: "3. Damaged or Defective Items",
      icon: Sparkles,
      content: (
        <div className="space-y-3">
          <p>
            In the rare event that your product arrives damaged or defective:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li>You must report the issue within <strong>24 hours of delivery</strong> by sending an email to <a href={contactConfig.email.link} className="text-primary hover:underline">{contactConfig.email.display}</a>.</li>
            <li>Please provide your Order ID, details of the damage, and clear photos or a short video clip showing the unboxing and the issue.</li>
            <li>Upon verification, we will arrange for a free reverse pickup and ship a replacement or issue a full refund at no extra cost to you.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "service-cancellation",
      title: "4. Garage & Service Bookings Cancellation",
      icon: Calendar,
      content: (
        <div className="space-y-3">
          <p>
            For services booked in our workshop (ECU remapping, performance installs, scheduled maintenance):
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li><strong>24-Hour Notice:</strong> You can cancel or reschedule your service booking free of charge up to 24 hours before your scheduled appointment slot. Any booking deposit will be refunded in full.</li>
            <li><strong>Late Cancellations:</strong> Cancellations made within 24 hours of the slot may be subject to a minor service reservation charge of ₹250.</li>
            <li><strong>Work Commenced:</strong> Once work has commenced on your vehicle in our service bay, no cancellations or refunds are permitted for parts used or hours worked.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "processing",
      title: "5. Refund Timelines & Processing Method",
      icon: CheckCircle2,
      content: (
        <div className="space-y-3">
          <p>
            Once we receive and inspect your returned item (typically within 48 hours of arrival at our facility), we will send you an email confirmation. If approved:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li><strong>Online Payments (Razorpay):</strong> Approved refunds are automatically routed back to your original source of payment (Credit/Debit Card, UPI, Net Banking, or Wallet). The refund amount typically reflects in your bank statement within <strong>5-7 business days</strong>, depending on bank processing cycles.</li>
            <li><strong>Cash on Delivery (COD):</strong> Refunds for COD orders cannot be issued in cash. We will request your bank account details (Bank Name, Account Holder, Account Number, IFSC Code) and issue a direct bank transfer (NEFT) within <strong>7-10 business days</strong>.</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Refund & Cancellation Policy"
        description="Learn about the return, refund, and cancellation policies at BlackPiston Garage for riding gear, helmets, custom tuning, and parts orders."
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
                Returns Policy
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight text-white">
                Refund & <span className="text-primary">Cancellation</span>
              </h1>
              <p className="text-zinc-400 mt-3 text-base md:text-lg">
                Last Updated: May 26, 2026. Clear and fair refund rules for gear, safety accessories, and custom tuning services.
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
                  {refundSections.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className="py-2 pl-4 text-sm text-zinc-400 hover:text-primary border-l -ml-px border-transparent hover:border-primary transition-all font-ui font-medium"
                    >
                      {sec.title.substring(3)}
                    </a>
                  ))}
                  <a
                    href="#non-returnable"
                    className="py-2 pl-4 text-sm text-zinc-400 hover:text-primary border-l -ml-px border-transparent hover:border-primary transition-all font-ui font-medium"
                  >
                    Non-Returnable Items
                  </a>
                </nav>
              </div>
            </aside>

            {/* Document Body */}
            <div className="lg:col-span-3 space-y-12">
              <div className="prose prose-invert max-w-none text-zinc-300 font-ui leading-relaxed space-y-6">
                <p className="text-lg text-zinc-400 leading-relaxed font-light">
                  At BlackPiston Garage, we ensure a transparent process for cancellations, returns, and refunds. This policy clarifies the rules for products purchased on our shop and services booked for our garage.
                </p>

                <div className="border-t border-zinc-800 pt-8 space-y-10">
                  {refundSections.map((sec) => {
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

                  {/* Non-Returnables section */}
                  <section id="non-returnable" className="scroll-mt-24 border-t border-zinc-800 pt-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-primary shrink-0">
                        <AlertCircle className="h-4.5 w-4.5" />
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold font-display uppercase tracking-wide text-white">
                        6. Non-Returnable Products & Services
                      </h2>
                    </div>
                    <div className="pl-0 md:pl-12">
                      <Card className="border-zinc-800 bg-zinc-950/40">
                        <CardContent className="p-6 text-sm md:text-base text-zinc-400">
                          <p className="mb-3">
                            The following categories are strictly excluded from returns, refunds, or exchanges:
                          </p>
                          <ul className="list-disc pl-5 space-y-1.5 mb-4">
                            <li>Electrical spares and component parts once unsealed.</li>
                            <li>Opened chemical consumables, including engine lubricants, brake fluids, and chain lubes.</li>
                            <li>Custom-made aesthetic modifications, including custom seat wraps or decals.</li>
                            <li>Exhaust systems or filters after being installed or test-run.</li>
                          </ul>
                          <p>
                            For return queries or requesting a cancellation, please email us directly with your invoice details:
                            <br />
                            <span className="font-semibold text-white mt-2 block">
                              BlackPiston Garage Returns Desk
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

export default RefundPolicy;
