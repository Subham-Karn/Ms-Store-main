import React, { useEffect, useState, useMemo } from "react";
import ProductCard from "../components/ProductCard";
import RootLayout from "../util/RootLayout";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { fetchCatalogs } from "../store/slices/appSlice";
import { Search, FilterX, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const CatalogPage = () => {
  const { catalogs: allCatalogs } = useSelector((state) => state.app);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  // ─── Filter States ───
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("default");
  const [offerFilter, setOfferFilter] = useState(0);
  const [ratingFilter, setRatingFilter] = useState(0);
  
  const [searchParams] = useSearchParams();

  useEffect(() => {
    document.title = "Ms Store | Catalogs";
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
  const category = searchParams.get("category");

  if (category) {
    setCategoryFilter(category);
  }
}, [searchParams]);
  // Fetch catalogs
  useEffect(() => {
    const fetchProducts = async () => {
      // Prevent redundant fetch if data is already loaded
      if (allCatalogs && allCatalogs.length > 0) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        await dispatch(fetchCatalogs()).unwrap();
      } catch (err) {
        console.error("Error fetching catalogs: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [dispatch, allCatalogs]);

  // Extract unique categories from all in-stock catalogs
  const categories = useMemo(() => {
    if (!allCatalogs) return ["All"];
    const inStock = allCatalogs.filter(c => c.stock > 0);
    const uniqueCats = new Set(inStock.map((item) => item.category).filter(Boolean));
    return ["All", ...uniqueCats];
  }, [allCatalogs]);

  // ─── FIXED LOGIC: Filter FIRST, then Sort ───
  const processedCatalogs = useMemo(() => {
    if (!allCatalogs) return [];

    // 1. FILTERING
    let result = allCatalogs.filter((product) => product.stock > 0); // Base requirement

    if (searchTerm) {
      const lowerQuery = searchTerm.toLowerCase();
      result = result.filter((product) =>
        product.title?.toLowerCase().includes(lowerQuery)
      );
    }

    if (categoryFilter !== "All") {
      result = result.filter((product) => product.category === categoryFilter);
    }

    // Filter by Price (Ensuring it handles valid numbers)
    result = result.filter((product) => {
      const price = Number(product.orignalprice) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (offerFilter > 0) {
      result = result.filter((product) => Number(product.offer) >= offerFilter);
    }

    if (ratingFilter > 0) {
      result = result.filter((product) => Number(product.rate) >= ratingFilter);
    }

    // 2. SORTING (Applied to the filtered results)
    if (sortBy === "asc") {
      result.sort((a, b) => (Number(a.orignalprice) || 0) - (Number(b.orignalprice) || 0));
    } else if (sortBy === "desc") {
      result.sort((a, b) => (Number(b.orignalprice) || 0) - (Number(a.orignalprice) || 0));
    } else if (sortBy === "ATOZ") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortBy === "ZTOA") {
      result.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    }

    return result;
  }, [allCatalogs, searchTerm, categoryFilter, priceRange, offerFilter, ratingFilter, sortBy]);

  // Reset all filters utility
  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All");
    setPriceRange([0, 10000]);
    setSortBy("default");
    setOfferFilter(0);
    setRatingFilter(0);
  };

  return (
    <RootLayout>
      <div className="w-full mt-30 sm:mt-40 px-4 mb-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          
          {/* ─── Sidebar Filters ─── */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal size={18} /> Filters
              </h2>
              <button 
                onClick={resetFilters}
                className="text-xs font-semibold text-[#1a5a8a] hover:text-[#15486e] bg-[#1a5a8a]/5 px-3 py-1.5 rounded-md transition-colors"
              >
                Reset All
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a5a8a]/20 focus:border-[#1a5a8a] transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Category</h3>
              <select
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a5a8a]/20 focus:border-[#1a5a8a] cursor-pointer"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Max Price</h3>
                <span className="text-xs font-bold text-[#1a5a8a]">₹{priceRange[1].toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={0}
                max={10000}
                step={100}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                className="w-full accent-[#1a5a8a] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Offer */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Min Offer</h3>
                <span className="text-xs font-bold text-green-600">{offerFilter}%+</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={offerFilter}
                onChange={(e) => setOfferFilter(Number(e.target.value))}
                className="w-full accent-green-500 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Rating */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Min Rating</h3>
                <span className="text-xs font-bold text-amber-500">{ratingFilter} Stars</span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={ratingFilter}
                onChange={(e) => setRatingFilter(Number(e.target.value))}
                className="w-full accent-amber-400 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* ─── Products Grid ─── */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <h2 className="text-xl font-extrabold text-gray-900">
                Catalog <span className="text-sm font-medium text-gray-500 ml-2">({processedCatalogs.length} items)</span>
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5a8a]/20 focus:border-[#1a5a8a] cursor-pointer"
                >
                  <option value="default">Featured</option>
                  <option value="ATOZ">Alphabetical: A-Z</option>
                  <option value="ZTOA">Alphabetical: Z-A</option>
                  <option value="asc">Price: Low to High</option>
                  <option value="desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-64 sm:h-80" />
                ))}
              </div>
            ) : processedCatalogs.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {processedCatalogs.map((product, i) => (
                  <ProductCard key={product.pid || i} product={product} allCatalogs={allCatalogs} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-4 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mb-2">
                  <FilterX className="text-gray-300 w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">No products match your filters</h3>
                <p className="text-sm text-gray-500 text-center max-w-sm">
                  Try widening your price range, clearing the search box, or selecting a different category.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </RootLayout>
  );
};

export default CatalogPage;