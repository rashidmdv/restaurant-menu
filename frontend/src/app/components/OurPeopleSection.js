
'use client';

import LoadingSpinner from './LoadingSpinner';

export default function OurPeopleSection({ peopleData, loading, error }) {
    const defaultTitle = "Our People";
    const defaultContent = "Duis semper tempor mi, et dapibus diam. Proin feugiat nisl luctus condimentum ultricies. In hac habitasse platea dictumst. Cras commodo risus in purus vehicula vestibulum. Nunc volutpat interdum ultricies. Morbi sollicitudin, eros a mollis ullamcorper, lectus tellus ullamcorper dui, in varius justo velit.";
    const defaultImage = "/image2.png";

    const title = peopleData?.title || defaultTitle;
    const content = peopleData?.content || defaultContent;
    const imageUrl = peopleData?.image_url || defaultImage;

    return (
      <section className="md:px-10 md:py-4" id="ourPeople">
        <div className="flex flex-col md:flex-row-reverse justify-center items-center max-w-7xl mx-auto">
          {/* Image Section */}
          <div className="w-full lg:w-1/2 md:flex md:justify-center lg:mt-4">
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
          <div className="w-full lg:w-1/2 px-6 md:ps-10 text-center mt-10 md:mt-0">
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
