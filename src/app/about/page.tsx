import type { Metadata } from "next";
import { AboutClient } from "./about-client";

export const metadata: Metadata = {
  title: "About KRYSO | Artist Biography, Music Legacy & Showcases",
  description:
    "Explore the journey, music production, live concert legacy, and sonic milestones of international DJ & Producer KRYSO.",
  openGraph: {
    title: "About KRYSO — Artist Biography & Live Tour Showcase",
    description: "International stage performer, sound architect, and music educator based in Pune, India.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
