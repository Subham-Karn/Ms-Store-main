import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  AlertCircle,
  Box,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  UploadCloud,
  Search,
  ChevronDown,
} from "lucide-react";
import { BiSolidCategory } from "react-icons/bi";
import { formatDate } from "../../util/formateDate";
import { deleteBulkProducts, deleteProduct, fetchCatalogs } from "../../store/slices/appSlice";
import CategoryManager from "../components/CategoryManager";
import BulkUploadManager from "../components/BulkUploadManager";

const PLACEHOLDER_IMG = "https://via.placeholder.com/56";

const Inventory = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { catalogs, loading } = useSelector((state) => state.app);

  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCategoryOpen, setCategoryOpen] = useState(false);
  const [filtredCatalog, setFiltredCatalog] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Ms Store | Inventory";
    dispatch(fetchCatalogs());
  }, [dispatch]);

  useEffect(() => {
    let result = Array.isArray(catalogs) ? [...catalogs] : [];

    if (search) {
      const lowerCaseSearch = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(lowerCaseSearch) ||
          item.pid?.toLowerCase().includes(lowerCaseSearch) ||
          item.skuid?.toLowerCase().includes(lowerCaseSearch)
      );
    }

    if (filter === "inStock") {
      result = result.filter((item) => item.stock && item.stock > 0);
    } else if (filter === "outOfStock") {
      result = result.filter((item) => !item.stock || item.stock === 0);
    }

    result = result.sort((a, b) => new Date(b.createat) - new Date(a.createat));
    setFiltredCatalog(result);
  }, [search, filter, catalogs]);

  const handleDeleteCatalog = async (id) => {
    try {
      setDeleteLoading(true);
      await dispatch(deleteProduct(id)).unwrap();
      toast.success("Catalog deleted successfully");
      setSelectedProducts((prev) => prev.filter((pid) => pid !== id));
    } catch (error) {
      toast.error(error || "Failed to delete catalog");
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleSelectedCatalog = (catalog) => {
    setSelectedCatalog(catalog);
    setIsDeleteModalOpen(true);
  };

  const handleSelectProduct = (pid) => {
    setSelectedProducts((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filtredCatalog.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filtredCatalog.map((item) => item.pid).filter(Boolean));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product.");
      return;
    }

    const confirmDelete = window.confirm(
      `Delete ${selectedProducts.length} selected products?`
    );
    if (!confirmDelete) return;

    try {
      const response = await dispatch(deleteBulkProducts({ selectedProducts })).unwrap();
      toast.success(response.message || "Products deleted successfully.");
      setSelectedProducts([]);
      dispatch(fetchCatalogs());
    } catch (err) {
      console.error(err);
      toast.error("Bulk delete failed.");
    }
  };

  const checkValue = (value) => {
    return value !== null && value !== undefined && value !== "" ? value : "N/A";
  };

  const getPriceDisplay = (catalog) => {
    const isStrikethrough = catalog.discountprice > 0 && catalog.orignalprice;

    if (checkValue(catalog.orignalprice) === "N/A" && checkValue(catalog.discountprice) === "N/A") {
      return <span className="text-gray-400">N/A</span>;
    }

    return (
      <div className="flex flex-col items-center justify-center gap-0.5">
        <span className={isStrikethrough ? "line-through text-gray-400 text-xs" : "text-gray-700 font-medium"}>
          {checkValue(catalog.orignalprice) !== "N/A" ? `₹${catalog.orignalprice}` : "N/A"}
        </span>
        {catalog.discountprice > 0 && (
          <span className="text-gray-900 font-semibold">₹{catalog.discountprice}</span>
        )}
      </div>
    );
  };

  if (isCategoryOpen) {
    return <CategoryManager onClose={() => setCategoryOpen(false)} />;
  }

  if (isCsvModalOpen) {
    return <BulkUploadManager onClose={() => setIsCsvModalOpen(false)} user={user} />;
  }

  return (
    <div className="flex flex-col items-start w-full min-h-screen p-4 sm:p-6 antialiased selection:bg-[#1a5a8a]/10">
      
      {/* Dynamic Modal Overlay */}
      {isDeleteModalOpen && selectedCatalog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900/30 backdrop-blur-sm transition-all duration-200">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xl max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Delete Catalog</h2>
            <p className="text-gray-500 mb-5 text-sm leading-relaxed">
              Are you sure you want to permanently remove <strong>{selectedCatalog.title || "this item"}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                className="px-3.5 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 border border-gray-100 active:scale-95 transition tool-btn text-sm font-medium"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="px-3.5 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-95 transition text-sm font-medium flex items-center gap-2 shadow-sm shadow-red-100"
                onClick={() => handleDeleteCatalog(selectedCatalog.pid)}
                disabled={deleteLoading}
              >
                {deleteLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {deleteLoading ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
          <Box className="text-[#1a5a8a] h-5 w-5" />
          Inventory Management
        </h2>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {selectedProducts.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex-1 sm:flex-none bg-red-50 hover:bg-red-100 text-red-600 px-3.5 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium border border-red-100 transition-all active:scale-95"
            >
              <Trash2 size={15} />
              Delete Selection ({selectedProducts.length})
            </button>
          )}
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex-1 sm:flex-none bg-white border border-gray-100 text-gray-700 flex items-center justify-center px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          >
            <UploadCloud className="mr-2 h-4 w-4 text-gray-400" />
            Bulk Import
          </button>
          <Link
            to="/admin/inventory/add"
            className="flex-1 sm:flex-none bg-[#1a5a8a] flex items-center justify-center px-3.5 py-2 text-white rounded-lg text-sm font-medium hover:bg-[#1a5a8a]/90 active:scale-95 transition-all shadow-sm"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Single
          </Link>
          <button
            onClick={() => setCategoryOpen(true)}
            className="flex-1 sm:flex-none bg-white border border-gray-100 text-gray-700 flex items-center justify-center px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          >
            <BiSolidCategory className="mr-1.5 h-4 w-4 text-gray-400" />
            Categories
          </button>
        </div>
      </div>

      {/* Filters Box */}
      <div className="w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col w-full">
            <label htmlFor="search" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Find Product
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                className="w-full pl-9 pr-4 py-2 border border-gray-100 rounded-lg focus:ring-4 focus:ring-[#1a5a8a]/5 focus:border-[#1a5a8a] focus:outline-none transition-all text-sm text-gray-800 placeholder-gray-400"
                type="text"
                placeholder="Search by title, ID, SKU..."
                name="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="stock" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Stock Status
            </label>
            <div className="relative">
              <select
                name="stock"
                className="w-full p-2 pl-3 border border-gray-100 rounded-lg appearance-none focus:ring-4 focus:ring-[#1a5a8a]/5 focus:border-[#1a5a8a] focus:outline-none transition-all pr-10 text-sm bg-white text-gray-700 cursor-pointer"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="All">All Products</option>
                <option value="inStock">In Stock Only</option>
                <option value="outOfStock">Out of Stock</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Loading Canvas */}
      {loading && (
        <div className="w-full flex flex-col items-center justify-center gap-2.5 py-20 text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm">
          <Loader2 className="animate-spin h-7 w-7 text-[#1a5a8a]" />
          <p className="text-xs font-medium tracking-wide">Syncing Inventory...</p>
        </div>
      )}

      {/* Empty State Canvas */}
      {!loading && (!filtredCatalog || filtredCatalog.length === 0) && (
        <div className="w-full flex flex-col items-center justify-center gap-2 py-16 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200 shadow-sm">
          <AlertCircle size={32} className="text-gray-300" />
          <h2 className="text-sm font-semibold text-gray-700">No Catalogs Found</h2>
          <p className="text-[11px] text-gray-400">Try adjusting your search criteria or filters.</p>
        </div>
      )}

      {/* Grid / Table View Block */}
      {!loading && filtredCatalog.length > 0 && (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block w-full overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
            <table className="min-w-full text-sm whitespace-nowrap table-fixed">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-medium text-xs tracking-wider">
                <tr>
                  <th className="py-3 px-4 text-center w-12">
                    <input
                      type="checkbox"
                      className="rounded border-gray-200 text-[#1a5a8a] focus:ring-[#1a5a8a]/20 h-4 w-4 cursor-pointer"
                      checked={selectedProducts.length === filtredCatalog.length && filtredCatalog.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="py-3 px-2 text-left w-14">Idx</th>
                  <th className="py-3 px-3 text-left w-16">Image</th>
                  <th className="py-3 px-4 text-left w-64">Product</th>
                  <th className="py-3 px-4 text-left w-36">SKU ID</th>
                  <th className="py-3 px-4 text-left w-36">Category</th>
                  <th className="py-3 px-4 text-center w-28">Price</th>
                  <th className="py-3 px-4 text-center w-28">Stock</th>
                  <th className="py-3 px-4 text-center w-32">Added On</th>
                  <th className="py-3 px-4 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {filtredCatalog.map((catalog, index) => (
                  <tr key={catalog.pid || index} className="hover:bg-gray-50/40 transition-colors duration-150">
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-200 text-[#1a5a8a] focus:ring-[#1a5a8a]/20 h-4 w-4 cursor-pointer"
                        checked={selectedProducts.includes(catalog.pid)}
                        onChange={() => handleSelectProduct(catalog.pid)}
                      />
                    </td>
                    <td className="py-3 px-2 font-mono text-xs text-gray-400">{index + 1}</td>
                    <td className="py-3 px-3">
                      <img
                        className="h-10 w-10 object-cover rounded-lg border border-gray-100 bg-gray-50"
                        src={catalog.bunner || PLACEHOLDER_IMG}
                        alt=""
                      />
                    </td>
                    <td className="py-3 px-4 overflow-hidden">
                      <h3 className="font-medium text-gray-800 truncate" title={catalog.title}>
                        {catalog.title || "N/A"}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-mono tracking-tight mt-0.5">PID: {catalog.pid || "N/A"}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                      {catalog.skuid || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-100 text-xs font-medium">
                        {catalog.category || "Unassigned"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getPriceDisplay(catalog)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                          catalog.stock > 0 ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                        }`}
                      >
                        {catalog.stock > 0 ? `${catalog.stock} Units` : "Out of Stock"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-400 text-xs font-mono">
                      {catalog.created_at ? formatDate(catalog.created_at) : "—"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          to={`/admin/inventory/edit/${catalog.pid}`}
                          className="p-1.5 text-gray-500 hover:text-[#1a5a8a] hover:bg-gray-50 rounded-md border border-transparent hover:border-gray-100 transition-all duration-150"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => handleSelectedCatalog(catalog)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md border border-transparent hover:border-red-100 transition-all duration-150"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Layout cards */}
          <div className="md:hidden w-full space-y-3">
            <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm">
              <label className="flex items-center gap-2.5 text-xs font-medium text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-gray-200 text-[#1a5a8a] focus:ring-[#1a5a8a]/20 h-4 w-4"
                  checked={selectedProducts.length === filtredCatalog.length && filtredCatalog.length > 0}
                  onChange={handleSelectAll}
                />
                Select All Listed ({filtredCatalog.length})
              </label>
            </div>

            {filtredCatalog.map((catalog, index) => (
              <div key={catalog.pid || index} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50/40 border-b border-gray-100">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <input
                      type="checkbox"
                      className="rounded border-gray-200 text-[#1a5a8a] focus:ring-[#1a5a8a]/20 h-4 w-4 flex-shrink-0"
                      checked={selectedProducts.includes(catalog.pid)}
                      onChange={() => handleSelectProduct(catalog.pid)}
                    />
                    <img
                      className="h-10 w-10 object-cover rounded-lg border border-gray-100 bg-white flex-shrink-0"
                      src={catalog.bunner || PLACEHOLDER_IMG}
                      alt=""
                    />
                    <div className="overflow-hidden">
                      <h3 className="font-semibold text-gray-800 text-sm truncate max-w-[160px]">
                        {catalog.title || "N/A"}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-mono tracking-tight mt-0.5">
                        PID: {catalog.pid || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Link
                      to={`/admin/inventory/edit/${catalog.pid}`}
                      className="p-1.5 text-gray-500 bg-gray-50 border border-gray-100 rounded-md"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => handleSelectedCatalog(catalog)}
                      className="p-1.5 text-red-600 bg-red-50 border border-red-100 rounded-md"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-2 gap-y-3.5 text-xs">
                  <div>
                    <span className="font-medium text-gray-400 block mb-1">SKU ID</span>
                    <span className="text-gray-700 font-mono bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded text-[11px]">{catalog.skuid || "—"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-400 block mb-1">Category</span>
                    <span className="text-gray-700 font-medium">{catalog.category || "—"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-400 block mb-1">Stock</span>
                    <span className={`font-medium ${catalog.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                      {catalog.stock > 0 ? `${catalog.stock} Units` : "Out of Stock"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-400 block mb-1">Price</span>
                    <div className="flex items-center gap-1.5">
                      <span className={catalog.discountprice > 0 && catalog.orignalprice ? "line-through text-gray-400" : "text-gray-800 font-semibold"}>
                        {catalog.orignalprice ? `₹${catalog.orignalprice}` : "N/A"}
                      </span>
                      {catalog.discountprice > 0 && (
                        <span className="text-gray-900 font-bold">₹{catalog.discountprice}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Inventory;