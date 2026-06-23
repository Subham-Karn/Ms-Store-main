import React, { useEffect, useState, useMemo } from "react";
import ProductCard from "../components/ProductCard";
import RootLayout from "../util/RootLayout";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { fetchCatalogs } from "../store/slices/appSlice";

const CatalogPage = () => {
  const { category, subcategory } = useParams();
  const { catalogs:allCatalogs} = useSelector(state => state.app);
  const dispatch = useDispatch();
const catalogs = useMemo(
      () => allCatalogs ? allCatalogs.filter((c) => c.stock > 0) : [],
      [allCatalogs]
    );
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [offerFilter, setOfferFilter] = useState(0);
  const [ratingFilter, setRatingFilter] = useState(0);

  // Page title
  useEffect(() => {
    if (category && subcategory) {
      document.title = `Ms Store | ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}`;
    } else {
      document.title = `Ms Store | ${category ? category.charAt(0).toUpperCase() + category.slice(1) : "All Categories"}`;
    }
  }, [category, subcategory]);

  // Fetch catalogs
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        await dispatch(fetchCatalogs()).unwrap();
      } catch (err) {
        console.error(err.message)
        toast.error("Error fetching catalogs:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [dispatch]);
  // Filter states
  useEffect(() => {
    setCategoryFilter("All");
    setPriceRange([0, 10000]);
    setOfferFilter(0);
    setRatingFilter(0);
  }, [category, subcategory]);

  // Document title
  useEffect(() => {
    document.title = `Ms Store | ${category ? category.charAt(0).toUpperCase() + category.slice(1) : "All Categories"}`;
    window.scrollTo(0, 0);
  }, [category]);

  // Unique categories (for filter dropdown)
  const categories = useMemo(() => {
    const unique = new Set(catalogs.map((c) => c.category));
    return ["All", ...unique];
  }, [catalogs]);

  // Apply filters
  const filteredProducts = useMemo(() => {
    return catalogs
      .filter((product) => product.stock > 0)
      
      .filter((product) =>
        categoryFilter === "All" ? true : product.category === categoryFilter
      )
      .filter((product) =>
        category ? product.category.toLowerCase() === category.toLowerCase() : true
      )
      .filter((product) =>
        subcategory ? product.subcategory.toLowerCase() === subcategory.toLowerCase() : true
      )
      .filter(
        (product) =>
          product.orignalprice >= priceRange[0] &&
          product.orignalprice <= priceRange[1]
      )
      .filter((product) => product.offer >= offerFilter)
      .filter((product) => product.rate >= ratingFilter);
  }, [catalogs, categoryFilter, category, subcategory, priceRange, offerFilter, ratingFilter]);

  return (
    <RootLayout>
      <div className="w-full mt-35 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Filters</h2>

            {/* Category */}
            <div className="mb-4">
              <h3 className="font-medium mb-2">Category</h3>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5a8a]"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <h3 className="font-medium mb-2">Price (₹)</h3>
              <input
                type="range"
                min={0}
                max={10000}
                step={100}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                className="w-full accent-[#1a5a8a]"
              />
              <p className="text-sm text-gray-500 mt-1">Up to ₹{priceRange[1]}</p>
            </div>

            {/* Offer */}
            <div className="mb-4">
              <h3 className="font-medium mb-2">Offer (%)</h3>
              <input
                type="number"
                min={0}
                max={100}
                value={offerFilter}
                onChange={(e) => setOfferFilter(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5a8a]"
              />
            </div>

            {/* Rating */}
            <div>
              <h3 className="font-medium mb-2">Minimum Rating</h3>
              <input
                type="number"
                min={0}
                max={5}
                step={0.5}
                value={ratingFilter}
                onChange={(e) => setRatingFilter(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5a8a]"
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {subcategory
                ? `${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)} in ${category}`
                : category
                ? category.charAt(0).toUpperCase() + category.slice(1)
                : "All Catalogs"}
            </h2>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-[#1a5a8a]/10 animate-pulse rounded-lg h-64 sm:h-72 md:h-80"
                  />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product, i) => (
                  <div key={i} className="transition-transform duration-300">
                    <ProductCard product={product} allCatalogs={catalogs} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-40 h-40 bg-[#1a5a8a]/10 rounded-full flex items-center justify-center">
                  <span className="text-6xl text-[#1a5a8a]/50">😔</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">
                  No products found
                </h3>
                <p className="text-gray-500 text-center max-w-sm">
                  Try adjusting your filters or browse our full catalog.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </RootLayout>
  );
};

export default CatalogPage;
