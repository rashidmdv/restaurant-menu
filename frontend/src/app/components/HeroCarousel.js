"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

export default function HeroCarousel({ images, title, subtitle, height = "h-[60vh] lg:h-[70vh]" }) {
  return (
    <div className={`relative w-full ${height} overflow-hidden`}>
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={true}
        loop={true}
        className="h-full w-full"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-full w-full">
              <img
                src={image}
                alt={`Hero ${index + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.src = "/home.png"; // Fallback image
                }}
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Hero Text Overlay */}
      {(title || subtitle) && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
          {title && (
            <h1 className="text-white font-bold text-[32px] md:text-[48px] lg:text-[60px] xl:text-[72px] mb-4 drop-shadow-2xl">
              {title}
            </h1>
          )}
          {subtitle && (
            <h2 className="text-white font-medium text-[18px] md:text-[24px] lg:text-[30px] xl:text-[36px] max-w-4xl drop-shadow-xl">
              {subtitle}
            </h2>
          )}
        </div>
      )}

      {/* Custom Swiper Styles */}
      <style jsx global>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: white;
          background: rgba(0, 0, 0, 0.5);
          width: 50px !important;
          height: 50px !important;
          border-radius: 50%;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        /* Target the actual SVG arrows (Swiper v12 uses SVG, not :after pseudo-elements) */
        .swiper-button-next svg,
        .swiper-button-prev svg {
          width: 20px !important;
          height: 20px !important;
          fill: currentColor;
        }

        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: rgba(198, 125, 48, 0.8);
        }

        .swiper-button-disabled {
          opacity: 0.35;
        }

        .swiper-pagination-bullet {
          background: white;
          opacity: 0.7;
        }

        .swiper-pagination-bullet-active {
          background: #c67d30;
          opacity: 1;
        }

        @media (max-width: 768px) {
          .swiper-button-next,
          .swiper-button-prev {
            width: 40px !important;
            height: 40px !important;
          }

          .swiper-button-next svg,
          .swiper-button-prev svg {
            width: 16px !important;
            height: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
