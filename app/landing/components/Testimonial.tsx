export function Testimonial() {
  const testimonials = [
    {
      quote: "I've been consulting with the Flowtusk team on persona methodology. The AI captures the same strategic depth I deliver to enterprise clients—but in minutes instead of weeks.",
      author: "Brand Designer in Helsinki, 10+ years in B2B positioning"
    },
    {
      quote: "As a design system consultant, I'm impressed by how Flowtusk bridges strategy and execution. It's not just generating content—it's building complete brand systems.",
      author: "Design Lead in Helsinki, ex-Reaktor"
    },
    {
      quote: "I've worked on 100+ brand projects. Flowtusk is the first tool that actually understands the nuance of positioning. I'm helping shape it because this is the future.",
      author: "UX Designer in Helsinki, Large enterprise"
    }
  ];

  return (
    <section className="pt-20">
      <div className="px-8 mx-auto md:px-12 lg:px-24 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto lg:text-balance">
          <h2 className="text-xl leading-tight tracking-tight sm:text-2xl md:text-3xl lg:text-4xl font-medium text-base-900 lg:text-balance">
            Shaped by brand strategists and designers
          </h2>
        </div>

        <div className="grid gap-10 mt-12 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-base-50 p-6 rounded-xl shadow-sm">
              <p className="text-base text-base-700 font-medium">
                &quot;{testimonial.quote}&quot;
              </p>
              <p className="text-sm text-base-500 mt-3 font-semibold">
                — {testimonial.author}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
