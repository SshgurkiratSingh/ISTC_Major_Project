import React, { useState, useEffect } from "react";
import { Image } from "@nextui-org/react";

const images = [
  "/garlicBread.webp",
  "/PaneerWrap.png",
  "/smoke.webp",
  "/frenchFries.webp",
  "/CrispyPaneerBurger.png",
];

function ScreenSaver() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="z-1 flex w-full h-full min-h-screen bg-gradient-to-br from-black via-blue-900 to-purple-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('/circuit-pattern.png')] opacity-10 animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black opacity-50"></div>
      <div className="relative w-1/2 p-8 flex flex-col justify-center items-center">
        <h2 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse">
          Welcome to ISTC Major Project
        </h2>
        <p className="text-xl mb-8 text-center text-blue-200 shadow-glow">
          Experience the future of dining with our cutting-edge culinary
          innovations
        </p>
        <div className="w-full max-w-md overflow-hidden rounded-2xl shadow-neon border-2 border-cyan-400 transition-all duration-300 hover:shadow-neon-intense">
          <Image
            src={`food/${images[currentImage]}`}
            alt="Food"
            width="100%"
            className="w-full h-full object-cover transition-all duration-1000 hover:scale-110"
          />
        </div>
      </div>
      <div className="relative w-1/2 p-8 flex flex-col justify-center items-center">
        <h2 className="text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Scan to order from Table 1
        </h2>
        <div className="w-64 h-64 bg-white p-4 rounded-2xl shadow-neon transition-all duration-300 hover:shadow-neon-intense">
          <Image
            src="/qr.png"
            alt="QR Code"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-2xl font-semibold text-cyan-400 animate-float">
        Click anywhere on screen to start ordering
      </div>
    </div>
  );
}

export default ScreenSaver;
