import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FolderTree,
  Plus,
  FolderPlus,
  CornerDownRight,
  Loader2,
  Trash2,
  LayoutList,
  ChevronLeft,
  X,
} from "lucide-react";
import {
  fetchCategories,
  fetchMenus,
  createNewCategory,
} from "../../store/slices/appSlice";
import { createTaxonomy, deleteTaxonomy } from "../../services/taxonomyService";
import DeleteModal from "./DeleteModal";

const CategoryManager = ({ onClose }) => {
  const dispatch = useDispatch();

  // --- Redux State ---
  const { category, menus, loading, menuLoading } = useSelector(
    (state) => state.app,
  );
  const { user } = useSelector((state) => state.user);

  // --- UI State ---
  const [activeTab, setActiveTab] = useState("categories");
  const [creationMode, setCreationMode] = useState("parent");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // --- Form State ---
  const [parentName, setParentName] = useState("");
  const [childName, setChildName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");

  // Initial Data Fetch
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchMenus());
  }, [dispatch]);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (creationMode === "parent" && !parentName.trim()) {
      return toast.error("Please enter a name for the parent item.");
    }
    if (creationMode === "child") {
      if (!selectedParentId)
        return toast.error("Please select a parent item first.");
      if (!childName.trim())
        return toast.error("Please enter a name for the sub-item.");
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: creationMode === "parent" ? parentName : childName,
        type: activeTab,
        parentId: creationMode === "child" ? selectedParentId : null,
        userId: user?.id,
      };
      await createTaxonomy(payload);

      toast.success(
        `Successfully added ${creationMode === "parent" ? "Parent" : "Sub-item"}!`,
      );
      if (activeTab === "categories") {
        dispatch(fetchCategories());
      } else {
        dispatch(fetchMenus());
      }

      // 5. Reset Inputs
      setParentName("");
      setChildName("");
      setSelectedParentId("");
    } catch (error) {
      toast.error(error.message || "Failed to save item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteTaxonomy(itemToDelete.id, activeTab);
      toast.success("Item deleted.");
      dispatch(activeTab === "categories" ? fetchCategories() : fetchMenus());
    } catch (error) {
      toast.error(error.message || error);
    } finally {
      setItemToDelete(null);
    }
  };

  const currentList = activeTab === "categories" ? category : menus;
  const isDataLoading = activeTab === "categories" ? loading : menuLoading;
  
  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FolderTree className="text-[#1a5a8a] h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800 leading-tight">
              Taxonomy Management
            </h2>
            <p className="text-sm text-gray-500">
              Organize your store's categories and navigation menus.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 flex items-center gap-1.5 bg-[#1a5a8a] rounded hover:opacity-50 text-sm text-white"
        >
          <ChevronLeft /> Back
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-px">
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === "categories"
              ? "bg-[#1a5a8a] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-transparent border-b-0"
          }`}
        >
          <LayoutList size={16} /> Product Categories
        </button>
        <button
          onClick={() => setActiveTab("menus")}
          className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === "menus"
              ? "bg-[#1a5a8a] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-transparent border-b-0"
          }`}
        >
          <FolderTree size={16} /> Navigation Menus
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Creation Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">
              Add New {activeTab === "categories" ? "Category" : "Menu"}
            </h3>

            {/* Mode Switcher (Parent vs Child) */}
            <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
              <button
                type="button"
                onClick={() => setCreationMode("parent")}
                className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  creationMode === "parent"
                    ? "bg-white text-[#1a5a8a] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Parent Level
              </button>
              <button
                type="button"
                onClick={() => setCreationMode("child")}
                className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  creationMode === "child"
                    ? "bg-white text-[#1a5a8a] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Sub-Level
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Parent Mode Fields */}
              {creationMode === "parent" && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Parent Name
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="e.g. Electronics"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#1a5a8a] transition-shadow"
                  />
                </div>
              )}

              {/* Child Mode Fields */}
              {creationMode === "child" && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Select Parent
                    </label>
                    <select
                      value={selectedParentId}
                      onChange={(e) => setSelectedParentId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#1a5a8a] transition-shadow bg-white cursor-pointer"
                    >
                      <option value="">-- Choose Parent --</option>
                      {currentList.map((item, idx) => (
                        <option
                          key={item.id || idx}
                          value={item.id || item.name}
                        >
                          {item.name || item.c_title || item}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Sub-item Name
                    </label>
                    <input
                      type="text"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="e.g. Laptops"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#1a5a8a] transition-shadow"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-4 py-2.5 rounded-lg text-white font-medium transition flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? "bg-[#1a5a8a]/70 cursor-not-allowed"
                    : "bg-[#1a5a8a] hover:bg-[#15486e] shadow-md"
                }`}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <FolderPlus size={18} />
                )}
                {isSubmitting ? "Saving..." : "Save to Database"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Hierarchy Display */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3 flex justify-between items-center">
              <span>Current Hierarchy</span>
              <span className="bg-[#1a5a8a]/10 text-[#1a5a8a] py-1 px-3 rounded-full text-xs">
                {currentList.length} Parents
              </span>
            </h3>

            {isDataLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Loader2 className="h-8 w-8 text-[#1a5a8a] animate-spin mb-3" />
                <p className="text-sm font-medium">Syncing database...</p>
              </div>
            ) : currentList.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <FolderTree className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No items found.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Use the panel on the left to create your first one.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentList.map((item, idx) => {
                  // Normalize data structure handling between simple strings and objects
                  const parentName =
                    typeof item === "string" ? item : item.name || item.c_title;
                  const subItems = item.submenus || item.subcategories || [];

                  return (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden hover:border-[#1a5a8a]/30 transition-colors"
                    >
                      {/* Parent Row */}
                      <div className="flex items-center justify-between p-3.5 bg-white">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#1a5a8a]/10 rounded-lg text-[#1a5a8a]">
                            <FolderTree size={18} />
                          </div>
                          <span className="font-bold text-gray-800">
                            {parentName}
                          </span>
                        </div>
                        <button onClick={() => setItemToDelete(item)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Children Rows */}
                      {subItems.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
                          {subItems.map((sub, subIdx) => (
                            <div
                              key={subIdx}
                              className="flex items-center justify-between py-2 pl-6 group"
                            >
                              <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <CornerDownRight
                                  size={14}
                                  className="text-gray-400"
                                />
                                <span className="font-medium">
                                  {typeof sub === "string"
                                    ? sub
                                    : sub.name || sub.c_title}
                                </span>
                              </div>
                              <button className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity p-1">
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <DeleteModal
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleDelete}
          title="Delete Item"
          message="Are you sure? This will remove the item and all its sub-items permanently."
        />
      </div>
    </div>
  );
};

export default CategoryManager;
