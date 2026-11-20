import type { ContentBlock } from "@/data/travelStories";

export function StoryContentBlock({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p className="text-base leading-relaxed text-muted-foreground">{block.text}</p>;

    case "heading":
      return <h2 className="font-serif text-2xl text-foreground">{block.text}</h2>;

    case "image":
      return (
        <figure className="overflow-hidden rounded-2xl">
          <img
            src={block.src}
            alt={block.caption ?? ""}
            loading="lazy"
            className="w-full object-cover"
          />
          {block.caption && (
            <figcaption className="mt-2 text-center text-xs text-muted-foreground">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "quote":
      return (
        <blockquote className="border-l-2 border-primary pl-6">
          <p className="font-serif text-xl italic leading-relaxed text-foreground">
            “{block.text}”
          </p>
          {block.author && (
            <cite className="mt-2 block text-sm font-sans not-italic text-muted-foreground">
              — {block.author}
            </cite>
          )}
        </blockquote>
      );

    case "tip":
      return (
        <div className="rounded-xl bg-accent/40 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">Travel Tip</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{block.text}</p>
        </div>
      );

    case "recommendation":
      return (
        <div className="rounded-xl border border-border/60 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Local Recommendation
          </p>
          <p className="mt-2 font-serif text-lg text-foreground">{block.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{block.text}</p>
        </div>
      );

    default:
      return null;
  }
}
