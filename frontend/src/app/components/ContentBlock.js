"use client";

import Link from "next/link";

export default function ContentBlock({
  title,
  paragraph,
  image,
  imageAlt = "Content image",
  buttonText,
  buttonLink,
  reverse = false, // false = image on right, true = image on left
  videoPoster,
  videoSrc,
}) {
  const isVideo = !!videoSrc;

  // Detect if video is YouTube or Vimeo embed
  const getVideoEmbedUrl = (url) => {
    if (!url) return null;

    // YouTube detection
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`;
    }

    // Vimeo detection
    const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Return null if not YouTube/Vimeo (will use direct video file)
    return null;
  };

  const embedUrl = getVideoEmbedUrl(videoSrc);
  const isEmbed = !!embedUrl;

  return (
    <div className="w-full py-12 lg:py-20 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div
          className={`flex flex-col ${
            reverse ? "lg:flex-row-reverse" : "lg:flex-row"
          } gap-8 lg:gap-12 items-center`}
        >
          {/* Text Content */}
          <div className="flex-1 w-full">
            {title && (
              <h3 className="font-bold text-[#C67D30] text-[24px] md:text-[32px] lg:text-[40px] mb-6">
                {title}
              </h3>
            )}
            {paragraph && (
              <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] xl:text-[19px] leading-relaxed mb-8">
                {paragraph}
              </p>
            )}
            {buttonText && buttonLink && (
              <Link href={buttonLink}>
                <button className="bg-[#C67D30] hover:bg-[#a66825] text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300 text-[15px] lg:text-[17px]">
                  {buttonText}
                </button>
              </Link>
            )}
          </div>

          {/* Image/Video Content */}
          <div className="flex-1 w-full">
            {isVideo ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-xl">
                {isEmbed ? (
                  // YouTube/Vimeo embed
                  <iframe
                    src={embedUrl}
                    title={title || "Video"}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  // Direct video file
                  <video
                    controls
                    poster={videoPoster || "/home.png"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Video loading error");
                    }}
                  >
                    <source src={videoSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            ) : (
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <img
                  src={image}
                  alt={imageAlt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = "/home.png"; // Fallback image
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
