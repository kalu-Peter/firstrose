import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { getRelatedStories, getStoryBySlug } from "@/data/travelStories";
import { villas } from "@/data/villas";
import { useCurrentPrices } from "@/hooks/useCurrentPrices";
import { StoryCard } from "@/components/travel-stories/StoryCard";
import { StoryContentBlock } from "@/components/travel-stories/StoryContentBlock";
import { GalleryLightbox } from "@/components/travel-stories/GalleryLightbox";
import { SITE_URL } from "@/lib/config";

export const Route = createFileRoute("/travel-stories/$slug")({
  loader: ({ params }) => {
    const story = getStoryBySlug(params.slug);
    if (!story) throw notFound();
    return { story, related: getRelatedStories(story) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { story } = loaderData;
    const url = `${SITE_URL}/travel-stories/${story.slug}`;

    return {
      meta: [
        { title: `${story.title} — Firstrose Travel Stories` },
        { name: "description", content: story.excerpt },
        { property: "og:title", content: story.title },
        { property: "og:description", content: story.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:image", content: story.cover_image },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: story.title,
            description: story.excerpt,
            image: [story.cover_image],
            datePublished: story.publish_date,
            author: { "@type": "Organization", name: "Firstrose" },
            publisher: { "@type": "Organization", name: "Firstrose" },
            mainEntityOfPage: url,
          }),
        },
      ],
    };
  },
  component: StoryDetailPage,
});

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}

function StoryDetailPage() {
  const { story, related } = Route.useLoaderData();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const currentPrices = useCurrentPrices();

  const villa = villas[story.id % villas.length];
  const villaPrice = currentPrices[villa.id] ?? villa.price;

  return (
    <div className="pb-24">
      {lightboxIndex !== null && (
        <GalleryLightbox
          images={story.gallery_images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}

      {/* Story hero */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <img
          src={story.cover_image}
          alt={story.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/75" />
        <div className="relative mx-auto flex h-full max-w-5xl flex-col items-start justify-end px-6 pb-16">
          <Link
            to="/travel-stories"
            className="mb-6 inline-flex items-center gap-1 text-sm text-white/80 transition-colors hover:text-white"
          >
            ← All Stories
          </Link>
          <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-white backdrop-blur-sm">
            {story.category}
          </span>
          <h1 className="mt-4 font-serif text-4xl text-white md:text-5xl">{story.title}</h1>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
            <span>{story.location}</span>
            <span>{format(new Date(story.publish_date), "MMMM d, yyyy")}</span>
            <span>{story.reading_time}</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6">
        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_320px]">
          {/* Content */}
          <article className="max-w-2xl space-y-6">
            {story.content.map((block, i) => (
              <StoryContentBlock key={i} block={block} />
            ))}
          </article>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
              <h3 className="font-serif text-xl text-foreground">Plan Your Visit</h3>
              <dl className="mt-5 space-y-4 text-sm">
                <InfoRow label="Distance" value={story.distance_from_property} />
                <InfoRow label="Travel Time" value={story.travel_duration} />
                <InfoRow label="Best Season" value={story.best_season} />
                <InfoRow label="Recommended Stay" value={story.recommended_stay} />
              </dl>
            </div>
          </aside>
        </div>

        {/* Photo gallery */}
        {story.gallery_images.length > 0 && (
          <section className="mt-20">
            <h2 className="font-serif text-3xl text-foreground">
              Photo Gallery
              <span className="ml-3 font-sans text-sm font-normal text-muted-foreground">
                {story.gallery_images.length} photos
              </span>
            </h2>
            <div className="mt-8 columns-2 gap-3 sm:columns-3">
              {story.gallery_images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className="mb-3 block w-full overflow-hidden rounded-xl break-inside-avoid focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={`View photo ${i + 1}`}
                >
                  <img
                    src={src}
                    alt={`${story.title} — photo ${i + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Related stories */}
        {related.length > 0 && (
          <section className="mt-24">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-primary">Keep Exploring</p>
            <h2 className="font-serif text-3xl text-foreground md:text-4xl">Continue Exploring</h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((s, i) => (
                <StoryCard key={s.id} story={s} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Booking conversion */}
      <section className="mt-24 bg-accent/30 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-center text-sm uppercase tracking-[0.3em] text-primary">
            Staying Nearby?
          </p>
          <div className="mt-8 flex flex-col items-center gap-8 rounded-2xl bg-card p-8 shadow-[var(--shadow-card)] md:flex-row">
            <div className="h-56 w-full shrink-0 overflow-hidden rounded-xl md:h-48 md:w-72">
              <img
                src={villa.image}
                alt={villa.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {villa.location}
              </p>
              <h3 className="mt-2 font-serif text-2xl text-foreground">{villa.name}</h3>
              <p className="mt-3 font-serif text-2xl text-foreground">
                {villa.currency === "KSH" ? "KSH " : "$"}
                {villaPrice.toLocaleString()}
                <span className="text-sm font-sans text-muted-foreground">
                  {" "}
                  {villa.priceLabel ?? "/ night"}
                </span>
              </p>
              <Link
                to="/contact"
                className="mt-5 inline-block rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
