"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#5c4a2b] text-white py-12 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo & About */}
          <div>
            <img
              src="/logo1.png"
              alt="Loma Restaurant"
              className="h-16 mb-4"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <p className="text-[#fef5e5] text-[14px] leading-relaxed">
              A revolutionary culinary journey in the heart of Dubai. Where Mediterranean mastery meets Arab heritage.
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-bold text-[18px] mb-4 text-[#C67D30]">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <p className="text-[14px]">
                  Jordanian Social Club - Oud Metha - Dubai
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <a href="tel:+97142364555" className="text-[14px] hover:text-[#C67D30] transition-colors">
                  +971 04 236 4555
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <a href="mailto:info@olivegroverestaurant.ae" className="text-[14px] hover:text-[#C67D30] transition-colors">
                  info@olivegroverestaurant.ae
                </a>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="font-bold text-[18px] mb-4 text-[#C67D30]">Opening Hours</h4>
            <div className="space-y-2 text-[14px]">
              <div>
                <p className="font-semibold">Sunday - Wednesday</p>
                <p className="text-[#fef5e5]">11:00 - 23:00</p>
              </div>
              <div>
                <p className="font-semibold">Thursday - Saturday</p>
                <p className="text-[#fef5e5]">11:00 - 23:30</p>
              </div>
            </div>
          </div>

          {/* Social Media & Legal */}
          <div>
            <h4 className="font-bold text-[18px] mb-4 text-[#C67D30]">Follow Us</h4>
            <div className="flex gap-4 mb-6">
              <a
                href="#"
                className="bg-white/10 hover:bg-[#C67D30] p-2 rounded-full transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-white/10 hover:bg-[#C67D30] p-2 rounded-full transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-white/10 hover:bg-[#C67D30] p-2 rounded-full transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
            <div className="space-y-2 text-[14px]">
              <Link href="/privacy" className="block hover:text-[#C67D30] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block hover:text-[#C67D30] transition-colors">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 text-center">
          <p className="text-[14px] text-[#fef5e5]">
            &copy; {new Date().getFullYear()} Loma Restaurant. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
