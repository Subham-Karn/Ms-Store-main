import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Loader2, Pencil, X, PackageSearch } from "lucide-react";

import { updateStock } from "../../services/catalogService";
import { fetchCatalogs } from "../../store/slices/appSlice";
import { formatDate } from "../../util/formateDate";

const Stocks = () => {
  const dispatch = useDispatch();

  // --- Redux State ---
  const { catalogs, loading } = useSelector((state) => state.app);

  const allCatalogs = useMemo(() => {
    return Array.isArray(catalogs) ? catalogs : [];
  }, [catalogs]);

  // --- Local UI State ---
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [filteredStocks, setFilteredStocks] = useState([]);
  
  // --- Modal State ---
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockUpdateLoading, setStockUpdateLoading] = useState(false);

  // Load catalogs on mount via Redux
  useEffect(() => {
    dispatch(fetchCatalogs());
  }, [dispatch]);

  // Dynamic filtering
  useEffect(() => {
    let result = [...allCatalogs];

    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(lowerSearch) ||
          item.pid?.toLowerCase().includes(lowerSearch)
      );
    }

    if (filter === "inStock") {
      result = result.filter((item) => item.stock > 0);
    } else if (filter === "outOfStock") {
      result = result.filter((item) => item.stock === 0);
    }

    setFilteredStocks(result);
  }, [search, filter, allCatalogs]);

  // Modal Handlers
  const handleEditStock = (item) => {
    setSelectedStock(item);
    setIsStockModalOpen(true);
  };

  const handleUpdateStock = async (e, id, stockValue) => {
    e.preventDefault();
    try {
      setStockUpdateLoading(true);
      const res = await updateStock(id, Number(stockValue));

      if (res?.success) {
        toast.success("Stock updated successfully");
        dispatch(fetchCatalogs()); // Refresh global Redux state
        setIsStockModalOpen(false);
      } else {
        toast.error(res?.message || "Failed to update stock.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error updating stock.");
    } finally {
      setStockUpdateLoading(false);
    }
  };

  return (
    <div className="min-h-screen  flex flex-col gap-6 w-full">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <PackageSearch className="text-[#1a5a8a] h-7 w-7" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Stocks Management
        </h2>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="flex flex-col w-full sm:w-1/2">
            <label htmlFor="search" className="text-sm font-medium text-gray-700 mb-1">
              Find Product by Name or ID
            </label>
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="search"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5a8a] focus:border-[#1a5a8a] text-sm sm:text-base outline-none transition"
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col w-full sm:w-1/2">
            <label htmlFor="stock" className="text-sm font-medium text-gray-700 mb-1">
              Filter Stock Status
            </label>
            <div className="relative">
              <select
                id="stock"
                className="w-full p-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-[#1a5a8a] focus:border-[#1a5a8a] outline-none pr-10 text-sm sm:text-base cursor-pointer"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="All">All Products</option>
                <option value="inStock">In Stock Only</option>
                <option value="outOfStock">Out of Stock</option>
              </select>
              <svg className="w-5 h-5 absolute right-3 top-2.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-700">{filteredStocks.length}</span> products
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-10 w-10 text-[#1a5a8a] animate-spin" />
          <p className="text-gray-500 font-medium">Syncing Inventory...</p>
        </div>
      ) : filteredStocks.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto bg-white shadow-sm rounded-xl border border-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-[#1a5a8a] text-white">
                <tr>
                  <th className="py-4 px-4 text-left font-semibold rounded-tl-xl">Image</th>
                  <th className="py-4 px-4 text-left font-semibold">Product & ID</th>
                  <th className="py-4 px-4 text-left font-semibold">Category</th>
                  <th className="py-4 px-4 text-center font-semibold">Price</th>
                  <th className="py-4 px-4 text-center font-semibold">Stock</th>
                  <th className="py-4 px-4 text-center font-semibold">Date Added</th>
                  <th className="py-4 px-4 text-center font-semibold rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStocks.map((catalog, index) => (
                  <tr key={catalog.pid || index} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-4">
                      <img
                        className="h-14 w-14 object-cover rounded-md border border-gray-200 shadow-sm"
                        src={catalog.bunner || "/placeholder.png"}
                        alt={catalog.title || "Product Image"}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <h3 className="font-medium text-gray-800 truncate max-w-[200px]" title={catalog.title}>
                        {catalog.title || "Untitled"}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 font-mono">PID: {catalog.pid || "N/A"}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">{catalog.category || "N/A"}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={catalog.discountprice > 0 ? "line-through text-gray-400 text-xs" : "text-gray-800 font-semibold"}>
                          ₹{catalog.orignalprice || "0"}
                        </span>
                        {catalog.discountprice > 0 && (
                          <span className="text-[#1a5a8a] font-semibold">₹{catalog.discountprice}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                          catalog.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {catalog.stock > 0 ? `${catalog.stock} Units` : "Out of Stock"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600 text-xs">
                      {formatDate(catalog.createat)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleEditStock(catalog)}
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                        title="Edit Stock"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden flex flex-col gap-4 w-full">
            {filteredStocks.map((catalog, index) => (
              <div key={catalog.pid || index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full overflow-hidden">
                  <img
                    className="h-16 w-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                    src={catalog.bunner || "/placeholder.png"}
                    alt={catalog.title}
                  />
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm truncate w-full">
                      {catalog.title || "Untitled"}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono truncate">ID: {catalog.pid}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
                          catalog.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {catalog.stock > 0 ? `${catalog.stock} In Stock` : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleEditStock(catalog)}
                  className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-dashed border-gray-300">
          <svg className="w-14 h-14 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No products found</h3>
          <p className="text-sm text-gray-500">Try adjusting your search or stock filters.</p>
        </div>
      )}

      {/* Edit Stock Modal */}
      {isStockModalOpen && selectedStock && (
        <EditStockModal
          item={selectedStock}
          onClose={() => setIsStockModalOpen(false)}
          onSubmit={handleUpdateStock}
          stockUpdateLoading={stockUpdateLoading}
        />
      )}
    </div>
  );
};

export default Stocks;


// Sub-Component: Edit Stock Modal
const EditStockModal = ({ item, stockUpdateLoading, onClose, onSubmit }) => {
  const [stock, setStock] = useState(item.stock || 0);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm px-4 animate-fade-in">
      <div className="relative bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100">
        
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        <h2 className="text-xl font-bold mb-1 text-gray-800">
          Update Inventory
        </h2>
        <p className="text-xs text-gray-500 mb-5 truncate pr-8">{item.title}</p>

        <form onSubmit={(e) => onSubmit(e, item.pid, stock)}>
          <div className="mb-6">
            <label htmlFor="stock" className="block text-sm font-semibold text-gray-700 mb-2">
              Units in Stock
            </label>
            <input
              type="number"
              id="stock"
              min={0}
              max={10000}
              name="stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5a8a] focus:border-[#1a5a8a] outline-none text-base font-medium transition-shadow"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={stockUpdateLoading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={stockUpdateLoading}
              className={`px-5 py-2.5 rounded-lg text-white text-sm font-medium transition flex items-center gap-2 ${
                stockUpdateLoading
                  ? "bg-[#1a5a8a]/70 cursor-not-allowed"
                  : "bg-[#1a5a8a] hover:bg-[#15486e] shadow-md"
              }`}
            >
              {stockUpdateLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Saving...
                </>
              ) : (
                "Update Stock"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};