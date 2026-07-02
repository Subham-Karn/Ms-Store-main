import React, { useState } from "react";
import Papa from "papaparse";
import {
  Upload,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../axios/api";

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

const BulkUploadManager = ({ onClose, user }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCSV = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete: (result) => {
        const headers = result.meta.fields || [];

        const missing = REQUIRED_COLUMNS.filter(
          (col) => !headers.includes(col)
        );

        if (missing.length) {
          toast.error(
            `Missing Columns : ${missing.join(", ")}`
          );
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
          tags: row["TAGS"]
            ? row["TAGS"]
              .split(",")
              .map((tag) => tag.trim())
            : [],
          meta_title: row["META_TITLE"] || "",
          meta_description:
            row["META_DESCRIPTION"] || "",
        }));

        setProducts(parsedProducts);

        toast.success(
          `${parsedProducts.length} Products Loaded`
        );
      },

      error: () => {
        toast.error("Invalid CSV File");
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

      const response = await api.post("/products/bulk", payload);

      toast.success(
        response?.message || "Bulk upload completed successfully."
      );

      setProducts([]);
    } catch (error) {
      console.error(error);

      toast.error(
        error?.message || "Bulk upload failed."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-6">

        <button
          onClick={onClose}
          className="flex items-center gap-2 border rounded-lg px-4 py-2"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h1 className="text-2xl font-bold">
          Bulk Upload
        </h1>

      </div>

      <label className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">

        <Upload size={55} />

        <p className="mt-4 text-lg font-semibold">
          Click to Upload CSV
        </p>

        <input
          type="file"
          hidden
          accept=".csv"
          onChange={handleCSV}
        />

      </label>

      <div className="mt-8 border rounded-xl p-4">

        <h2 className="font-bold text-lg mb-4">
          Products Loaded : {products.length}
        </h2>

        {products.length > 0 && (

          <div className="overflow-auto">

            <table className="w-full border">

              <thead>

                <tr className="bg-gray-100">

                  <th className="border p-2">SKU</th>
                  <th className="border p-2">Title</th>
                  <th className="border p-2">Category</th>
                  <th className="border p-2">Price</th>

                </tr>

              </thead>

              <tbody>

                {products.slice(0, 20).map((item, index) => (

                  <tr key={index}>

                    <td className="border p-2">{item.skuid}</td>

                    <td className="border p-2">
                      {item.title}
                    </td>

                    <td className="border p-2">
                      {item.category}
                    </td>

                    <td className="border p-2">
                      ₹{item.orignalprice}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

            {products.length > 20 && (

              <p className="mt-3 text-gray-500">

                Showing first 20 of {products.length} products

              </p>

            )}

            <button
              onClick={handleBulkUpload}
              disabled={loading}
              className="mt-6 flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg"
            >

              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Uploading...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Upload All Products
                </>
              )}

            </button>

          </div>

        )}

      </div>

    </div>
  );

};

export default BulkUploadManager;