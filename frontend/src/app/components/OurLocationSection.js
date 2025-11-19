'use client';

import LoadingSpinner from './LoadingSpinner';

export default function OurLocationSection({ restaurantData, hoursData, loading, error }) {
  const defaultAddress = "Jordanian Social Club\nOud Metha\nDubai";
  const defaultPhone = "+971 04 236 4555";
  const defaultEmail = "hello@lebeirut.me";
  const defaultHours = [
    { day_of_week: 1, open_time: "08:00", close_time: "23:00", is_closed: false },
    { day_of_week: 2, open_time: "08:00", close_time: "23:00", is_closed: false },
    { day_of_week: 3, open_time: "08:00", close_time: "23:00", is_closed: false },
    { day_of_week: 4, open_time: "08:00", close_time: "23:00", is_closed: false },
    { day_of_week: 5, open_time: "08:00", close_time: "00:00", is_closed: false },
    { day_of_week: 6, open_time: "08:00", close_time: "00:00", is_closed: false },
    { day_of_week: 0, open_time: "08:00", close_time: "23:00", is_closed: false }
  ];

  const formatAddress = (restaurant) => {
    if (!restaurant?.address) return defaultAddress;
    const { street, city, country } = restaurant.address;
    return `${street || ''}\n${city || ''}\n${country || ''}`.trim();
  };

  const formatHours = (hours) => {
    if (!hours || !Array.isArray(hours) || hours.length === 0) return defaultHours;
    return hours;
  };

  const getDayName = (dayOfWeek) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayOfWeek] || '';
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.slice(0, 5);
  };

  const renderHours = (hours) => {
    if (!Array.isArray(hours)) return 'monday-thursday: 8:00 – 23:00\nfriday-saturday: 8:00 – 00:00\nsunday: 8:00 – 23:00';
    
    const sortedHours = [...hours].sort((a, b) => a.day_of_week - b.day_of_week);
    
    let result = [];
    let currentGroup = [];
    let currentHours = null;
    
    for (const hour of sortedHours) {
      const timeStr = hour.is_closed ? 'closed' : `${formatTime(hour.open_time)} – ${formatTime(hour.close_time)}`;
      
      if (currentHours === timeStr) {
        currentGroup.push(getDayName(hour.day_of_week));
      } else {
        if (currentGroup.length > 0) {
          const dayRange = currentGroup.length > 1 && isConsecutive(currentGroup) 
            ? `${currentGroup[0]}-${currentGroup[currentGroup.length - 1]}`
            : currentGroup.join(', ');
          result.push(`${dayRange}: ${currentHours}`);
        }
        currentGroup = [getDayName(hour.day_of_week)];
        currentHours = timeStr;
      }
    }
    
    if (currentGroup.length > 0) {
      const dayRange = currentGroup.length > 1 && isConsecutive(currentGroup)
        ? `${currentGroup[0]}-${currentGroup[currentGroup.length - 1]}`
        : currentGroup.join(', ');
      result.push(`${dayRange}: ${currentHours}`);
    }
    
    return result.join('\n');
  };

  const isConsecutive = (days) => {
    const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 1; i < days.length; i++) {
      const prevIndex = dayOrder.indexOf(days[i - 1]);
      const currIndex = dayOrder.indexOf(days[i]);
      if (currIndex !== (prevIndex + 1) % 7) {
        return false;
      }
    }
    return true;
  };

  const address = formatAddress(restaurantData);
  const phone = restaurantData?.contact_info?.phone || defaultPhone;
  const email = restaurantData?.contact_info?.email || defaultEmail;
  const hours = formatHours(hoursData);

  return (
    <section className="pt-12 md:py-16 flex flex-col md:flex-row h-full max-w-7xl mx-auto" id="location">
      {/* Map */}
      <div className="w-full md:w-1/2 h-[300px] md:h-auto">
        <iframe
          className="w-full h-full"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7075.339653176596!2d55.31458380243888!3d25.232569196378325!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f5d4769108943%3A0xc2cd98c5d4c32992!2sLoma%20Restaurant%20and%20Bakery!5e1!3m2!1sen!2sin!4v1763516536736!5m2!1sen!2sin"
        ></iframe>
      </div>

      {/* Location Details */}
      <div className="w-full md:w-1/2 bg-[#fef5e5] text-center flex items-center justify-center py-10">
        <div className="max-w-md text-[#bc7a2e] space-y-4 text-base md:text-lg">
          <h2 className="text-[20px] lg:text-[30px] xl:text-[40px] font-bold mb-4">our location</h2>

          {loading.restaurant || loading.hours ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner size="medium" />
            </div>
          ) : (
            <>
              <div className="text-[15px] lg:text-[17px] xl:text-[20px] leading-relaxed px-4 md:px-0 xl:mt-3">
                {address.split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    {index < address.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>

              <p className="text-[15px] lg:text-[17px] xl:text-[20px] leading-relaxed px-4 md:px-0 xl:mt-3">
                phone: {phone}<br />
                email: {email}
              </p>

              <div className="text-[15px] lg:text-[17px] xl:text-[20px] leading-relaxed px-4 md:px-0 xl:mt-3">
                {renderHours(hours).split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    {index < renderHours(hours).split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>

              {(error.restaurant || error.hours) && (
                <p className="text-red-500 text-sm text-center mt-2">
                  Using fallback information
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}