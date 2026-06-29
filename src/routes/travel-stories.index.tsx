import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { STORY_CATEGORIES, travelStories, travelStoriesHeroImage } from "@/data/travelStories";
import { StoryCard } from "@/components/travel-stories/StoryCard";
import { SITE_URL } from "@/lib/config";

const PAGE_TITLE = "Travel Stories & Local Experiences — Firstrose";
const PAGE_DESCRIPTION =
  "Discover hidden gems, unforgettable adventures, and inspiring destinations near your stay at Firstrose, Diani Beach.";

export const Route = createFileRoute("/travel-stories/")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/travel-stories` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/travel-stories` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: PAGE_TITLE,
          description: PAGE_DESCRIPTION,
          url: `${SITE_URL}/travel-stories`,
          hasPart: travelStories.map((s) => ({
            "@type": "Article",
            headline: s.title,
            url: `${SITE_URL}/travel-stories/${s.slug}`,
          })),
        }),
      },
    ],
  }),
  component: TravelStoriesPage,
});

const CHIPS = ["All Stories", ...STORY_CATEGORIES] as const;

function TravelStoriesPage() {
  const [activeChip, setActiveChip] = useState<string>("All Stories");

  const filteredStories = useMemo(() => {
    if (activeChip === "All Stories") return travelStories;
    return travelStories.filter((s) => s.category === activeChip);
  }, [activeChip]);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        <img
          src={travelStoriesHeroImage}
          alt="A scenic destination near Firstrose, Diani Beach"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
        <div className="relative mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-sm uppercase tracking-[0.3em] text-white/80"
          >
            Diani Beach, Kenya
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-4xl text-white sm:text-5xl md:text-6xl"
          >
            Travel Stories &amp; Local Experiences
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 max-w-xl text-lg text-white/90"
          >
            Discover hidden gems, unforgettable adventures, and inspiring destinations near your
            stay.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10"
          >
            <a
              href="#stories"
              className="inline-flex rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-elegant)] transition-all hover:scale-105 hover:bg-primary/90"
            >
              Explore Stories
            </a>
          </motion.div>
        </div>
      </section>

      {/* Filter chips */}
      <section id="stories" className="mx-auto max-w-7xl px-6 pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-primary">The Collection</p>
          <h2 className="font-serif text-4xl text-foreground md:text-5xl">Stories Worth Chasing</h2>
        </div>

        <div className="mt-10 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:justify-center [&::-webkit-scrollbar]:hidden">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-medium transition-all ${
                activeChip === chip
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </section>

      {/* Story grid */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <AnimatePresence mode="popLayout">
          {filteredStories.length > 0 ? (
            <motion.div
              key={activeChip}
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredStories.map((story, i) => (
                <StoryCard key={story.id} story={story} index={i} />
              ))}
            </motion.div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center text-muted-foreground"
            >
              No stories in this category yet — check back soon.
            </motion.p>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
