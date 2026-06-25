import React from "react";
import { Link } from "react-router-dom";

const Bunnerbar = () => {
  return (
    <div
      className="relative mt-6 w-full h-[500px] sm:h-[650px] md:h-7550px] lg:h-[600px] rounded-xl overflow-hidden shadow-xl"
      style={{
        backgroundImage: `url("/banner.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent flex flex-col justify-center px-8 sm:px-16">

        <div className="flex items-center gap-2 mb-4">
          <span className="h-[2px] w-8 bg-[#1a5a8a]"></span>
          <span className="text-xs uppercase tracking-[0.2em] text-gray-300">
            World Banknotes & Coins
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
          MS Currency Store
        </h1>

        <p className="max-w-xl text-gray-200 mt-4 text-base">
          Discover authentic world banknotes, rare coins, miniature sheets
          and collectible currency from around the globe.
        </p>

        <div className="mt-8">
          <Link
            to="/catalogs"
            className="bg-[#1a5a8a] hover:bg-[#15466b] text-white px-6 py-3 rounded-lg"
          >
            Explore Collection
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Bunnerbar;