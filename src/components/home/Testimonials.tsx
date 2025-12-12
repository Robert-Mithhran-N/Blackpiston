import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  // TODO: Fetch testimonials from API
  const testimonials: Array<{
    id: number;
    name: string;
    bike: string;
    rating: number;
    text: string;
    image: string;
  }> = [];
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
        {testimonials.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No testimonials available
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
};

export default Testimonials;
