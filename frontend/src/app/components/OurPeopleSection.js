
export default function OurPeopleSection() {
    return (
      <section className="md:px-10 md:py-4" id="ourPeople">
        <div className="flex flex-col md:flex-row-reverse justify-center items-center max-w-7xl mx-auto">
          {/* Image Section */}
          <div className="w-full lg:w-1/2 md:flex md:justify-center lg:mt-4">
            <img
              src="/image2.png"
              alt="Restaurant Interior"
              className="object-cover w-full lg:w-[500px]"
            />
          </div>

          {/* Text Section */}
          <div className="w-full lg:w-1/2 px-6 md:ps-10 text-center mt-10 md:mt-0">
            <h2 className="text-[20px] lg:text-[30px] xl:text-[40px] font-bold mb-4">Our People</h2>
            <p className="text-[15px] lg:text-[17px] xl:text-[20px] leading-relaxed px-4 md:px-0 xl:mt-3">
                Duis semper tempor mi, et dapibus diam. Proin feugiat nisl luctus condimentum ultricies. In hac habitasse platea dictumst. Cras commodo risus in purus vehicula vestibulum. Nunc volutpat interdum ultricies. Morbi sollicitudin, eros a mollis ullamcorper, lectus tellus ullamcorper dui, in varius justo velit.
            </p>
          </div>
        </div>
      </section>
    );
  }
