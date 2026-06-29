import heroImage from "@/assets/hero-villa.jpeg";
import poolImage from "@/assets/pool.jpeg";
import poolViewImage from "@/assets/pool viw.jpeg";
import sampleImage from "@/assets/images/image1.jpeg";

// ── Image resolution ──────────────────────────────────────────────────────────
// No backend yet — images are uploaded manually by dropping files into folders
// under src/assets/travel-stories/. Until a story has real photos, these
// placeholder images are shown instead so the page always looks complete.
//
//   src/assets/travel-stories/hero.jpg                  → stories page hero banner
//   src/assets/travel-stories/<slug>/cover.jpg          → story card + detail cover
//   src/assets/travel-stories/<slug>/gallery/*.jpg      → story photo gallery
//
// Drop files in with those exact names/folders and they'll appear automatically
// — no code changes needed.

const FALLBACK_IMAGES = [heroImage, poolImage, poolViewImage, sampleImage];

const heroModules = import.meta.glob<{ default: string }>(
  "/src/assets/travel-stories/hero.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  { eager: true },
);

export const travelStoriesHeroImage: string =
  Object.values(heroModules)[0]?.default ?? heroImage;

const coverModules = import.meta.glob<{ default: string }>(
  "/src/assets/travel-stories/*/cover.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  { eager: true },
);
const galleryModules = import.meta.glob<{ default: string }>(
  "/src/assets/travel-stories/*/gallery/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  { eager: true },
);

function slugFromPath(path: string): string | null {
  const match = path.match(/travel-stories\/([^/]+)\//);
  return match ? match[1] : null;
}

const coverBySlug = new Map<string, string>();
for (const [path, mod] of Object.entries(coverModules)) {
  const slug = slugFromPath(path);
  if (slug) coverBySlug.set(slug, mod.default);
}

const galleryBySlug = new Map<string, string[]>();
for (const [path, mod] of Object.entries(galleryModules)) {
  const slug = slugFromPath(path);
  if (!slug) continue;
  const list = galleryBySlug.get(slug) ?? [];
  list.push(mod.default);
  galleryBySlug.set(slug, list);
}

function resolveCover(slug: string, fallbackIndex: number): string {
  return coverBySlug.get(slug) ?? FALLBACK_IMAGES[fallbackIndex % FALLBACK_IMAGES.length];
}

function resolveGallery(slug: string, fallbackIndex: number): string[] {
  const found = galleryBySlug.get(slug);
  if (found && found.length > 0) return found;
  return [FALLBACK_IMAGES[fallbackIndex % FALLBACK_IMAGES.length]];
}

// ── Types ─────────────────────────────────────────────────────────────────────

export const STORY_CATEGORIES = [
  "Beaches",
  "Nature",
  "Historic Sites",
  "Family Activities",
  "Food & Wine",
  "Romantic Escapes",
  "Hidden Gems",
] as const;

export type StoryCategory = (typeof STORY_CATEGORIES)[number];

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "image"; src: string; caption?: string }
  | { type: "quote"; text: string; author?: string }
  | { type: "tip"; text: string }
  | { type: "recommendation"; title: string; text: string };

export type TravelStory = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: ContentBlock[];
  category: StoryCategory;
  location: string;
  cover_image: string;
  gallery_images: string[];
  reading_time: string;
  publish_date: string;
  distance_from_property: string;
  travel_duration: string;
  best_season: string;
  recommended_stay: string;
  featured: boolean;
};

type StorySeed = Omit<TravelStory, "cover_image" | "gallery_images">;

