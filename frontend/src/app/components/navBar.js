"use client";

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react'; // install lucide-react or use Heroicons
import Image from 'next/image';
import { navItems } from '../constants/constants';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  return (
    <header className="py-4 z-[999]">
      <nav className="fixed top-0 w-full z-50 md:bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 py-4 md:flex md:justify-between items-center background">

          <div className="flex items-center justify-between space-x-5 md:gap-10">
            <Image src="/menu-icon.png" alt="Logo 1" width={18} height={15} />
            <Link href="/">
              <Image src="/logo1.png" alt="Logo" width={80} height={80} style={{ height: 'auto' }} />
            </Link>
            {/* Mobile Menu Icon */}
            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="space-x-6 hidden md:flex ">
            {navItems.map((item, index) =>(
                <Link
                  key={index}
                  href={item.href}
                  className="transition delay-150 duration-200 hover:text-black text-[15px] lg:text-[17px]"
                >
                  {item.name}
                </Link>
            )
            )}
          </div>

        </div>

        {/* Mobile Menu Links */}
        {isOpen &&
          <div className="md:hidden backdrop-blur-sm bg-black/10 bg-opacity-100" style={{height:'100vh'}}>
            <div className='px-4 pb-4 z-20 background shadow-sm text-center' >
                {navItems.map((item, index) =>(
                    <Link
                      key={index}
                      href={item.href}
                      className="block py-2 hover:text-black text-[15px]"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                )
                )}
            </div>
          </div>
        }
      </nav>
    </header>
  );
}

