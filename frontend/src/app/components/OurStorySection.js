
'use client';

import LoadingSpinner from './LoadingSpinner';

export default function OurStorySection({ storyData, loading, error }) {
  const defaultTitle = "our story";
  const defaultContent = "Vivamus eget risus sem. Integer nec est lobortis, mollis elit id, egestas neque. Suspendisse potenti. Cras consequat tristique aliquet. Sed vel urna sed nisl tincidunt fringilla. Pellentesque vel purus urna. Aliquam placerat sagittis neque eget porta. Morbi finibus velit vel urna tincidunt, ac feugiat turpis feugiat. Nulla rutrum neque vitae nisi pellentesque, et mattis sapien consequat.";
  const defaultImage = "/image1.png";

  const title = storyData?.title || defaultTitle;
  const content = storyData?.content || defaultContent;
  const imageUrl = storyData?.image_url || defaultImage;

  return (
    <section className="md:px-10 md:py-12" id="story">
      <div className="flex flex-col md:flex-row max-w-7xl items-center mx-auto">
        {/* Image Section */}
        <div className="w-full lg:w-1/2 lg:h-[500px] md:flex md:justify-center lg:mt-4">
          <img
            src={imageUrl}
            alt="Restaurant Interior"
            className="object-cover w-full lg:w-[500px]"
            onError={(e) => {
              e.target.src = defaultImage;
            }}
          />
        </div>

        {/* Text Section */}
        <div className="w-full lg:w-1/2 px-6 md:pr-10 text-center my-10 md:my-0">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner size="medium" />
            </div>
          ) : (
            <>
              <h2 className="text-[20px] lg:text-[30px] xl:text-[40px] font-bold mb-4">
                {title}
              </h2>
              <p className="text-[15px] lg:text-[17px] xl:text-[20px] leading-relaxed px-4 md:px-0 xl:mt-3">
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
      </div>
    </section>
  );
}
