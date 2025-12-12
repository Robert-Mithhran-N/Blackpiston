import PagePlaceholder from "@/components/layout/PagePlaceholder";
import { useMemo } from "react";
import { useParams } from "react-router-dom";

const categoryContent: Record<
  string,
  { title: string; description: string; highlights: string[] }
> = {
  helmets: {
    title: "Helmets",
    description:
      "Full-face, modular, and off-road lids that meet DOT/ECE ratings and keep you focused on the ride.",
    highlights: ["Ventilation tuned for long rides", "Pinlock-ready visors", "ECE/DOT certified options"],
  },
  jackets: {
    title: "Riding Jackets",
    description: "Armored textile and leather jackets built for everyday commuting and spirited weekend runs.",
    highlights: ["CE-rated armor included", "All-weather liners and vents", "Abrasion-resistant shells"],
  },
  boots: {
    title: "Riding Boots",
    description: "Touring, sport, and ADV boots with reinforced ankle support and grippy soles.",
    highlights: ["Oil-resistant soles", "Shift pad protection", "Water-resistant options"],
  },
  lights: {
    title: "Lights & DRLs",
    description: "Be seen and see farther with auxiliary lights, DRLs, and clean wiring kits.",
    highlights: ["Plug-and-play harnesses", "Weather-sealed housings", "High-output LED options"],
  },
  mounting: {
    title: "Mounting & Plates",
    description: "Mounts, clamps, and number plates to position cameras, lights, and navigation cleanly.",
    highlights: ["Universal and bike-specific fits", "Anti-vibration hardware", "Clean cable routing"],
  },
  oils: {
    title: "Oils & Filters",
    description: "Service kits with trusted oils, filters, and crush washers for hassle-free maintenance.",
    highlights: ["Motor-specific viscosities", "OEM-quality filters", "Service reminders and tips"],
  },
  handlebars: {
    title: "Handlebars & Displays",
    description: "Bars, grips, mirrors, and displays that improve control and cockpit clarity.",
    highlights: ["Comfort-first ergonomics", "Plug-in dash upgrades", "Bar-end mirror options"],
  },
  accessories: {
    title: "Accessories",
    description: "Everyday add-ons: luggage, guards, mounts, and creature comforts for longer rides.",
    highlights: ["Weekend-trip ready kits", "Crash and protection add-ons", "USB and charging accessories"],
  },
};

const ShopCategory = () => {
  const { category } = useParams();

  const content = useMemo(() => {
    if (!category) return null;
    return categoryContent[category] ?? null;
  }, [category]);

  const fallbackDescription =
    "This collection is getting stocked. Tell us what you need and we'll line up the right gear.";

  const title = content?.title ?? "Shop collection";
  const description = content?.description ?? fallbackDescription;
  const highlights = content?.highlights ?? ["Curated gear incoming", "Ask for sizing or fit help", "We source quickly"];

  return (
    <PagePlaceholder
      eyebrow="Shop"
      title={title}
      description={description}
      primaryAction={{ label: "View cart", to: "/cart" }}
      secondaryAction={{ label: "Need fit advice?", to: "/contact" }}
      highlights={highlights}
    />
  );
};

export default ShopCategory;


