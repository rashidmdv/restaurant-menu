// components/LocationSection.js

export default function OurLocationSection() {
    return (
      <section className="pt-12 md:py-16 flex flex-col md:flex-row h-full max-w-7xl mx-auto" id="location">
        {/* Map */}
        <div className="w-full md:w-1/2 h-[300px] md:h-auto">
          <img
            src="/map-placeholder.png"
            alt="Our Location - Oud Metha, Dubai"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Location Details */}
        <div className="w-full md:w-1/2 bg-[#fef5e5] text-center flex items-center justify-center py-10">
          <div className="max-w-md text-[#bc7a2e] space-y-4 text-base md:text-lg">
            <h2 className="text-[20px] lg:text-[30px] xl:text-[40px] font-bold mb-4">our location</h2>

            <p className="text-[15px] lg:text-[17px] xl:text-[20px] leading-relaxed px-4 md:px-0 xl:mt-3">248 oud metha rd<br />oud metha<br />dubai</p>

            <p className="text-[15px] lg:text-[17px] xl:text-[20px] leading-relaxed px-4 md:px-0 xl:mt-3">
              phone: 800-lebeirut<br />
              email: hello@lebeirut.me
            </p>

            <p className="text-[15px] lg:text-[17px] xl:text-[20px] leading-relaxed px-4 md:px-0 xl:mt-3">
              monday-thursday: 8:00 – 23:00<br />
              friday-saturday: 8:00 – 00:00<br />
              sunday: 8:00 – 23:00
            </p>
          </div>
        </div>
      </section>
    );
  }
