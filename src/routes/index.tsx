import { createFileRoute, Link } from "@tanstack/react-router";
import heroImage from "@/assets/hero-villa.jpeg";
import { villas } from "@/data/villas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Firstrose — Beachside Villa in Diani Beach, Kenya" },
      {
        name: "description",
        content:
          "Book Firstrose, a stunning beachside villa in Diani Beach, Kenya — just 10 minutes' walk to the ocean.",
      },
      { property: "og:title", content: "Firstrose — Diani Beach Villa" },
      {
        property: "og:description",
        content: "A serene beachside villa in Diani Beach, Kenya — 10 minutes' walk to the ocean.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[90vh] w-full overflow-hidden">
        <img
          src={heroImage}
          alt="Luxury villa with infinity pool overlooking the sea at sunset"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col items-start justify-end px-6 pb-24">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-white/80">
            Diani Beach, Kenya
          </p>
          <h1 className="font-serif text-5xl text-white md:text-6xl">
            Welcome to
            <br />
            <span className="text-primary">Firstrose Villas</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/90">
            A private villa retreat on the Kenyan coast. Just 10 minutes' walk to the white sands of
            Diani Beach.
          </p>
          <div className="mt-10 flex gap-4">
            <Link
              to="/villas"
              className="rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-elegant)] transition-all hover:scale-105 hover:bg-primary/90"
            >
              Browse Villas
            </Link>
            <Link
              to="/contact"
              className="rounded-full border border-white/40 bg-white/10 px-8 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              Book a Stay
            </Link>
          </div>
        </div>
      </section>

      {/* Featured villas */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 flex items-end justify-between">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-primary">Featured</p>
            <h2 className="font-serif text-4xl text-foreground md:text-5xl">The Firstrose Villa</h2>
          </div>
          <Link
            to="/villas"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-primary md:block"
          >
            View all →
          </Link>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {villas.map((villa) => (
            <article
              key={villa.id}
              className="group overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={villa.image}
                  alt={villa.name}
                  width={1024}
                  height={768}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {villa.location}
                </p>
                <h3 className="mt-2 font-serif text-2xl text-foreground">{villa.name}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{villa.description}</p>
                <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
                  <span className="text-sm text-muted-foreground">
                    From <span className="font-medium text-foreground">${villa.price}</span> / night
                  </span>
                  <Link
                    to="/contact"
                    className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Book →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Amenities */}
      <section className="bg-secondary/40 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-primary">Why Firstrose</p>
            <h2 className="font-serif text-4xl text-foreground md:text-5xl">
              Designed for slow living
            </h2>
          </div>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {[
              {
                title: "Handpicked Properties",
                desc: "Every villa is personally visited and curated for character, comfort, and view.",
              },
              {
                title: "Concierge Service",
                desc: "From private chefs to boat charters, we craft your stay end to end.",
              },
              {
                title: "Best Price Promise",
                desc: "Direct bookings with no hidden fees. What you see is what you pay.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent">
                  <span className="font-serif text-xl text-accent-foreground">✦</span>
                </div>
                <h3 className="font-serif text-xl text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="font-serif text-4xl text-foreground md:text-5xl">
          Ready for your next escape?
        </h2>
        <p className="mt-6 text-lg text-muted-foreground">
          Tell us your dates and we'll find your perfect villa.
        </p>
        <Link
          to="/contact"
          className="mt-10 inline-block rounded-full bg-primary px-10 py-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-elegant)] transition-all hover:scale-105 hover:bg-primary/90"
        >
          Start Booking
        </Link>
      </section>
    </>
  );
}
