import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { TravelStory } from "@/data/travelStories";

export function StoryCard({ story, index = 0 }: { story: TravelStory; index?: number }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      className="group overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-elegant)]"
    >
      <Link to="/travel-stories/$slug" params={{ slug: story.slug }} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={story.cover_image}
            alt={story.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-foreground backdrop-blur-sm">
            {story.category}
          </span>
        </div>

        <div className="p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {story.location}
          </p>
          <h3 className="mt-2 font-serif text-2xl text-foreground transition-colors group-hover:text-primary">
            {story.title}
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {story.excerpt}
          </p>

          <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
            <span className="text-xs text-muted-foreground">{story.reading_time}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-all group-hover:bg-primary/90 group-hover:gap-2">
              Read Story <span aria-hidden>→</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
