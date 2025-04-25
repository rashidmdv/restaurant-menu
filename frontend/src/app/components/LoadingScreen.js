"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000); 
    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#fdf6e3]">
      <div className="text-center">
        <img src="/logo1.png" alt="Logo" width={100} height={100} />
      </div>
    </div>
  );
}
