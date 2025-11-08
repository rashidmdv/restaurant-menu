"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import HeroCarousel from "../components/HeroCarousel";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

// Form validation schema
const reservationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  phonePrefix: z.string().default("+971"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  guests: z.string().min(1, "Please select number of guests"),
  specialRequests: z.string().optional(),
});

export default function BookTablePage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      phonePrefix: "+971",
    },
  });

  // Generate time slots from 11:00 AM to 11:30 PM
  const timeSlots = [];
  for (let hour = 11; hour <= 23; hour++) {
    timeSlots.push(`${hour}:00`);
    if (hour < 23) {
      timeSlots.push(`${hour}:30`);
    }
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const fullPhone = `${data.phonePrefix}${data.phone}`;
      const response = await fetch("http://127.0.0.1:8000/v1/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: data.fullName,
          email: data.email,
          phone: fullPhone,
          reservation_date: data.date,
          reservation_time: data.time,
          number_of_guests: parseInt(data.guests),
          special_requests: data.specialRequests || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit reservation");
      }

      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error("Error submitting reservation:", error);
      setSubmitError("Failed to submit your reservation. Please try again or call us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-[#fcf6e2]">
      {/* Hero Section */}
      <HeroCarousel
        images={["/loma/book/book-hero.jpg"]}
        title="Reserve Your Experience"
        subtitle="Contact us or book your table"
        height="h-[50vh] lg:h-[60vh]"
      />

      {/* Location Section - Contact Info LEFT, Map RIGHT */}
      <div className="w-full py-12 lg:py-20 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-[#C67D30] font-bold text-[32px] lg:text-[40px] text-center mb-12 tracking-wide">
            Our Location
          </h3>
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* Contact Info - LEFT SIDE */}
            <div className="flex-1 w-full">
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-[#C67D30] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-[#5c4a2b] text-[18px] mb-2 tracking-wide">Address</h4>
                    <p className="text-[#5c4a2b]/80 text-[15px] lg:text-[16px] leading-relaxed">
                      Marina Walk, Building 23
                      <br />
                      Dubai, United Arab Emirates
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-[#C67D30] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-[#5c4a2b] text-[18px] mb-2 tracking-wide">Phone</h4>
                    <a
                      href="tel:+97141234567"
                      className="text-[#C67D30] hover:underline text-[15px] lg:text-[16px]"
                    >
                      +971-4-123-4567
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-[#C67D30] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-[#5c4a2b] text-[18px] mb-2 tracking-wide">Email</h4>
                    <a
                      href="mailto:info@olivegroverestaurant.ae"
                      className="text-[#C67D30] hover:underline text-[15px] lg:text-[16px]"
                    >
                      info@olivegroverestaurant.ae
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-[#C67D30] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-[#5c4a2b] text-[18px] mb-2 tracking-wide">Opening Hours</h4>
                    <div className="space-y-2 text-[15px] lg:text-[16px]">
                      <div>
                        <p className="font-medium text-[#5c4a2b]">Sunday - Wednesday</p>
                        <p className="text-[#5c4a2b]/80">11:00 - 23:00</p>
                      </div>
                      <div>
                        <p className="font-medium text-[#5c4a2b]">Thursday - Saturday</p>
                        <p className="text-[#5c4a2b]/80">11:00 - 23:30</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map - RIGHT SIDE */}
            <div className="flex-1 w-full">
              <div className="w-full h-[400px] lg:h-[500px] rounded-lg overflow-hidden shadow-xl">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3613.0847682088386!2d55.13943931501344!3d25.076663783955796!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6ca7b1d5f3c9%3A0x7e8e8c8c8c8c8c8c!2sMarina%20Walk%2C%20Dubai!5e0!3m2!1sen!2sae!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Loma Restaurant Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Form Section */}
      <div className="w-full py-12 lg:py-20 px-4 lg:px-8 bg-white/30">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-[#C67D30] font-bold text-[28px] md:text-[36px] lg:text-[44px] text-center mb-12 leading-tight tracking-wide">
            Reserve your place at Loma: complete the form and let your experience begin
          </h3>

          {isSubmitted ? (
            <div className="bg-[#C67D30]/10 border-2 border-[#C67D30]/30 rounded-lg p-8 text-center">
              <h4 className="text-[#5c4a2b] font-bold text-[24px] mb-4">
                Reservation Received!
              </h4>
              <p className="text-[#5c4a2b]/80 text-[16px] mb-6 leading-relaxed">
                You will receive a confirmation by email shortly.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="bg-[#C67D30] hover:bg-[#a66825] text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Make Another Reservation
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-lg border border-gray-100 p-8 lg:p-12">
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-[#5c4a2b] font-medium mb-2 text-[15px] tracking-wide">
                    Full Name <span className="text-[#C67D30]">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("fullName")}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C67D30] focus:ring-1 focus:ring-[#C67D30]/20 text-[15px] transition-all hover:border-gray-300"
                    placeholder="John Doe"
                  />
                  {errors.fullName && (
                    <p className="text-[#C67D30] text-[13px] mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[#5c4a2b] font-medium mb-2 text-[15px] tracking-wide">
                    Email Address <span className="text-[#C67D30]">*</span>
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C67D30] focus:ring-1 focus:ring-[#C67D30]/20 text-[15px] transition-all hover:border-gray-300"
                    placeholder="john.doe@example.com"
                  />
                  {errors.email && (
                    <p className="text-[#C67D30] text-[13px] mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-[#5c4a2b] font-medium mb-2 text-[15px] tracking-wide">
                    Phone Number <span className="text-[#C67D30]">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      {...register("phonePrefix")}
                      className="px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C67D30] focus:ring-1 focus:ring-[#C67D30]/20 text-[15px] bg-white transition-all hover:border-gray-300"
                    >
                      <option value="+971">+971 (UAE)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+91">+91 (IN)</option>
                      <option value="+61">+61 (AU)</option>
                    </select>
                    <input
                      type="tel"
                      {...register("phone")}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C67D30] focus:ring-1 focus:ring-[#C67D30]/20 text-[15px] transition-all hover:border-gray-300"
                      placeholder="501234567"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[#C67D30] text-[13px] mt-1">{errors.phone.message}</p>
                  )}
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[#5c4a2b] font-medium mb-2 text-[15px] tracking-wide">
                      Date <span className="text-[#C67D30]">*</span>
                    </label>
                    <input
                      type="date"
                      {...register("date")}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C67D30] focus:ring-1 focus:ring-[#C67D30]/20 text-[15px] transition-all hover:border-gray-300"
                    />
                    {errors.date && (
                      <p className="text-[#C67D30] text-[13px] mt-1">{errors.date.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[#5c4a2b] font-medium mb-2 text-[15px] tracking-wide">
                      Time <span className="text-[#C67D30]">*</span>
                    </label>
                    <select
                      {...register("time")}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C67D30] focus:ring-1 focus:ring-[#C67D30]/20 text-[15px] bg-white transition-all hover:border-gray-300"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    {errors.time && (
                      <p className="text-[#C67D30] text-[13px] mt-1">{errors.time.message}</p>
                    )}
                  </div>
                </div>

                {/* Number of Guests */}
                <div>
                  <label className="block text-[#5c4a2b] font-medium mb-2 text-[15px] tracking-wide">
                    Number of Guests <span className="text-[#C67D30]">*</span>
                  </label>
                  <select
                    {...register("guests")}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C67D30] focus:ring-1 focus:ring-[#C67D30]/20 text-[15px] bg-white transition-all hover:border-gray-300"
                  >
                    <option value="">Select number</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                  {errors.guests && (
                    <p className="text-[#C67D30] text-[13px] mt-1">{errors.guests.message}</p>
                  )}
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-[#5c4a2b] font-medium mb-2 text-[15px] tracking-wide">
                    Tell us how we can make your experience special
                  </label>
                  <textarea
                    {...register("specialRequests")}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C67D30] focus:ring-1 focus:ring-[#C67D30]/20 text-[15px] resize-none transition-all hover:border-gray-300"
                    placeholder="Dietary restrictions, special occasions, seating preferences..."
                  />
                </div>

                {/* Error Message */}
                {submitError && (
                  <div className="bg-[#C67D30]/5 border border-[#C67D30]/30 rounded-lg p-4">
                    <p className="text-[#5c4a2b] text-[14px]">{submitError}</p>
                  </div>
                )}

                {/* Submit Button - Centered */}
                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#C67D30] hover:bg-[#a66825] text-white font-semibold px-12 py-4 rounded-lg text-[16px] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[240px] shadow-md hover:shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      "RESERVE NOW"
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
