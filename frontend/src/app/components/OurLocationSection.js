// components/LocationSection.js

export default function OurLocationSection() {
    return (
      <section className="pt-12 md:py-16 flex flex-col md:flex-row h-full max-w-7xl mx-auto" id="location">
        {/* Map */}
        <div className="w-full md:w-1/2 h-[300px] md:h-auto">
          <iframe
            className="w-full h-full"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115391.71813849845!2d55.270782!3d25.204849!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f4338f1dbfd31%3A0x8a4f30d4e2f7598f!2sOud%20Metha%2C%20Dubai!5e0!3m2!1sen!2sae!4v1686838198316!5m2!1sen!2sae"
          ></iframe>
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
