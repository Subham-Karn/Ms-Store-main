import React, { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import RootLayout from "../util/RootLayout";
import { fetchCatalogs } from "../store/slices/appSlice";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const SearchResults = () => {
  const { catalogs} = useSelector(state => state.app);
  const [loading, setLoading] = useState(true);

  const { search } = useLocation();
  const query = new URLSearchParams(search).get("q")?.trim() || "";
  const tag = new URLSearchParams(search).get("tag")?.trim() || "";

  useEffect(() => {
    document.title = `Ms Store | ${query || tag || "Search"}`;
    
    const fetch = async () => {
      if (catalogs && catalogs.length > 0) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        await dispatch(fetchCatalogs()).unwrap();
      } catch (err) {
        toast.error("Failed to fetch catalogs:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetch();
  }, [setCatalogs, query, tag, catalogs.length]);

  const searchResults = useMemo(() => {
    if (!query && !tag) return [];
    
    return catalogs.filter((item) => {
      // Tag match is exact (case-insensitive)
      const tagMatch = tag 
        ? item?.tags?.some((t) => t.toLowerCase() === tag.toLowerCase()) 
        : true;
        
      // Query match checks title, description, and category for better results
      const queryMatch = query 
        ? (item?.title?.toLowerCase().includes(query.toLowerCase()) || 
           item?.description?.toLowerCase().includes(query.toLowerCase()) ||
           item?.category?.toLowerCase().includes(query.toLowerCase()))
        : true;
        
      return queryMatch && tagMatch;
    });
  }, [catalogs, query, tag]);

  // Determine if the user actually searched for something
  const hasSearchTerm = query || tag;

  return (
    <RootLayout>
      {/* Fixed invalid mt-34 to mt-32 */}
      <div className="w-full mt-32 px-4 flex justify-center min-h-[60vh]">
        <div className="w-full max-w-7xl">
          
          {/* Header */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
              {query ? <>Search Results for: <span className="text-[#1a5a8a]">“{query}”</span></> : 
               tag ? <>Browsing Tag: <span className="text-[#1a5a8a]">“{tag}”</span></> : 
               "Search"}
            </h2>
            <Link to="/" className="px-6 py-2 border border-[#1a5a8a] text-[#1a5a8a] rounded-full hover:bg-[#1a5a8a] hover:text-white transition-all duration-300 text-center font-medium">
              Back to Home
            </Link>
          </div>

          {/* Body */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-[#1a5a8a]/10 animate-pulse rounded-2xl h-64 sm:h-72 md:h-80" />
              ))}
            </div>
          ) : !hasSearchTerm ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-32 h-32 bg-[#1a5a8a]/5 rounded-full flex items-center justify-center mb-2">
                <span className="text-5xl text-[#1a5a8a]/40">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Ready to explore?</h3>
              <p className="text-gray-500 text-center max-w-sm">
                Enter a search term above to find specific items, or check out our full catalog.
              </p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
              {searchResults.map((product, i) => (
                <div key={product.id || i} className="transition-transform duration-300">
                  <ProductCard product={product} allCatalogs={catalogs} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-32 h-32 bg-[#1a5a8a]/5 rounded-full flex items-center justify-center mb-2">
                <span className="text-5xl text-[#1a5a8a]/40">📦</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">No results found</h3>
              <p className="text-gray-500 text-center max-w-sm">
                We couldn’t find anything matching <strong className="text-gray-800">"{query || tag}"</strong>. 
                Try checking for typos or use broader terms.
              </p>
              <Link to="/catalogs" className="mt-4 px-6 py-2.5 bg-[#1a5a8a] text-white rounded-xl font-medium hover:bg-[#15486e] transition-colors shadow-lg shadow-[#1a5a8a]/20">
                Browse Full Catalog
              </Link>
            </div>
          )}
          
        </div>
      </div>
    </RootLayout>
  );
};

export default SearchResults;