const storySeeds: StorySeed[] = [
  {
    id: 1,
    title: "Sunrise Over Diani Beach",
    slug: "sunrise-over-diani-beach",
    excerpt:
      "Powder-white sand, warm Indian Ocean water, and a horizon that turns gold before the day even begins. Here's how to spend a perfect morning on Diani's shore.",
    category: "Beaches",
    location: "Diani Beach",
    reading_time: "5 min read",
    publish_date: "2026-01-14",
    distance_from_property: "1.5 km",
    travel_duration: "5 min walk",
    best_season: "Year-round (driest Jun–Oct)",
    recommended_stay: "Half day",
    featured: true,
    content: [
      {
        type: "paragraph",
        text: "There's a particular kind of quiet that settles over Diani Beach just before sunrise — fishermen pushing their ngalawa boats into the surf, the tide pulled back to reveal a mirror of wet sand, and the first colour bleeding into the sky over the reef.",
      },
      {
        type: "paragraph",
        text: "Most visitors arrive after breakfast, when the beach is already warm and busy. But the locals know the real magic happens between 5:30 and 7am, when you can walk for a kilometre without seeing another set of footprints.",
      },
      {
        type: "image",
        src: "",
        caption: "Low tide reveals tide pools and sandbars all along the shoreline.",
      },
      {
        type: "quote",
        text: "Diani doesn't perform for tourists in the morning — it just exists, quietly, the way it has for a thousand years.",
        author: "Local boat captain, Diani Beach",
      },
      {
        type: "tip",
        text: "Check tide tables before you go. Low tide exposes sandbars and tide pools perfect for an early swim; high tide is better for a longer walk along the dry sand.",
      },
      {
        type: "recommendation",
        title: "Forty Thieves Beach Bar",
        text: "A 10-minute walk south, this beachfront spot opens early for coffee and serves a proper breakfast once the sun is fully up.",
      },
    ],
  },
  {
    id: 2,
    title: "Walking with Colobus Monkeys in Diani Forest",
    slug: "walking-with-colobus-monkeys-in-diani-forest",
    excerpt:
      "Diani's last patches of coastal forest are home to the endangered Angolan black-and-white colobus. A short visit to a local sanctuary supports the species and the forest both.",
    category: "Nature",
    location: "Colobus Conservation, Diani",
    reading_time: "6 min read",
    publish_date: "2026-02-02",
    distance_from_property: "4 km",
    travel_duration: "10 min drive",
    best_season: "Year-round",
    recommended_stay: "Half day",
    featured: true,
    content: [
      {
        type: "paragraph",
        text: "Tucked behind the beach hotels, slivers of Diani's original Jadini coastal forest still stand — and they're the last home of a shy, strikingly marked primate found almost nowhere else on the Kenyan coast: the Angolan black-and-white colobus.",
      },
      {
        type: "paragraph",
        text: "Colobus Conservation runs guided forest walks where you can watch troops moving through the canopy, learn about the rope 'colobus bridges' strung across busy roads to prevent roadkill, and see the rescue and rehabilitation work happening on-site.",
      },
      {
        type: "image", src: "", caption: "A colobus troop resting in the forest canopy." },
      {
        type: "tip",
        text: "Bring binoculars if you have them — colobus tend to stay high in the canopy and are easiest to spot in the early morning or late afternoon when they come down to feed.",
      },
      {
        type: "recommendation",
        title: "Kaya Kinondo Sacred Forest",
        text: "If the forest walk leaves you wanting more, the sacred Kaya forest a little further south is an easy pairing for the same afternoon.",
      },
    ],
  },
  {
    id: 3,
    title: "The Ancient Kongo Mosque Ruins",
    slug: "the-ancient-kongo-mosque-ruins",
    excerpt:
      "Hidden in the bush just off the beach road, the 17th-century Kongo Mosque ruins are one of the coast's quietest and most atmospheric historic sites.",
    category: "Historic Sites",
    location: "Kongo Mosque, Diani",
    reading_time: "5 min read",
    publish_date: "2026-02-19",
    distance_from_property: "6 km",
    travel_duration: "15 min drive",
    best_season: "Dry season (Jun–Oct)",
    recommended_stay: "1–2 hours",
    featured: false,
    content: [
      {
        type: "paragraph",
        text: "Long before Diani became a beach destination, this stretch of coast was part of a network of Swahili trading settlements. The Kongo Mosque ruins — coral-stone walls and a single standing pillar tomb dating back roughly 400 years — are what remains of one of them.",
      },
      {
        type: "paragraph",
        text: "There are no crowds here, no entry gate, no gift shop. Just baobab roots working their way through old coral masonry and the kind of silence that makes you lower your voice without meaning to.",
      },
      {
        type: "quote",
        text: "You can still see the mihrab facing toward Mecca, exactly as it was carved centuries ago.",
      },
      {
        type: "tip",
        text: "Hire a local guide from the nearby village — the site isn't well signposted, and a guide will point out details (and stories) you'd otherwise miss entirely.",
      },
      {
        type: "recommendation",
        title: "Kongo River mangroves",
        text: "Combine the ruins with a short walk along the adjacent Kongo River mangroves before heading back to the beach.",
      },
    ],
  },
  {
    id: 4,
    title: "Dolphin Watching in the Kisite-Mpunguti Marine Park",
    slug: "dolphin-watching-in-the-kisite-mpunguti-marine-park",
    excerpt:
      "A full-day boat trip from Wasini Island brings you face to face with pods of dolphins, a pristine coral reef, and one of the best seafood lunches on the coast.",
    category: "Family Activities",
    location: "Wasini Island & Kisite-Mpunguti Marine Park",
    reading_time: "8 min read",
    publish_date: "2026-03-05",
    distance_from_property: "65 km",
    travel_duration: "1.5 hr drive + boat",
    best_season: "Oct–Mar (calmest seas)",
    recommended_stay: "Full day",
    featured: true,
    content: [
      {
        type: "paragraph",
        text: "South of Diani, past Shimoni village, the channel between the mainland and Wasini Island opens into Kenya's oldest marine national park — and one of the most reliable spots on the entire coast to see dolphins in the wild.",
      },
      {
        type: "paragraph",
        text: "Boats head out early to catch pods of spinner and bottlenose dolphins feeding before snorkelling over the coral gardens around Kisite Island, where visibility regularly exceeds 15 metres.",
      },
      { type: "image", src: "", caption: "A pod of spinner dolphins in the channel near Wasini." },
      {
        type: "tip",
        text: "Kids old enough to wear a mask and fins will love this trip, but pack motion-sickness tablets for the boat ride if anyone in your group is prone to seasickness.",
      },
      {
        type: "recommendation",
        title: "Wasini Island seafood lunch",
        text: "Most tour operators end the day with a traditional Swahili seafood lunch on Wasini — grilled fish, coconut rice, and tamarind sauce, served right on the beach.",
      },
    ],
  },
  {
    id: 5,
    title: "A Taste of the Coast: Swahili Street Food in Diani",
    slug: "a-taste-of-the-coast-swahili-street-food-in-diani",
    excerpt:
      "From charcoal-grilled mahamri to fresh coconut water cracked open on the spot, Diani's roadside food stalls are where the real coastal flavour lives.",
    category: "Food & Wine",
    location: "Diani Beach Road",
    reading_time: "6 min read",
    publish_date: "2026-03-21",
    distance_from_property: "3 km",
    travel_duration: "8 min drive",
    best_season: "Year-round",
    recommended_stay: "Evening, 2–3 hours",
    featured: false,
    content: [
      {
        type: "paragraph",
        text: "Beyond the beachfront restaurants, the real flavour of the coast is found along Diani Beach Road after dark, where charcoal braziers and folding tables turn into some of the best eating on the south coast.",
      },
      {
        type: "paragraph",
        text: "Start with mahamri — pillowy, cardamom-spiced fried bread — and viazi karai, deep-fried potatoes in a saffron-yellow batter served with a tamarind dip that's somehow both sweet and fiery.",
      },
      {
        type: "quote",
        text: "Coastal Kenyan food is built on coconut, cardamom, and patience — none of it is rushed, and none of it should be.",
      },
      {
        type: "tip",
        text: "Go with cash in small denominations, and don't be shy about pointing rather than asking — most stalls are used to curious visitors and happy to explain what's cooking.",
      },
      {
        type: "recommendation",
        title: "Ali Barbour's Cave Restaurant",
        text: "For a more formal coastal seafood dinner afterward, this candlelit restaurant set inside a natural limestone cave is unlike anywhere else on the coast.",
      },
    ],
  },
  {
    id: 6,
    title: "Sunset Dhow Cruise for Two",
    slug: "sunset-dhow-cruise-for-two",
    excerpt:
      "A traditional Swahili sailing dhow, a bottle of something cold, and the sun dropping into the Indian Ocean — Diani's most romantic evening out.",
    category: "Romantic Escapes",
    location: "Diani Beach",
    reading_time: "4 min read",
    publish_date: "2026-04-08",
    distance_from_property: "2 km",
    travel_duration: "5 min drive",
    best_season: "Year-round",
    recommended_stay: "Evening, 2–3 hours",
    featured: true,
    content: [
      {
        type: "paragraph",
        text: "Dhows have sailed this coastline for centuries, carrying spice and silk between Arabia, India, and East Africa. Today, the same elegant, hand-built sailboats carry something far less practical: couples watching the sun go down.",
      },
      {
        type: "paragraph",
        text: "Boats leave the beach a couple of hours before sunset, sailing parallel to the shore as the sky turns from blue to amber to deep rose. Most cruises include drinks, light snacks, and — if you ask — a quiet stretch of open water away from the crowd for the final few minutes of light.",
      },
      { type: "image", src: "", caption: "A traditional dhow silhouetted against the sunset." },
      {
        type: "tip",
        text: "Book the early evening slot in the dry season (June–October) for the clearest skies and the most dramatic colour as the sun drops below the horizon.",
      },
      {
        type: "recommendation",
        title: "The Sands at Nomad",
        text: "Several operators depart right from this stretch of beach — ask your captain to time the return to coincide with dinner reservations nearby.",
      },
    ],
  },
  {
    id: 7,
    title: "Kaya Kinondo: The Sacred Forest Few Visit",
    slug: "kaya-kinondo-the-sacred-forest-few-visit",
    excerpt:
      "A UNESCO-recognised sacred forest still guarded by Digo elders, Kaya Kinondo offers a side of the coast that most beach holidays never touch.",
    category: "Hidden Gems",
    location: "Kaya Kinondo Sacred Forest",
    reading_time: "7 min read",
    publish_date: "2026-05-02",
    distance_from_property: "9 km",
    travel_duration: "20 min drive",
    best_season: "Apr–Oct (lush and green)",
    recommended_stay: "Half day",
    featured: false,
    content: [
      {
        type: "paragraph",
        text: "Of the dozens of sacred kaya forests scattered along the Kenyan coast, Kaya Kinondo is one of the very few open to visitors — and only with a guide from the local Digo community, whose elders still use the forest for ceremonies.",
      },
      {
        type: "paragraph",
        text: "Walking beneath the dense canopy, your guide will point out medicinal plants, sacred groves where outsiders may not step, and centuries-old beliefs that have kept this patch of forest untouched while the coastline around it was cleared for development.",
      },
      {
        type: "quote",
        text: "This forest has never been cut. Our grandparents protected it, and we protect it now, for the ones who come after us.",
        author: "Kaya Kinondo community guide",
      },
      {
        type: "tip",
        text: "Dress modestly and bring small notes for the community guiding fee — it goes directly toward forest conservation and the local community trust.",
      },
      {
        type: "recommendation",
        title: "Kinondo Beach",
        text: "The walk ends close to a quiet, rarely-visited stretch of beach — a perfect, uncrowded spot to cool off afterward.",
      },
    ],
  },
];

export const travelStories: TravelStory[] = storySeeds.map((seed, i) => {
  const gallery_images = resolveGallery(seed.slug, i);
  let imageBlockIndex = 0;
  const content = seed.content.map((block) => {
    if (block.type !== "image") return block;
    const src = gallery_images[imageBlockIndex % gallery_images.length];
    imageBlockIndex += 1;
    return { ...block, src };
  });

  return {
    ...seed,
    content,
    cover_image: resolveCover(seed.slug, i),
    gallery_images,
  };
});

export function getStoryBySlug(slug: string): TravelStory | undefined {
  return travelStories.find((s) => s.slug === slug);
}

export function getRelatedStories(story: TravelStory, count = 3): TravelStory[] {
  const sameCategory = travelStories.filter(
    (s) => s.slug !== story.slug && s.category === story.category,
  );
  const others = travelStories.filter(
    (s) => s.slug !== story.slug && s.category !== story.category,
  );
  return [...sameCategory, ...others].slice(0, count);
}
