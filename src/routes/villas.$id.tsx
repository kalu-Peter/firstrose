import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { villas, type Villa } from "@/data/villas";

const INITIAL_COUNT = 10;

export const Route = createFileRoute("/villas/$id")({
  head: ({ loaderData }: { loaderData: Villa | undefined }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — Firstrose` },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: `${loaderData.name} — Firstrose` },
        ]
      : [],
  }),
  loader: ({ params }) => {
    const villa = villas.find((v) => v.id === params.id);
    if (!villa) throw notFound();
    return villa;
  },
  component: VillaDetailPage,
});

function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
        onClick={onClose}
        aria-label="Close"
      >
        ✕
      </button>

      {/* Prev */}
      {index > 0 && (
        <button
          className="absolute left-4 rounded-full bg-white/10 px-4 py-3 text-white transition hover:bg-white/20"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label="Previous"
        >
          ‹
        </button>
      )}

      {/* Image */}
      <img
        src={images[index]}
        alt={`Photo ${index + 1}`}
        className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next */}
      {index < images.length - 1 && (
        <button
          className="absolute right-4 rounded-full bg-white/10 px-4 py-3 text-white transition hover:bg-white/20"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="Next"
        >
          ›
        </button>
      )}

      {/* Counter */}
      <p className="absolute bottom-4 text-sm text-white/60">
        {index + 1} / {images.length}
      </p>
    </div>
  );
}

function VillaDetailPage() {
  const villa = Route.useLoaderData() as Villa;
  const gallery: string[] = villa.images.length > 0 ? villa.images : [villa.image];

  const [showAll, setShowAll] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const visibleImages = showAll ? gallery : gallery.slice(0, INITIAL_COUNT);
  const hasMore = gallery.length > INITIAL_COUNT;

  return (
    <div className="pb-24">
      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={gallery}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => (i !== null ? i - 1 : null))}
          onNext={() => setLightboxIndex((i) => (i !== null ? i + 1 : null))}
        />
      )}

      {/* Back */}
      <div className="mx-auto max-w-7xl px-6 pt-8">
        <Link
          to="/villas"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          ← All Villas
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-6">
        {/* Info + booking */}
        <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {villa.location}
            </p>
            <h1 className="mt-2 font-serif text-4xl text-foreground md:text-5xl">{villa.name}</h1>
            <div className="mt-5 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span>{villa.beds} Bedrooms</span>
              <span>{villa.baths} Baths</span>
              <span>Up to {villa.guests} guests</span>
            </div>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              {villa.description}
            </p>
          </div>

          {/* Pricing card */}
          <div className="shrink-0 rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] lg:w-72">
            <p className="font-serif text-3xl text-foreground">
              {villa.currency === "KSH" ? "KSH " : "$"}
              {villa.price.toLocaleString()}
              <span className="text-sm font-sans text-muted-foreground">
                {" "}
                {villa.priceLabel ?? "/ night"}
              </span>
            </p>
            {villa.minStay && (
              <p className="mt-1 text-xs text-muted-foreground">Minimum {villa.minStay} days</p>
            )}
            {villa.monthlyDiscount && (
              <p className="text-xs text-muted-foreground">
                {villa.monthlyDiscount}% discount for monthly stays
              </p>
            )}
            <Link
              to="/contact"
              className="mt-5 block rounded-full bg-primary px-6 py-3 text-center text-sm font-medium text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
            >
              Book this villa
            </Link>
          </div>
        </div>

        {/* Gallery */}
        {gallery.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 font-serif text-2xl text-foreground">
              Gallery
              <span className="ml-3 font-sans text-sm font-normal text-muted-foreground">
                {gallery.length} photos
              </span>
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {visibleImages.map((src: string, i: number) => (
                <button
                  key={i}
                  className="aspect-[4/3] overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => setLightboxIndex(i)}
                  aria-label={`View photo ${i + 1}`}
                >
                  <img
                    src={src}
                    alt={`${villa.name} — photo ${i + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </button>
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="rounded-full border border-border px-8 py-2.5 text-sm font-medium text-foreground transition-all hover:border-primary hover:text-primary"
                >
                  {showAll
                    ? "Show less"
                    : `View all ${gallery.length} photos`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
