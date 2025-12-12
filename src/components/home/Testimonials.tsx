import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Arjun Sharma",
    bike: "Kawasaki Ninja 650",
    rating: 5,
    text: "Absolutely incredible service! The team at BlackPiston completely transformed my Ninja with a custom exhaust and ECU tune. The power delivery is now buttery smooth.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Priya Menon",
    bike: "Royal Enfield Interceptor",
    rating: 5,
    text: "Found the perfect riding jacket here! Great quality, fast shipping, and the fit guide was spot-on. Will definitely be back for more gear.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Vikram Patel",
    bike: "Triumph Street Triple",
    rating: 5,
    text: "The suspension setup service was worth every penny. My Street Triple handles like a dream now. The team really knows their stuff!",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 4,
    name: "Sneha Reddy",
    bike: "KTM Duke 390",
    rating: 5,
    text: "Best helmet shopping experience! They helped me find the perfect fit with their detailed sizing guide. The helmet arrived in perfect condition.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-card">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-primary font-ui font-semibold text-sm uppercase tracking-widest mb-2">
            Customer Reviews
          </p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground tracking-wide">
            WHAT RIDERS SAY
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-background rounded-lg p-6 border border-border hover:border-primary/30 transition-colors"
            >
              {/* Quote icon */}
              <Quote className="h-8 w-8 text-primary/30 mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-primary fill-primary"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-metal-light text-sm mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-ui font-semibold text-foreground text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-metal">{testimonial.bike}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
