import villa1 from "@/assets/villa-1.jpg";

export type Villa = {
  id: string;
  name: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  guests: number;
  image: string;
  description: string;
};

export const villas: Villa[] = [
  {
    id: "firstrose",
    name: "Firstrose",
    location: "Diani Beach, Kenya",
    price: 480,
    beds: 4,
    baths: 3,
    guests: 8,
    image: villa1,
    description:
      "A serene beachside retreat just 10 minutes' walk from the white sands of Diani Beach — your perfect coastal escape on the Kenyan coast.",
  },
];
