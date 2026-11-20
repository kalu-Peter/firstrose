import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { fadeInUp, fadeInLeft, viewportOnce, revealTransition } from "@/lib/motion";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Firstrose" },
      {
        name: "description",
        content:
          "Learn about Firstrose — a beachside villa in Diani Beach, Kenya, 10 minutes' walk to the ocean.",
      },
      { property: "og:title", content: "About — Firstrose" },
      {
        property: "og:description",
        content:
          "A beachside villa in Diani Beach, Kenya — crafted for comfort and coastal living.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <motion.p
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeInLeft}
        transition={revealTransition()}
        className="mb-3 text-sm uppercase tracking-[0.3em] text-primary"
      >
        Our Story
      </motion.p>
      <motion.h1
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeInLeft}
        transition={revealTransition(0.1)}
        className="font-serif text-5xl text-foreground md:text-6xl"
      >
        A quiet way to travel.
      </motion.h1>
      <div className="mt-12 space-y-6 text-lg leading-relaxed text-muted-foreground">
        {[
          `Firstrose began with a simple idea: that the most meaningful holidays happen in spaces
          that feel personal not polished. Nestled in the heart of Diani Beach, Kenya, the villa is
          just 10 minutes' walk from one of Africa's most beautiful stretches of white sand.`,
          `Every detail has been carefully considered to make your stay feel effortless from the
          moment you arrive to the moment you reluctantly leave. We work to ensure the experience is
          seamless for every guest.`,
          `Whether you're planning a family gathering, a romantic retreat, or a celebration with
          friends, Firstrose is the right place and we make it easy to book.`,
        ].map((paragraph, i) => (
          <motion.p
            key={i}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeInUp}
            transition={revealTransition(i * 0.1)}
          >
            {paragraph}
          </motion.p>
        ))}
      </div>
    </div>
  );
}
