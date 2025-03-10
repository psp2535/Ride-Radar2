"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);

  return (
    <>
      {/* Navbar */}
      <nav className={`${darkMode ? "bg-black" : "bg-white"} fixed w-full z-20 top-0 start-0 border-b border-gray-200 transition-all duration-300 hover:shadow-lg`}>
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse">
            <img src="/rideradar.jpg" className="h-14 w-15 rounded-full" alt="RideRadar Logo" />
            <span className={`self-center text-2xl font-semibold whitespace-nowrap ${darkMode ? "text-white" : "text-black"}`}>RideRadar</span>
          </a>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-center"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className={`relative flex flex-col items-center justify-center min-h-screen w-full p-10 bg-cover bg-center bg-no-repeat transition-all duration-300 ${darkMode ? "bg-black" : "bg-white"}`}>
        <div className="text-center mb-10 mt-20">
          <h1 className={`text-5xl font-extrabold ${darkMode ? "text-white" : "text-black"}`}>Ride Smarter, Pay Less: Compare Ola, Uber & Rapido</h1>
          <p className={`text-lg mt-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Easily compare ride fares from Ola, Uber, and Rapido in one place. Get the best price for your trip and choose the most affordable ride with real-time fare updates. Travel smarter, save more!</p>
        </div>

        {/* Image Section */}
        <div className="flex justify-center items-center space-x-20 mb-10 w-full max-w-4xl">
          <Image src="/ola-logo.png" alt="Ola Logo" width={150} height={100} className="p-4 m-4" />
          <Image src="/rapido-logo.png" alt="Rapido Logo" width={150} height={100} className={`p-4 shadow-lg rounded-lg ${darkMode ? "bg-black" : "bg-white"}`} />
          <Image src="/uber-logo.png" alt="Uber Logo" width={150} height={100} className="p-4" />
        </div>

        {/* Get Started Button */}
        <button
          onClick={() => router.push("/login")}
          className="px-10 py-4 text-2xl font-extrabold rounded-3xl shadow-2xl bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700 transform transition-all duration-300 hover:scale-105"
        >
          Get Started
        </button>
      </main>
    </>
  );
}
