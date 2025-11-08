"use client";

import HeroCarousel from "../components/HeroCarousel";
import ContentBlock from "../components/ContentBlock";
import Footer from "../components/Footer";
import Link from "next/link";

export default function VisionPage() {
  return (
    <main className="bg-[#fcf6e2]">
      {/* Hero Section */}
      <HeroCarousel
        images={["/loma/vision/vision-hero.jpg"]}
        title="Heritage Evolution: Timeless Roots, Contemporary Vision"
        subtitle="Crafted by Research, Guided by Taste"
        height="h-[50vh] lg:h-[60vh]"
      />

      {/* First Content Block - Our Contemporary Vision */}
      <ContentBlock
        title="Our Contemporary Vision"
        paragraph="At Loma, we believe that the future of gastronomy is written in dialogue with the past. Our Vision is rooted in the timeless traditions of the Mediterranean and the Arab world — cultures where bread, spices, and hospitality have always symbolized unity and belonging."
        image="/loma/vision/vision-contemporary.jpg"
        imageAlt="Contemporary Vision"
        reverse={false}
      />

      {/* Second Content Block - Our Renewed Heritage */}
      <ContentBlock
        title="Our Renewed Heritage"
        paragraph={
          <>
            Yet, heritage is not static. Led by Sicilian{" "}
            <Link href="/team" className="text-[#C67D30] hover:underline font-semibold">
              Chef Matteo Casamichela
            </Link>
            , our cuisine engages in dialogue with Arab heritage, renewing the ancient bond between the
            Mediterranean and the Middle East. We reinterpret tradition through contemporary research, natural
            fermentation, and innovations such as our fermented date fiber and energized water, "Aqua Vitera".
            These elements embody our commitment to a cuisine that is both authentic and forward-looking, where
            flavor and wellbeing are inseparable.
          </>
        }
        image="/loma/vision/vision-heritage.jpg"
        imageAlt="Renewed Heritage"
        reverse={true}
      />

      {/* Third Content Block - Our Innovative Menu */}
      <ContentBlock
        title="Our Innovative Menu"
        paragraph={
          <>
            This philosophy shapes every aspect of our{" "}
            <Link href="/menu" className="text-[#C67D30] hover:underline font-semibold">
              menu
            </Link>
            . Probiotics are naturally integrated into recipes, enriching flavors, bringing lightness and balance.
            From our selection of breads, crafted with ancient grains and fermented date fiber, to our specialty
            coffee roasted with rare cold-roast techniques, every detail reflects the same pursuit of harmony. Even
            our bar redefines tradition: the exclusive mocktails by Valerio Capriotti — inspired by classic drinks
            but created with energized water and probiotics — turn each sip into a ritual of wellbeing. This is what
            we call Heritage Evolution: honoring ancient roots while embracing the innovation that shapes tomorrow.
            At Loma, tradition evolves into a new paradigm of fine dining — one that measures excellence not only in
            taste, but in how you feel, long after the experience is over.
          </>
        }
        image="/loma/vision/vision-menu.jpg"
        imageAlt="Innovative Menu"
        reverse={false}
      />

      {/* Footer */}
      <Footer />
    </main>
  );
}
