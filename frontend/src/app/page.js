"use client";

import HeroCarousel from "./components/HeroCarousel";
import ContentBlock from "./components/ContentBlock";
import Footer from "./components/Footer";

export default function Home() {
  // Hero carousel images
  const heroImages = [
    "/loma/hero/hero-1.jpg",
    "/loma/hero/hero-2.jpg",
    "/loma/hero/hero-3.jpg",
    "/loma/hero/hero-4.jpg",
    "/loma/hero/hero-5.jpg",
  ];

  return (
    <main className="bg-[#fcf6e2]">
      {/* Hero Carousel */}
      <HeroCarousel
        images={heroImages}
        title="The World of Loma"
        subtitle="A revolutionary culinary journey in the heart of Dubai."
      />

      {/* First Content Block - Beyond Flavor */}
      <ContentBlock
        title="Beyond Flavor"
        paragraph="At Loma, the essence of the Mediterranean and the rich heritage of the Arab world blend to create an atmosphere of timeless elegance and balance. Here, natural ingredients, energized water, and our signature fermented date fiber shape a cuisine that goes beyond mere flavor, offering an experience of wellbeing, authenticity, and harmony. Every moment at the table is thoughtfully crafted to awaken the senses and celebrate the art of living well."
        image="/loma/beyond-flavor.jpg"
        imageAlt="Loma dining experience"
        buttonText="Discover More"
        buttonLink="/about"
        reverse={false}
      />

      {/* Second Content Block - Heritage Evolution */}
      <ContentBlock
        title="Heritage Evolution"
        paragraph="At Loma, gastronomy and science converge to shape a new vision of dining. Partnering with Dubai's own 'Siltrock', pioneers in probiotic innovation, and guided by Chef Matteo Casamichela — we transformed our cuisine into the soul of regenerative gastronomy. Our cuisine translates advances on the microbiome into Flavor, lightness, and wellbeing at the table. Fermented fibers, probiotics, and premium ingredients are not trends, but the foundation of a dining philosophy that honors heritage while embracing innovation. A vision where tradition evolves, and every dish becomes a dialogue between culture and innovation."
        image="/loma/heritage-evolution.jpg"
        imageAlt="Heritage and innovation"
        buttonText="Discover More"
        buttonLink="/vision"
        reverse={true}
      />

      {/* Third Content Block - Chef Matteo Casamichela */}
      <ContentBlock
        title="Chef Matteo Casamichela"
        paragraph="At the helm of Loma's kitchen is Chef Matteo Casamichela, a Sicilian talent shaped by the teachings of Gualtiero Marchesi, the master of modern Italian cuisine. Chef's culinary vision bridges Sicily and Arabia, reinterpreting ancient bonds between the Mediterranean and the Middle East with contemporary sensibility. Guided by a philosophy where taste and wellbeing are inseparable, he integrates probiotics, fermentations, and premium ingredients into each creation. The result is a cuisine that is both authentic and innovative — an experience that honors roots while shaping the future of fine dining."
        image="/loma/chef-profile.jpg"
        imageAlt="Chef Matteo Casamichela"
        buttonText="Discover More"
        buttonLink="/team"
        reverse={false}
      />

      {/* Footer */}
      <Footer />
    </main>
  );
}
