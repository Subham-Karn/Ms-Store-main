import React, { useState } from "react";
import Papa from "papaparse";
import {
  Upload,
  Save,
  ArrowLeft,
  Loader2,
  FileText,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../axios/api";
import { useDispatch } from "react-redux";
import { bulkProductAdd } from "../../store/slices/appSlice";

const REQUIRED_COLUMNS = [
  "SKU",
  "TITLE",
  "CATEGORY",
  "COUNTRY",
  "CONDITION",
  "PRICE",
  "IMAGE LINK",
  "DESCRIPTION",
  "TAGS",
  "META_TITLE",
  "META_DESCRIPTION",
];

const BulkUploadManager = ({ onClose, user}) => {
  const [products, setProducts] = useState([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch()
;  const handleCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const headers = result.meta.fields || [];
        const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));

        if (missing.length) {
          toast.error(`Missing Columns: ${missing.join(", ")}`);
          setFileName("");
          return;
        }

        const parsedProducts = result.data.map((row) => ({
          skuid: row["SKU"]?.trim() || "",
          title: row["TITLE"]?.trim() || "",
          category: row["CATEGORY"]?.trim() || "",
          country: row["COUNTRY"]?.trim() || "",
          condition: row["CONDITION"]?.trim() || "",
          orignalprice: Number(row["PRICE"]) || 0,
          bunner: row["IMAGE LINK"]?.trim() || "",
          description: row["DESCRIPTION"] || "",
          tags: row["TAGS"] ? row["TAGS"].split(",").map((tag) => tag.trim()) : [],
          meta_title: row["META_TITLE"] || "",
          meta_description: row["META_DESCRIPTION"] || "",
        }));

        setProducts(parsedProducts);
        toast.success(`${parsedProducts.length} Products Loaded`);
      },
      error: () => {
        toast.error("Invalid CSV File");
        setFileName("");
      },
    });
  };

  const handleBulkUpload = async () => {
    if (!products.length) {
      toast.error("Please load a CSV file first.");
      return;
    }

    if (!user?.uid && !user?._id && !user?.id) {
      toast.error("User information not found.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        userId: user.uid || user._id || user.id,
        products,
      };

      const response = await dispatch(bulkProductAdd(payload)).unwrap();
      toast.success(response?.message || "Bulk upload completed successfully.");
      setProducts([]);
      setFileName("");
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Bulk upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const clearFile = (e) => {
    e.preventDefault();
    setProducts([]);
    setFileName("");
  };

  return (
    <div className="w-full  bg-gray-50/50 min-h-screen">
      <div className="flex items-center justify-between gap-4 mb-8">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg px-3.5 py-2 shadow-sm transition"
        >
          <ArrowLeft size={16} />
          Back to Inventory
        </button>
        <h1 className="text-xl font-bold text-gray-900">Bulk Import Products</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">
              Instructions
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Your CSV file must include the exact header columns specified below. Missing columns will cause parsing errors.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {REQUIRED_COLUMNS.map((col) => (
                <span
                  key={col}
                  className="bg-gray-50 text-gray-600 border border-gray-150 px-2 py-0.5 rounded text-[10px] font-mono font-medium"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          {!fileName ? (
            <label className="border-2 border-dashed border-gray-250 hover:border-[#1a5a8a] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-gray-50/50 transition shadow-sm group">
              <div className="p-3 bg-gray-50 group-hover:bg-blue-50 text-gray-400 group-hover:text-[#1a5a8a] rounded-xl transition">
                <Upload size={28} />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-700">
                Click to Upload CSV
              </p>
              <p className="mt-1 text-xs text-gray-400">Max file size 10MB</p>
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={handleCSV}
              />
            </label>
          ) : (
            <div className="bg-white border border-gray-150 rounded-xl p-4 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2.5 bg-green-50 text-green-600 rounded-lg shrink-0">
                  <FileText size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {fileName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {products.length} records parsed
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                disabled={loading}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          {products.length > 0 && (
            <button
              onClick={handleBulkUpload}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#1a5a8a] hover:bg-[#1a5a8a]/90 disabled:bg-gray-300 text-white font-medium px-5 py-2.5 rounded-lg text-sm shadow-sm transition"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Uploading Assets...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Commit Upload ({products.length})
                </>
              )}
            </button>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                Data Preview Panel
              </h2>
              {products.length > 0 && (
                <span className="text-xs font-semibold bg-blue-50 text-[#1a5a8a] px-2.5 py-0.5 rounded-full">
                  Staging {Math.min(products.length, 20)} of {products.length}
                </span>
              )}
            </div>

            {products.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-gray-400">
                <FileText size={36} className="text-gray-300 mb-2" />
                <p className="text-sm">No dynamic dataset compiled</p>
                <p className="text-xs text-gray-400 mt-1">Upload a complete CSV spreadsheet to stage rows</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-gray-500 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                    {products.slice(0, 20).map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50/50 transition">
                        <td className="py-3 px-4 text-center text-gray-400 font-mono">{index + 1}</td>
                        <td className="py-3 px-4 text-gray-900 font-mono text-[11px]">{item.skuid}</td>
                        <td className="py-3 px-4 truncate max-w-[180px]" title={item.title}>
                          {item.title}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px]">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          ₹{item.orignalprice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length > 20 && (
                  <div className="p-3.5 bg-gray-50/50 border-t border-gray-100 text-center text-xs text-gray-400 font-medium">
                    Truncating screen buffer view. Remaining {products.length - 20} records are cached safely.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadManager;