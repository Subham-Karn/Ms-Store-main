import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { useDispatch, useSelector } from "react-redux";
import { fetchCatalogs } from "../store/slices/appSlice";

const ProductSection = () => {
  const dispatch = useDispatch();
  // Using Redux as the single source of truth
  const { catalogs, loading } = useSelector((state) => state.app);

  // Fetch data on mount
  useEffect(() => {
    if (!catalogs || catalogs.length === 0) {
      dispatch(fetchCatalogs());
    }
  }, [dispatch, catalogs]);

  const allCatalogs = useMemo(() => {
    console.log(catalogs);
    if (!catalogs || !Array.isArray(catalogs)) return [];
    return [...catalogs]
      .filter((c) => c.stock > 0)
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [catalogs]);

  const newArrivals = useMemo(() => allCatalogs.slice(0, 16), [allCatalogs]);
  const bestSellers = useMemo(() => [...allCatalogs].sort((a, b) => (b.rate || 0) - (a.rate || 0)).slice(0, 16), [allCatalogs]);
  const topDiscount = useMemo(() =>
  allCatalogs.filter((c) => Number(c.offer) > 0).slice(0, 16),
  [allCatalogs]
);

  const renderProductGrid = (products, limit = 16) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
      {loading 
        ? Array(limit).fill(0).map((_, i) => <ProductCard key={i} loading={true} />)
        : products.map((product) => (
            <ProductCard key={product.pid} product={product} />
          ))
      }
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center">
      {/* New Arrivals */}
      <section className="group max-w-8xl w-full mx-auto flex flex-col items-center gap-2 px-4 mt-5">
        <h2 className="text-2xl uppercase tracking-widest mb-4 text-gray-700 w-full">New Arrivals</h2>
        {renderProductGrid(newArrivals, 16)}
        <Link to="/catalogs" className="mt-4 px-6 py-2 border border-[#1a5a8a] text-[#1a5a8a] hover:bg-[#1a5a8a] hover:text-white transition">
          See More
        </Link>
      </section>

      {/* Best Sellers */}
      <section className="w-full max-w-8xl mx-auto mt-12 px-4">
        <h2 className="text-2xl uppercase border-b-2 border-[#1a5a8a] text-gray-700 mb-4">Best Sellers</h2>
        {renderProductGrid(bestSellers, 16)}
      </section>

      {/* Top Discounts */}
      {topDiscount.length > 0 && (
        <section className="w-full max-w-8xl mx-auto mt-12 px-4">
          <h2 className="text-2xl uppercase border-b-2 border-[#1a5a8a] text-gray-700 mb-4">Top Discounts</h2>
          {renderProductGrid(topDiscount, 16)}
        </section>
      )}
    </div>
  );
};

export default ProductSection;