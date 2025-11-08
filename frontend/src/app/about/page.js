"use client";

import HeroCarousel from "../components/HeroCarousel";
import ContentBlock from "../components/ContentBlock";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <main className="bg-[#fcf6e2]">
      {/* Hero Section */}
      <HeroCarousel
        images={["/loma/about/about-hero.jpg"]}
        title="Beyond Flavor: the Loma essence"
        subtitle="Our Story, Our Vision, Our Values"
        height="h-[50vh] lg:h-[60vh]"
      />

      {/* First Content Block - What's Loma? */}
      <ContentBlock
        title="What's Loma?"
        paragraph="Around the world, science and gastronomy are converging. Research on the microbiome and fermented foods confirms what ancient cultures have always known: that food has the power to heal, restore balance, and connect us more deeply with ourselves and with others. At Loma, we embrace this evolution. We believe that dining is more than food — it is a way to restore balance, create connections, and experience authenticity."
        image="/loma/about/about-what-is-loma.jpg"
        imageAlt="What is Loma"
        reverse={false}
      />

      {/* Second Content Block - Our Philosophy */}
      <ContentBlock
        title="Our Philosophy"
        paragraph="Our concept was born from the idea of transforming local resources into a new language of cuisine. The ancient date palm, a symbol of Arab heritage, has been reimagined through natural fermentation into our signature fermented date fiber: a functional ingredient that enriches flavors while supporting gut health and lightness. Even water evolves. With our energized water 'Aqua Vitera,' purified and revitalized through movement, light, and harmony, hydration becomes an essential part of the dining journey—refreshing the body, clearing the senses, and preparing the palate. Loma is more than a restaurant: it is a living lab where gastronomy, innovation, and hospitality converge. Probiotics, fermentations, and carefully selected premium ingredients are seamlessly integrated into every dish — not as trends, but as the foundation of a new paradigm in fine dining."
        image="/loma/about/about-philosophy.jpg"
        imageAlt="Our Philosophy"
        reverse={true}
      />

      {/* Third Content Block - Our Values */}
      <ContentBlock
        title="Our Values"
        paragraph="For us, authenticity, innovation, and tradition are interconnected elements that form a global movement redefining hospitality. This is the Vision we embrace: a cuisine that nourishes both body and spirit, respects its roots, and paves the way for future wellbeing through food. Every detail — from how we design our menu to how we welcome our guests — is guided by transparency, integrity, and empathy. The result is a space where taste, culture, and wellness converge, and where each guest becomes part of a community built on trust, vitality, and the art of living well."
        image="/loma/about/about-values.jpg"
        imageAlt="Our Values"
        reverse={false}
      />

      {/* Footer */}
      <Footer />
    </main>
  );
}
