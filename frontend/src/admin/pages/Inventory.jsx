import React, { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { BiSolidCategory } from "react-icons/bi";

import { deleteCatalog } from "../../services/catalogService";
import { formatDate } from "../../util/formateDate";
import { deleteProduct, fetchCatalogs } from "../../store/slices/appSlice";
import CategoryManager from "../components/CategoryManager";
import BulkUploadManager from "../components/BulkUploadManager";
import api from "../../axios/api";
const PLACEHOLDER_IMG = "https://via.placeholder.com/56";

const Inventory = () => {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.user);
  // --- Redux State ---
  const { catalogs, loading } = useSelector((state) => state.app);

  const allCatalogs = useMemo(() => {
    return catalogs ? catalogs.filter((c) => c.stock > 0 && c.createat) : [];
  }, [catalogs]);

  // --- Local UI State ---
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCategoryOpen , setCategoryOpen] = useState(false);
  const [filtredCatalog, setFiltredCatalog] = useState(allCatalogs);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
const [selectedProducts, setSelectedProducts] = useState([]);
  // --- CSV Upload State ---
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);
  // Fetch catalogs on mount
  useEffect(() => {
    document.title = "Ms Store | Inventory";
    dispatch(fetchCatalogs());
  }, [dispatch]);

  // Filter Logic
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

  // --- Handlers ---
const handleDeleteCatalog = async (id) => {
  try {
    setDeleteLoading(true);
    const resultAction = await dispatch(deleteProduct(id)).unwrap();
    toast.success("Catalog deleted successfully");
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
    prev.includes(pid)
      ? prev.filter((id) => id !== pid)
      : [...prev, pid]
  );
};

