import React, { Suspense, lazy, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import RootLayout from "../util/RootLayout";
import Bunnerbar from "../components/Bunnerbar";

// Using lazy loading for the ProductSection to improve initial page load performance
const ProductSection = lazy(() => import("../components/ProductSection"));

const HomeRoute = () => {
  useEffect(()=>{
   document.title = "Ms Store | Rare Banknotes & Ancient Coin Collections"
  },[])
  return (
    <RootLayout>
      <Helmet>
        <title>Ms Store | Premium Collection & Deals</title>
        <meta
          name="description"
          content="Discover exclusive deals at Ms Store. Shop our curated collection of electronics, fashion, and lifestyle products with secure checkout and fast shipping."
        />
        <meta name="keywords" content="Ms Store, online shopping, electronics deals, fashion trends, e-commerce India" />
        
        {/* Open Graph / Social Media Tags */}
        <meta property="og:title" content="Ms Store | Premium Collection & Deals" />
        <meta property="og:description" content="Shop the latest trends and top-quality products at unbeatable prices only at Ms Store." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://msstore.in/" />
        <meta property="og:site_name" content="Ms Store" />
        <link rel="canonical" href="https://msstore.in/" />
      </Helmet>

      {/* Main Container with responsive padding */}
      <main className="min-h-screen bg-gray-50 pb-12 mt-10">
        {/* Banner Section */}
        <section className="w-full">
          <Bunnerbar />
        </section>

<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">

  {[
    {
      title: "World Banknotes",
      image: "/categories/world-banknotes.jpg",
    },
    {
      title: "World Coins",
      image: "/categories/world-coins.jpg",
    },
    {
      title: "Indian Banknotes",
      image: "/categories/indian-banknotes.jpg",
    },
    {
      title: "Indian Coins",
      image: "/categories/indian-coins.jpg",
    },
    {
      title: "Miniature Sheets",
      image: "/categories/miniature-sheets.jpg",
    },
    
      {
  title: "Accessories",
  image: "/categories/accessories.jpg",
},
  ].map((item, index) => (
    <Link
  key={index}
  to={`/catalogs?category=${encodeURIComponent(item.title)}`}
  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 block"
>
  <div className="h-40 overflow-hidden">
    <img
      src={item.image}
      alt={item.title}
      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
    />
  </div>

  <div className="p-3 text-center">
    <h3 className="font-semibold text-sm text-gray-800">
      {item.title}
    </h3>
  </div>
</Link>
  ))}
</div>
        {/* Product Grid Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Featured Products</h2>
            <p className="text-sm text-gray-500">Handpicked items just for you</p>
          </div>

          <Suspense fallback={
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-xl" />
              ))}
            </div>
          }>
            <ProductSection />
          </Suspense>
        </section>
      </main>
    </RootLayout>
  );
};

export default HomeRoute;