"use client";

import HeroCarousel from "../components/HeroCarousel";
import ContentBlock from "../components/ContentBlock";
import Footer from "../components/Footer";

export default function TeamPage() {
  return (
    <main className="bg-[#fcf6e2]">
      {/* Hero Section */}
      <HeroCarousel
        images={["/loma/team/team-hero.jpg"]}
        title="At the Heart of Loma"
        subtitle="Chef Matteo Casamichela & his Brigade"
        height="h-[50vh] lg:h-[60vh]"
      />

      {/* First Content Block - Chef Matteo Casamichela (with video) */}
      <ContentBlock
        title="Chef Matteo Casamichela"
        paragraph="After a successful career in some of Europe's most prestigious restaurants, Chef Matteo Casamichela embraced Loma's Vision and made it his own. Trained under the guidance of Gualtiero Marchesi, the father of modern Italian cuisine, he brings with him the discipline of haute cuisine, the creativity of Sicilian tradition, and a constant curiosity to explore new cultural dialogues. At Loma, his role extends beyond creating dishes: he embodies a philosophy. Each creation reflects his belief that cuisine should unite flavor, wellbeing, and authenticity, beginning with the careful selection of the finest ingredients and guided by the integration of probiotics, fermentations, and energized water. This approach results in a unique experience where the elegance of technique meets the depth of cultural memory. From bread baked daily to mocktails crafted with probiotics, the entire gastronomic journey embodies the Chef's distinctive vision: food is rooted in history, yet by looking to the past, it can continuously evolve and project itself into the future."
        videoSrc="https://youtu.be/Iq3g7Nwfo5A"
        videoPoster="/loma/team/team-chef-video-poster.jpg"
        reverse={false}
      />

      {/* Second Content Block - The Chef's Team */}
      <ContentBlock
        title="The Chef's Team"
        paragraph="A vision can only flourish with the right team. Guided by Matteo's experience, Loma's brigade learns to infuse warmth into technique and care into precision. Their measured gestures and quiet attention create a perfect bridge between the kitchen and the table, making every guest feel part of something special, not just served, but truly welcomed. Together, Chef Casamichela and his team embody the essence of Loma: a place where Mediterranean mastery meets Arab heritage, and where tradition evolves into the future of fine dining."
        image="/loma/team/team-brigade.jpg"
        imageAlt="The Chef's Team"
        reverse={true}
      />

      {/* Footer */}
      <Footer />
    </main>
  );
}
