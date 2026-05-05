import { createFileRoute, Link } from "@tanstack/react-router";
import { villas } from "@/data/villas";
import { useCurrentPrices } from "@/hooks/useCurrentPrices";

export const Route = createFileRoute("/villas/")({
  head: () => ({
    meta: [
      { title: "Our Villas — Firstrose" },
      {
        name: "description",
        content:
          "Explore our curated villas in Diani Beach, Kenya — a 3-bed upper floor apartment and a 2-bedroom pool house. Book your stay today.",
      },
      { property: "og:title", content: "Our Villas — Firstrose" },
      {
        property: "og:description",
        content: "Curated coastal villas in Diani Beach, Kenya — book your perfect retreat.",
      },
    ],
  }),
  component: VillasPage,
});

function VillasPage() {
  const currentPrices = useCurrentPrices();

  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-primary">The Collection</p>
        <h1 className="font-serif text-5xl text-foreground md:text-6xl">Our Villas</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          A serene retreat on the Kenyan coast chosen for its setting, soul, and the way it makes
          you feel the moment you arrive.
        </p>
      </div>

      <div className="mt-20 space-y-20">
        {villas.map((villa, i) => (
          <article
            key={villa.id}
            className={`grid gap-10 md:grid-cols-2 md:items-center ${
              i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
            }`}
          >
            <div className="overflow-hidden rounded-2xl shadow-[var(--shadow-card)]">
              <img
                src={villa.image}
                alt={villa.name}
                width={1024}
                height={768}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {villa.location}
              </p>
              <h2 className="mt-3 font-serif text-4xl text-foreground">{villa.name}</h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                {villa.description}
              </p>
              <div className="mt-6 flex gap-6 text-sm text-muted-foreground">
                <span>{villa.beds} Bedrooms</span>
                <span>{villa.baths} Baths</span>
                <span>Up to {villa.guests} guests</span>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <div>
                  <p className="font-serif text-2xl text-foreground">
                    {villa.currency === "KSH" ? "KSH " : "$"}
                    {(currentPrices[villa.id] ?? villa.price).toLocaleString()}
                    <span className="text-sm font-sans text-muted-foreground">
                      {" "}
                      {villa.priceLabel ?? "/ night"}
                    </span>
                  </p>
                  {villa.minStay && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Minimum {villa.minStay} days
                    </p>
                  )}
                  {villa.monthlyDiscount && (
                    <p className="text-xs text-muted-foreground">
                      {villa.monthlyDiscount}% discount for monthly stays
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to="/villas/$id"
                    params={{ id: villa.id }}
                    className="rounded-full border border-primary px-6 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                  >
                    View details
                  </Link>
                  <Link
                    to="/contact"
                    className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                  >
                    Book
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
