export type Review = {
  name: string;
  date: string;
  rating: number;
  text: string;
};

export const reviews: Review[] = [
  {
    name: "Marek",
    date: "August 2026",
    rating: 5,
    text: "Amazing stay in paradise! 🌴 We had an incredible time staying at this villa in Diani Beach! The property is absolutely stunning, even better than in the pictures – super clean, spacious, and equipped with everything you could possibly need for a relaxing holiday. The location is fantastic, just a short distance from the gorgeous beach and local restaurants. The outdoor area and pool are the absolute highlight – perfect for chilling out. A huge shoutout to the amazing staff who took such great care of us and made us feel completely at home and safe throughout our stay. Axel was a wonderful host – super responsive, helpful, and easy to communicate with. We couldn't have asked for a better experience and will definitely come back! Highly recommend to everyone!",
  },
  {
    name: "Elmar",
    date: "August 2026",
    rating: 5,
    text: "Was soll ich sagen. Es hätte nicht besser seien können. Nette Gastgeber, freundlicher Service… Wir waren rundum zufrieden und kommen wieder. Danke nochmal für alles. Erime und Elmar",
  },
  {
    name: "George",
    date: "August 2026",
    rating: 5,
    text: "Amazing stay. The villa is prestine and private. The host was very helpful and accommodating. He responded to messages quickly and was always available to help.",
  },
];
