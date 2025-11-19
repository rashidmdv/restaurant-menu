import { Geist, Geist_Mono, Montserrat } from "next/font/google";

import "./globals.css";
import Navbar from "./components/navBar";
import LoadingScreen from "./components/LoadingScreen";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // adjust weights as needed
});


export const metadata = {
  title: "Olive Grove Mediterranean Restaurant - Oud Metha, Dubai",
  description: "Experience authentic Mediterranean cuisine in Oud Metha, Dubai. Traditional recipes, fresh ingredients, and warm hospitality await you at Olive Grove.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} antialiased font-sans`}
        suppressHydrationWarning={true}
      >
        <LoadingScreen />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
