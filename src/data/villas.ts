import apt3bed from "@/assets/3beds/WhatsApp Image 2026-05-04 at 12.21.46.jpeg";
import poolhouse2bed from "@/assets/2beds/WhatsApp Image 2026-05-04 at 12.30.00.jpeg";

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
  description: string;
};

export const villas: Villa[] = [
  {
    id: "3bed-upper-floor",
    name: "3-Bed Upper Floor Apartment",
    location: "Diani Beach, Kenya",
    price: 3300,
    currency: "KSH",
    priceLabel: "per room / day",
    minStay: 3,
    monthlyDiscount: 45,
    beds: 3,
    baths: 2,
    guests: 6,
    image: apt3bed,
    description:
      "3 rooms with a shared kitchen. Outside is a shared pool — a relaxed upper-floor retreat perfect for groups seeking comfort on the Kenyan coast.",
  },
  {
    id: "2bed-pool-house",
    name: "2-Bedroom Pool House",
    location: "Diani Beach, Kenya",
    price: 3300,
    currency: "KSH",
    priceLabel: "per room / day",
    beds: 2,
    baths: 2,
    guests: 4,
    image: poolhouse2bed,
    description:
      "An intimate pool house retreat with two bedrooms and a private pool — perfect for couples or small families seeking a luxurious, sun-soaked escape.",
  },
];
