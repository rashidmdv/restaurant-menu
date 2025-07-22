'use client';

import LoadingSpinner from './LoadingSpinner';

export default function HeroSection({ heroData, loading, error }) {
    const defaultTitle = "Le Beirut restaurant and café";
    const defaultContent = "Maecenas tincidunt arcu sed volutpat vestibulum. Proin nec metus a elit elementum gravida sed vehicula sapien. Sed egestas, orci in maximus aliquet, augue sem scelerisque neque, ac accumsan orci eros vel nisl. Morbi eu blandit urna. Nam id luctus purus. Praesent euismod felis id quam iaculis, id condimentum lacus maximus.";
    const defaultImage = "/home.png";

    const title = heroData?.title || defaultTitle;
    const content = heroData?.content || defaultContent;
    const imageUrl = heroData?.image_url || defaultImage;

    return(
        <section id="" className="max:h-[80vh] lg:h-[80vh] pt-10 2xl:pt-12 background">
        <div className="flex flex-col-reverse md:flex-row h-full">

          {/* Left Column: Text */}
          <div className="sm:flex-1 flex flex-col sm:justify-center py-10">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <LoadingSpinner size="medium" />
              </div>
            ) : (
              <>
                <h2 className="text-[20px] lg:text-[30px] xl:text-[40px] font-bold mb-4 text-center 2xl:ps-24">
                  {title}
                </h2>
                <p className="text-[15px] lg:text-[17px] xl:text-[20px] text-center px-10 md:px-16 lg:px-20 xl:px-28 2xl:ps-50 xl:mt-3">
                  {content}
                </p>
                {error && (
                  <p className="text-red-500 text-sm text-center mt-2">
                    Using fallback content
                  </p>
                )}
              </>
            )}
          </div>

          {/* Right Column: Image */}
          <div className="flex-1 relative">
            <img
              src={imageUrl}
              alt="Hero"
              className="w-full h-full"
              onError={(e) => {
                e.target.src = defaultImage;
              }}
            />
          </div>

        </div>
      </section>
    )
}