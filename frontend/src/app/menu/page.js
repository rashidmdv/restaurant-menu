"use client";

import { useState, useEffect } from "react";
import HeroCarousel from "../components/HeroCarousel";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import { useMenuData } from "../hooks/useMenuData";

export default function MenuPage() {
  const { data, loading, error } = useMenuData();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = data?.categories || [];
  const subcategories = data?.subcategories || [];
  const items = data?.items || [];

  // Auto-select first category when data loads
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  // Get subcategories for selected category
  const currentSubcategories = subcategories.filter(
    (sub) => sub.category_id === selectedCategory
  );

  return (
    <main className="bg-[#fcf6e2]">
      {/* Hero Section */}
      <HeroCarousel
        images={["/loma/menu/menu-hero.jpg"]}
        title="Our Menu"
        subtitle="Beyond flavor, towards harmony."
        height="h-[45vh] lg:h-[50vh]"
      />

      {/* Menu Content */}
      <div className="w-full py-16 lg:py-24 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error loading menu. Please try again later.</p>
            </div>
          ) : (
            <>
              {/* Category Navigation - Elegant Underlined Style */}
              {categories.length > 0 && (
                <nav className="flex flex-wrap justify-center gap-6 lg:gap-10 mb-16 pb-8 border-b border-[#C67D30]/15">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`relative text-[15px] lg:text-[17px] tracking-wide transition-all duration-300 pb-2 ${
                        selectedCategory === category.id
                          ? "text-[#C67D30] font-semibold"
                          : "text-[#5c4a2b] hover:text-[#C67D30] font-normal"
                      }`}
                    >
                      {category.name}
                      {/* Active Underline */}
                      <span
                        className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#C67D30] transition-transform duration-300 ${
                          selectedCategory === category.id ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </button>
                  ))}
                </nav>
              )}

              {/* Subcategories and Items - Flowing Layout */}
              <div className="space-y-16 lg:space-y-20">
                {currentSubcategories.map((subcategory, subIndex) => {
                  const subcategoryItems = items.filter(
                    (item) => item.sub_category_id === subcategory.id
                  );

                  return (
                    <section
                      key={subcategory.id}
                      className={`${
                        subIndex > 0 ? "border-t border-[#C67D30]/10 pt-16 lg:pt-20" : ""
                      }`}
                    >
                      {/* Subcategory Header */}
                      <div className="mb-10 lg:mb-12">
                        <h2 className="text-[#8B6F47] font-light text-[28px] lg:text-[36px] tracking-wider mb-2 text-center">
                          {subcategory.name}
                        </h2>
                        {subcategory.description && (
                          <p className="text-[#5c4a2b]/70 text-[13px] lg:text-[14px] text-center italic tracking-wide">
                            {subcategory.description}
                          </p>
                        )}
                      </div>

                      {/* Menu Items */}
                      {subcategoryItems.length > 0 ? (
                        <div className="space-y-8 lg:space-y-10">
                          {subcategoryItems.map((item) => (
                            <div key={item.id} className="group">
                              {/* Item Name and Price Line */}
                              <div className="flex items-baseline gap-3 mb-2">
                                <h3 className="text-[#4a3f2b] font-normal text-[17px] lg:text-[19px] tracking-wide">
                                  {item.name}
                                </h3>

                                {/* Dietary Indicators - Subtle */}
                                {item.dietary_info && (
                                  <div className="flex gap-2 text-[10px] text-[#5c4a2b]/50 tracking-widest uppercase">
                                    {item.dietary_info.vegetarian && <span>V</span>}
                                    {item.dietary_info.vegan && <span>VG</span>}
                                    {item.dietary_info.gluten_free && <span>GF</span>}
                                  </div>
                                )}

                                {/* Dotted Leader */}
                                <div className="hidden sm:block flex-1 border-b border-dotted border-[#5c4a2b]/20 mb-1" />

                                {/* Price */}
                                <span className="text-[#8B6F47] font-normal text-[16px] lg:text-[18px] tracking-wide">
                                  {item.price ? (
                                    <>
                                      {item.price}
                                      {item.currency && (
                                        <span className="text-[13px] lg:text-[14px] ml-1 opacity-70">
                                          {item.currency}
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    "MP"
                                  )}
                                </span>
                              </div>

                              {/* Description */}
                              {item.description && (
                                <p className="text-[#5c4a2b]/70 text-[14px] lg:text-[15px] leading-relaxed tracking-wide pl-0 max-w-3xl">
                                  {item.description}
                                </p>
                              )}

                              {/* Mobile Price (if dotted leader is hidden) */}
                              <div className="sm:hidden mt-2">
                                <span className="text-[#8B6F47] font-normal text-[15px] tracking-wide">
                                  {item.price ? `${item.price} ${item.currency || 'AED'}` : "Market Price"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-[#5c4a2b]/50 py-8 italic text-[15px]">
                          Items coming soon
                        </p>
                      )}
                    </section>
                  );
                })}
              </div>

              {/* No Categories Message */}
              {categories.length === 0 && !loading && (
                <div className="text-center py-16">
                  <p className="text-[#5c4a2b] text-[18px] italic tracking-wide">
                    Our menu is being prepared. Please check back soon.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
