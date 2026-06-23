import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ImagePlus, Loader2, X, Tag, ChevronRight, UploadCloud, Info } from "lucide-react";

import { addCatalog, updateCatalog } from "../../services/catalogService";
import { fetchCategories, fetchMenus } from "../../store/slices/appSlice";
import { SUGGESTED_TAGS } from "../../assets/assets";
import toast from "react-hot-toast";

const initialFormData = {
  title: "",
  description: "IMAGE IS ONLY FOR REFERENCE, ACTUAL SERIAL NUMBER MAY HAVE DIFFERENT NUMBER.",
  bunner: null,
  thumbnails: [],
  orignalprice: "",
  discountprice: "",
  offer: 0,
  stock: "",
  skuid: "",
  category: "",
  subcategory: "",
  menu: "",
  submenu: "",
  tags: [],
  shipping_charge: 0,
};

const shippingSize = [
  { name: "Letter", price: 63 },
  { name: "Menila", price: 70 },
  { name: "Large", price: 100 },
];

const ProductsForm = ({
  catalogData = null,
  onLoad = false,
  isEdit = false,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.user);
  const { menus, category } = useSelector((state) => state.app);

const [formData, setFormData] = useState({
    title: "", description: "IMAGE IS ONLY FOR REFERENCE.", bunner: null,
    thumbnails: [], orignalprice: "", discountprice: "", offer: 0,
    stock: "", skuid: "", category: "", subcategory: "", 
    menu: "", submenu: "", tags: [], shipping_charge: 0, submenu_id: 0
  });
  const [bannerPreview, setBannerPreview] = useState(null);
  const [thumbnailPreviews, setThumbnailPreviews] = useState([]);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  useEffect(() => {
    if (isEdit && catalogData) {
      setFormData({
        ...initialFormData,
        ...catalogData,
        description: catalogData.description || initialFormData.description,
      });
      setBannerPreview(catalogData.bunner || null);
      setThumbnailPreviews(catalogData.thumbnails || []);
    }
  }, [isEdit, catalogData]);

  useEffect(() => {
    dispatch(fetchMenus());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const original = parseFloat(formData.orignalprice) || 0;
    const discount = parseFloat(formData.discountprice) || 0;
    if (original > 0 && discount > 0 && original > discount) {
      const offer = ((original - discount) / original) * 100;
      setFormData((prev) => ({ ...prev, offer: offer.toFixed(2) }));
    } else {
      setFormData((prev) => ({ ...prev, offer: 0 }));
    }
  }, [formData.orignalprice, formData.discountprice]);

  useEffect(() => {
    const input = tagInput.trim().toLowerCase();
    if (input.length > 0) {
      setFilteredSuggestions(
        SUGGESTED_TAGS.filter(
          (tag) => tag.toLowerCase().includes(input) && !formData.tags.includes(tag)
        )
      );
    } else {
      setFilteredSuggestions([]);
    }
  }, [tagInput, formData.tags]);

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, bunner: file }));
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleThumbnailsChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, thumbnails: [...prev.thumbnails, ...files] }));
    setThumbnailPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeThumbnail = (indexToRemove) => {
    setThumbnailPreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setFormData((prev) => ({
      ...prev,
      thumbnails: prev.thumbnails.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (e, tagToAdd = null) => {
    e?.preventDefault();
    const newTag = tagToAdd || tagInput.trim().toUpperCase();
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag] }));
      setTagInput("");
      setFilteredSuggestions([]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setBannerPreview(null);
    setThumbnailPreviews([]);
    setTagInput("");
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const errors = [];
  if (!formData.category) errors.push("Category");
  if (!formData.title) errors.push("Product Title");
  if (!formData.description) errors.push("Description");
  if (!formData.orignalprice) errors.push("Original Price");

  if (errors.length > 0) {
    return toast.error(`Missing required fields: ${errors.join(", ")}`);
  }
  const payload = {
    ...formData,
    orignalprice: parseFloat(formData.orignalprice) || 0,
    discountprice: parseFloat(formData.discountprice) || 0,
    offer: parseFloat(formData.offer) || 0,
    stock: parseInt(formData.stock) || 1,
    skuid: formData.skuid || "",
    tags: Array.isArray(formData.tags) ? formData.tags : [],
    bunner: formData.bunner, 
    thumbnails: formData.thumbnails 
  };

  setIsSaving(true);
  try {
    const res = isEdit
      ? await updateCatalog(catalogData.pid, payload, user?.id)
      : await addCatalog(payload, user?.id);
    if (res?.success === false) {
      throw new Error(res.message || "Failed to save product");
    }

    toast.success(res?.message || "Product saved successfully!");
    resetForm();
    setTimeout(() => navigate("/admin/inventory"), 1000);
    
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred";
    toast.error(errorMessage);
  } finally {
    setIsSaving(false);
  }
};

  return (
    <div className="max-w-7xl mx-auto w-full relative">
    {(isSaving || onLoad) && (
        <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
          <div className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 min-w-[300px]">
            <Loader2 className="animate-spin text-[#1a5a8a] h-12 w-12 mb-4" />
            <h2 className="text-xl font-bold text-gray-800">
              {isSaving ? "Saving Product..." : "Loading Product..."}
            </h2>
            
            {/* Dynamic Subtext */}
            <p className="text-sm text-gray-500 mt-1">
              {isSaving 
                ? "Please wait while changes are applied." 
                : "Fetching data from database, please hold on."}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isEdit ? "Update Catalog Item" : "Create New Catalog Item"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Configure product details, pricing, and media.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/inventory")}
              className="py-2.5 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 bg-[#1a5a8a] hover:bg-[#15486e] text-white font-medium rounded-lg shadow-md transition-colors"
            >
              {isEdit ? "Save Changes" : "Publish Product"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">General Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. 1950 Vintage Commemorative Coin"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#1a5a8a]/50 focus:border-[#1a5a8a] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#1a5a8a]/50 focus:border-[#1a5a8a] transition-all resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">SKU ID</label>
                    <input
                      type="text"
                      name="skuid"
                      value={formData.skuid ?? ""}
                      onChange={handleInputChange}
                      placeholder="e.g. MS-COIN-001"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#1a5a8a]/50 focus:border-[#1a5a8a] font-mono text-sm uppercase transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="stock"
                      min="0"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#1a5a8a]/50 focus:border-[#1a5a8a] transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Pricing & Logistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Original Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="orignalprice"
                    min="0"
                    value={formData.orignalprice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#1a5a8a]/50 focus:border-[#1a5a8a] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    name="discountprice"
                    min="0"
                    value={formData.discountprice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#1a5a8a]/50 focus:border-[#1a5a8a] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Offer Margin</label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={formData.offer}
                      className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-gray-600 font-bold outline-none cursor-not-allowed"
                    />
                    <span className="absolute right-4 top-2.5 text-gray-400 font-bold">%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Shipping Tier</label>
                  <select
                    name="shipping_charge"
                    value={formData.shipping_charge}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#1a5a8a]/50 focus:border-[#1a5a8a] transition-all cursor-pointer bg-white"
                  >
                    <option value={0}>Free Shipping (₹0)</option>
                    {shippingSize.map((size, index) => (
                      <option key={index} value={size.price}>
                        {size.name} - ₹{size.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Category Mapping <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2.5 text-left hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#1a5a8a]/50 focus:border-[#1a5a8a] outline-none"
                  >
                    <span className={`truncate ${!formData.category ? "text-gray-400" : "text-gray-800 font-medium"}`}>
                      {formData.category
                        ? `${formData.category}${formData.subcategory ? " / " + formData.subcategory : ""}`
                        : "Select Category Map..."}
                    </span>
                    <ChevronRight size={18} className="text-gray-400" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Menu Mapping <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMenuModal(true)}
                    className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2.5 text-left hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#1a5a8a]/50 focus:border-[#1a5a8a] outline-none"
                  >
                    <span className={`truncate ${!formData.menu ? "text-gray-400" : "text-gray-800 font-medium"}`}>
                      {formData.menu
                        ? `${formData.menu}${formData.submenu ? " / " + formData.submenu : ""}`
                        : "Select Menu Map..."}
                    </span>
                    <ChevronRight size={18} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                <Tag size={18} className="text-[#1a5a8a]" />
                <h3 className="text-lg font-bold text-gray-800">Search Tags</h3>
              </div>
              <div className="relative">
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTag(e)}
                    placeholder="Type a tag and press Enter"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#1a5a8a]/50 focus:border-[#1a5a8a] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(null)}
                    className="px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>

                {filteredSuggestions.length > 0 && (
                  <div className="absolute top-10 z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {filteredSuggestions.map((tag, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-[#1a5a8a]/10 hover:text-[#1a5a8a] cursor-pointer font-medium transition-colors"
                        onClick={(e) => handleAddTag(e, tag)}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 min-h-[50px] p-3 bg-gray-50 border border-gray-100 rounded-lg">
                  {formData.tags.length === 0 ? (
                    <span className="text-sm text-gray-400 italic flex items-center gap-1">
                      <Info size={14} /> No tags added yet. Tags improve search visibility.
                    </span>
                  ) : (
                    formData.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1.5 bg-[#1a5a8a]/10 text-[#1a5a8a] border border-[#1a5a8a]/20 px-3 py-1.5 rounded-md text-xs font-bold tracking-wide"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:bg-[#1a5a8a]/20 rounded-full p-0.5 transition-colors"
                        >
                          <X size={14} className="text-[#1a5a8a]" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Primary Image</h3>
              <label className="relative flex items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-[#1a5a8a]/50 transition-colors cursor-pointer group overflow-hidden">
                {bannerPreview ? (
                  <>
                    <img src={bannerPreview} alt="Banner" className="w-full h-full object-contain p-2" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-medium flex items-center gap-2">
                        <UploadCloud size={18} /> Change Image
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-gray-400 group-hover:text-[#1a5a8a] transition-colors">
                    <ImagePlus size={40} className="mb-2" />
                    <span className="text-sm font-medium">Click to upload banner</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Gallery Images</h3>
              <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-[#1a5a8a]/50 transition-colors cursor-pointer group">
                <ImagePlus size={28} className="text-gray-400 group-hover:text-[#1a5a8a] mb-2 transition-colors" />
                <span className="text-sm font-medium text-gray-500 group-hover:text-[#1a5a8a] transition-colors">
                  Upload additional photos
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleThumbnailsChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>

              {thumbnailPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-3">
                  {thumbnailPreviews.map((src, index) => (
                    <div
                      key={index}
                      className="relative aspect-square border border-gray-200 rounded-lg overflow-hidden group bg-white shadow-sm"
                    >
                      <img src={src} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeThumbnail(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {showCategoryModal && (
        <SelectionModal
          title="Map Category"
          data={category}
          onClose={() => setShowCategoryModal(false)}
          onSelect={(catObj, subObj) => {
            setFormData((prev) => {
              const updated = {
                ...prev,
                category: catObj.c_title,
                subcategory: subObj?.c_title || "",
              };
              if (subObj?.id) {
                updated.submenu_id = subObj.id;
              } else {
                delete updated.submenu_id;
              }
              return updated;
            });
            setShowCategoryModal(false);
          }}
        />
      )}

      {showMenuModal && (
        <SelectionModal
          title="Map Menu"
          data={menus}
          onClose={() => setShowMenuModal(false)}
          onSelect={(menuObj, subObj) => {
            setFormData((prev) => {
              const updated = {
                ...prev,
                menu: menuObj.name,
                submenu: subObj?.name || "",
              };
              if (subObj?.id) {
                updated.submenu_id = subObj.id;
              } else {
                delete updated.submenu_id;
              }
              return updated;
            });
            setShowMenuModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ProductsForm;

const SelectionModal = ({ title, data = [], onClose, onSelect }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden min-h-[300px]">
          <div className="w-1/2 border-r border-gray-100 overflow-y-auto p-3 space-y-1 bg-gray-50/30">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Primary</p>
            {data.map((item, i) => (
              <button
                key={i}
                type="button"
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                  selectedItem?.name === item.name
                    ? "bg-[#1a5a8a] text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => {
                  const subs = item.submenus || item.subcategories || [];
                  if (subs.length === 0) {
                    onSelect(item, null);
                  } else {
                    setSelectedItem(item);
                  }
                }}
              >
                {item.name || item.c_title}
                {(item.submenus?.length > 0 || item.subcategories?.length > 0) && (
                  <ChevronRight
                    size={16}
                    className={selectedItem?.name === item.name ? "text-blue-200" : "text-gray-400"}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="w-1/2 overflow-y-auto p-3 space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Sub-Items</p>
            {selectedItem ? (
              (selectedItem.submenus || selectedItem.subcategories || []).length > 0 ? (
                (selectedItem.submenus || selectedItem.subcategories).map((sub, i) => (
                  <button
                    key={i}
                    type="button"
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-[#1a5a8a]/10 hover:text-[#1a5a8a] transition-colors"
                    onClick={() => onSelect(selectedItem, sub)}
                  >
                    {sub.name || sub.c_title}
                  </button>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                  No sub-items available.
                </div>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                <ChevronRight size={40} className="mb-2 opacity-20" />
                <p className="text-sm font-medium">Select a primary item to view sub-items.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};