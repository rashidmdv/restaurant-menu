export default function HeroSection() {
    return(
        <section id="" className="max:h-[80vh] lg:h-[80vh] pt-10 2xl:pt-12 background">
        <div className="flex flex-col-reverse md:flex-row h-full">

          {/* Left Column: Text */}
          <div className="sm:flex-1 flex flex-col sm:justify-center py-10">
            <h2 className="text-[20px] lg:text-[30px] xl:text-[40px] font-bold mb-4 text-center 2xl:ps-24">Le Beirut restaurant and café</h2>
            <p className="text-[15px] lg:text-[17px] xl:text-[20px] text-center px-10 md:px-16 lg:px-20 xl:px-28 2xl:ps-50 xl:mt-3">Maecenas tincidunt arcu sed volutpat vestibulum. Proin nec metus a elit elementum gravida sed vehicula sapien. Sed egestas, orci in maximus aliquet, augue sem scelerisque neque, ac accumsan orci eros vel nisl. Morbi eu blandit urna. Nam id luctus purus. Praesent euismod felis id quam iaculis, id condimentum lacus maximus.</p>
          </div>

          {/* Right Column: Image */}
          <div className="flex-1 relative">
            <img
              src="/home.png"
              alt="Hero"
              className="w-full h-full"
            />
          </div>

        </div>
      </section>
    )
}