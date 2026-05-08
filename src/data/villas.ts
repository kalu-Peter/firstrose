import apt3bed from "@/assets/3beds/WhatsApp Image 2026-05-04 at 12.21.46.jpeg";
import poolhouse2bed from "@/assets/2beds/WhatsApp Image 2026-05-04 at 12.30.00.jpeg";

const beds3Raw = import.meta.glob<{ default: string }>("/src/assets/3beds/*.jpeg", { eager: true });
const beds3Images: string[] = Object.values(beds3Raw).map((m) => m.default);

const beds2Raw = import.meta.glob<{ default: string }>("/src/assets/2beds/*.jpeg", { eager: true });
const beds2Images: string[] = Object.values(beds2Raw).map((m) => m.default);

export type Villa = {
  id: string;
  name: string;
  location: string;
  price: number;
  currency?: "USD" | "KSH";
  priceLabel?: string;
  minStay?: number;
  monthlyDiscount?: number;
  beds: number;
  baths: number;
  guests: number;
  image: string;
  images: string[];
  description: string;
};

export const villas: Villa[] = [
  {
    id: "3bed-upper-floor",
    name: "3-Bed Upper Floor Apartment",
    location: "Mwabungo, Diani",
    price: 3300,
    currency: "KSH",
    priceLabel: "per room / day",
    minStay: 3,
    monthlyDiscount: 45,
    beds: 3,
    baths: 3,
    guests: 6,
    image: apt3bed,
    images: beds3Images,
    description:
      "3 individually bookable rooms on the upper floor — ideal for couples. Each room is KSH 3,300/night and shares a fully equipped kitchen and pool. The entire floor can also be rented as one unit for groups.",
  },
  {
    id: "2bed-pool-house",
    name: "2-Bedroom Pool House",
    location: "Mwabungo, Diani",
    price: 10000,
    currency: "KSH",
    priceLabel: "/ night",
    beds: 2,
    baths: 3,
    guests: 5,
    image: poolhouse2bed,
    images: beds2Images,
    description:
      "An intimate pool house retreat with two bedrooms and a private pool — perfect for couples or small families seeking a luxurious, sun-soaked escape.",
  },
];