const handleSelectAll = () => {
  if (selectedProducts.length === filtredCatalog.length) {
    setSelectedProducts([]);
  } else {
    setSelectedProducts(
      filtredCatalog.map((item) => item.pid)
    );
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
    await api.delete("/products/bulk-delete", {
      data: {
        productIds: selectedProducts,
      },
    });

    toast.success("Products deleted successfully.");

    setSelectedProducts([]);

    dispatch(fetchCatalogs());
  } catch (err) {
    console.error(err);
    toast.error("Bulk delete failed.");
  }
};
  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      return toast.error("Please select a valid .csv file");
    }

    try {
      setCsvUploading(true);
      
      // Construct FormData for your backend
      const formData = new FormData();
      formData.append("file", csvFile);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Catalogs imported successfully!");
      dispatch(fetchCatalogs()); // Refresh the inventory table
      setIsCsvModalOpen(false);
      setCsvFile(null);
    } catch (error) {
      toast.error("Failed to process CSV file");
    } finally {
      setCsvUploading(false);
    }
  };

  // --- UI Helpers ---
  const checkValue = (value) => {
    return value !== null && value !== undefined && value !== "" ? value : "N/A";
  };

  const getPriceDisplay = (catalog) => {
    const isStrikethrough = catalog.discountprice > 0 && catalog.orignalprice;

    if (checkValue(catalog.orignalprice) === "N/A" && checkValue(catalog.discountprice) === "N/A") {
      return <span className="text-gray-500">N/A</span>;
    }

    return (
      <div className="flex flex-col items-center">
        <span className={isStrikethrough ? "line-through text-gray-500" : "text-gray-800 font-semibold"}>
          {checkValue(catalog.orignalprice) !== "N/A" ? `₹${catalog.orignalprice}` : "N/A"}
        </span>
        {catalog.discountprice > 0 && (
          <span className="text-gray-800 font-semibold">₹{catalog.discountprice}</span>
        )}
      </div>
    );
  };

  if(isCategoryOpen){
    return <CategoryManager onClose={()=>setCategoryOpen(false)}/>
  }

  if (isCsvModalOpen) {
  return (
    <BulkUploadManager
      onClose={() => setIsCsvModalOpen(false)}
      user={user}
    />
  );
}

  return (
    <div className="flex flex-col items-start w-full min-h-screen relative">
      
      {/* 1. Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedCatalog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 bg-opacity-50 animate-fade-in">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Delete Catalog</h2>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to permanently remove <strong>{selectedCatalog.title || "this item"}</strong> from your inventory? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm flex items-center gap-2"
                onClick={() => handleDeleteCatalog(selectedCatalog.pid)}
                disabled={deleteLoading}
              >
                {deleteLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {deleteLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Actions */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Box className="text-[#1a5a8a]" />
          Inventory Management
        </h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex-1 sm:flex-none bg-green-600 flex items-center justify-center px-4 py-2 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            Bulk Import
          </button>
          <Link
            to="/admin/inventory/add"
            className="flex-1 sm:flex-none bg-[#1a5a8a] flex items-center justify-center px-4 py-2 text-white rounded-lg text-sm font-medium hover:bg-[#1a5a8a]/90 transition-colors shadow-sm"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Single
          </Link>
          <button
            onClick={()=>setCategoryOpen(true)}
            className="flex-1 sm:flex-none bg-[#1a5a8a] flex items-center justify-center px-4 py-2 text-white rounded-lg text-sm font-medium hover:bg-[#1a5a8a]/90 transition-colors shadow-sm"
          >
            <BiSolidCategory className="mr-1 h-4 w-4" />
            Category Manager
          </button>
        </div>
        {selectedProducts.length > 0 && (
  <div className="w-full mb-4 flex justify-end">
    <button
      onClick={handleBulkDelete}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
    >
      <Trash2 size={18} />
      Delete Selected ({selectedProducts.length})
    </button>
  </div>
)}
      </div>

      {/* Filters Area */}
      <div className="w-full bg-white p-4 sm:p-5 rounded-lg shadow-sm mb-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="flex flex-col w-full sm:w-1/2">
            <label htmlFor="search" className="text-sm font-medium text-gray-700 mb-1">
              Find Product by Name, ID, or SKU
            </label>
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5a8a] focus:border-[#1a5a8a] focus:outline-none transition-colors text-sm sm:text-base"
                type="text"
                placeholder="Search products..."
                name="search"
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
                name="stock"
                className="w-full p-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-[#1a5a8a] focus:border-[#1a5a8a] focus:outline-none transition-colors pr-10 text-sm sm:text-base"
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

      {/* States */}
      {loading && (
        <div className="mt-5 w-full flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
          <Loader2 className="animate-spin h-10 w-10 text-[#1a5a8a]" />
          <h1 className="text-lg font-medium">Syncing Inventory...</h1>
        </div>
      )}

      {!loading && (filtredCatalog === undefined || filtredCatalog.length === 0) && (
        <div className="mt-5 w-full flex flex-col items-center justify-center gap-3 py-20 text-gray-400 bg-white rounded-lg border border-dashed border-gray-300">
          <AlertCircle size={48} className="text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-600">No Catalogs Found</h2>
          <p className="text-sm">Start by adding a new product or adjust your search filters.</p>
        </div>
      )}

      {/* DeskTop Table Design */}
      {!loading && filtredCatalog.length > 0 && (
        <div className="hidden sm:block mt-2 w-full overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
          <table className="min-w-full overflow-hidden text-sm">
            <thead className="bg-[#1a5a8a] text-white">
              <tr>
                
<th className="py-4 px-4 rounded-tl-lg">
  <input
    type="checkbox"
    checked={
      selectedProducts.length === filtredCatalog.length &&
      filtredCatalog.length > 0
    }
    onChange={handleSelectAll}
  />
</th>
                <th className="py-4 px-4 text-left font-semibold">
  S.No.
</th>
                <th className="py-4 px-4 text-left font-semibold">Image</th>
                <th className="py-4 px-4 text-left font-semibold">Product</th>
                <th className="py-4 px-4 text-left font-semibold">SKU ID</th>
                <th className="py-4 px-4 text-left font-semibold">Category</th>
                <th className="py-4 px-4 text-center font-semibold">Price</th>
                <th className="py-4 px-4 text-center font-semibold">Stock</th>
                <th className="py-4 px-4 text-center font-semibold">Date</th>
                <th className="py-4 px-4 text-center font-semibold rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtredCatalog.map((catalog, index) => (
                <tr key={catalog.pid || index} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
  <input
    type="checkbox"
    checked={selectedProducts.includes(catalog.pid)}
    onChange={() => handleSelectProduct(catalog.pid)}
  />
</td>
                  <td className="py-3 px-4 font-medium text-gray-500">{index + 1}</td>
                  <td className="py-3 px-4">
                    <img
                      className="h-14 w-14 object-cover rounded-md border border-gray-200 shadow-sm"
                      src={catalog.bunner || PLACEHOLDER_IMG}
                      alt={catalog.title || "N/A"}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <h3 className="font-medium text-gray-800 truncate max-w-[200px]" title={catalog.title}>
                      {catalog.title || "N/A"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">PID: <span className="font-mono">{catalog.pid || "N/A"}</span></p>
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-mono text-xs">
                    {catalog.skuid || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <span className="bg-gray-100 px-2.5 py-1 rounded-md text-xs">{catalog.category || "N/A"}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getPriceDisplay(catalog)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        catalog.stock > 0
                          ? "bg-green-100 text-green-700"
                          : catalog.stock === 0
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {catalog.stock !== null && catalog.stock !== undefined
                        ? catalog.stock > 0
                          ? `${catalog.stock} Units`
                          : "Out of Stock"
                        : "N/A"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600 text-xs">
                    {catalog.created_at ? formatDate(catalog.created_at) : "N/A"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/admin/inventory/edit/${catalog.pid}`}
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                        title="Edit Catalog"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleSelectedCatalog(catalog)}
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                        title="Delete Catalog"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Design */}
      {!loading && filtredCatalog.length > 0 && (
        <div className="sm:hidden mt-2 w-full space-y-4">
          {filtredCatalog.map((catalog, index) => (
            <div
              key={catalog.pid || index}
              className="bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-300"
            >
              {/* Header Section */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <img
                    className="h-12 w-12 object-cover rounded-md border border-gray-200 bg-white"
                    src={catalog.bunner || PLACEHOLDER_IMG}
                    alt={catalog.title || "N/A"}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm leading-tight truncate max-w-[180px]">
                      {catalog.title || "N/A"}
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider font-mono">
                      PID: {catalog.pid || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/admin/inventory/edit/${catalog.pid}`}
                    className="p-1.5 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={() => handleSelectedCatalog(catalog)}
                    className="p-1.5 text-red-600 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Details Section */}
              <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                <p>
                  <span className="font-medium text-gray-500 block mb-0.5">SKU ID</span>
                  <span className="text-gray-800 font-mono bg-gray-50 px-1.5 py-0.5 rounded">{catalog.skuid || "N/A"}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-500 block mb-0.5">Category</span>
                  <span className="text-gray-800">{catalog.category || "N/A"}</span>
                </p>

                <div className="flex flex-col">
                  <span className="font-medium text-gray-500 mb-0.5">Stock</span>
                  <span
                    className={`px-2 py-0.5 w-fit rounded-full font-medium ${
                      catalog.stock > 0
                        ? "bg-green-100 text-green-700"
                        : catalog.stock === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {catalog.stock !== null && catalog.stock !== undefined
                      ? catalog.stock > 0
                        ? `${catalog.stock} Units`
                        : "Out of Stock"
                      : "N/A"}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="font-medium text-gray-500 mb-0.5">Price</span>
                  <div className="flex items-center gap-1.5">
                    <span className={catalog.discountprice > 0 && catalog.orignalprice ? "line-through text-gray-400" : "text-gray-800 font-bold"}>
                      {catalog.orignalprice ? `₹${catalog.orignalprice}` : "N/A"}
                    </span>
                    {catalog.discountprice > 0 && (
                      <span className="text-[#1a5a8a] font-bold">
                        ₹{catalog.discountprice}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Inventory;