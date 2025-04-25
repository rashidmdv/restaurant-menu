
export default function OurStorySection() {
  return (
    <section className="md:px-10 md:py-12" id="ourStory">
      <div className="flex flex-col md:flex-row max-w-7xl items-center mx-auto">
        {/* Image Section */}
        <div className="w-full lg:w-1/2 lg:h-[500px] md:flex md:justify-center lg:mt-4">
          <img
            src="/image1.png"
            alt="Restaurant Interior"
            className="object-cover w-full lg:w-[500px]"
          />
        </div>

        {/* Text Section */}
        <div className="w-full lg:w-1/2 px-6 md:pr-10 text-center my-10 md:my-0">
          <h2 className="text-[20px] lg:text-[30px] xl:text-[40px] font-bold mb-4">our story</h2>
          <p className="text-[15px] lg:text-[17px] xl:text-[20px] leading-relaxed px-4 md:px-0 xl:mt-3">
            Vivamus eget risus sem. Integer nec est lobortis, mollis elit id, egestas
            neque. Suspendisse potenti. Cras consequat tristique aliquet. Sed vel urna sed
            nisl tincidunt fringilla. Pellentesque vel purus urna. Aliquam placerat
            sagittis neque eget porta. Morbi finibus velit vel urna tincidunt, ac feugiat
            turpis feugiat. Nulla rutrum neque vitae nisi pellentesque, et mattis sapien
            consequat.
          </p>
        </div>
      </div>
    </section>
  );
}
