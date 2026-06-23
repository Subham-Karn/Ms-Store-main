import React, { useEffect, useState } from "react";
import {
  Plus,
  Users,
  Search,
  Filter,
  UserCog,
  Loader2,
  X,
  User,
  Mail,
  Lock,
  Shield,
  Phone,
} from "lucide-react";
import { Dialog } from "@headlessui/react";
import toast from "react-hot-toast";
import {
  createUser,
  getAllUsers,
  manageUsers,
} from "../../services/authServices";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Loaders
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [banLoading, setBanLoading] = useState(false);
  const [unbanLoading, setUnbanLoading] = useState(false);
  const [roleUpdateLoading, setRoleUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Forms
  const [newRole, setNewRole] = useState("");
  const [errors, setErrors] = useState({});
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "+91",
    role: "customer",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await getAllUsers();
        if (res?.success === false) {
          toast.error(res.message || "Failed to fetch users");
        } else {
          setUsers(res || []);
        }
      } catch (error) {
        toast.error("An error occurred while fetching users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    let list = users || [];

    if (search) {
      const lowerSearch = search.toLowerCase();
      list = list.filter(
        (u) =>
          u?.email?.toLowerCase().includes(lowerSearch) ||
          u?.fullName?.toLowerCase().includes(lowerSearch),
      );
    }

    if (roleFilter !== "All") {
      list = list.filter((u) => u?.role === roleFilter);
    }

    setFiltered(list);
  }, [users, search, roleFilter]);

  const validateForm = () => {
    const newErrors = {};

    if (!newUser.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!newUser.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!newUser.password) {
      newErrors.password = "Password is required";
    } else if (newUser.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!newUser.phoneNumber || newUser.phoneNumber === "+91") {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+91\d{10}$/.test(newUser.phoneNumber)) {
      newErrors.phoneNumber = "Phone must be 10 digits starting with +91";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChanges = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field being typed in
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading2(true);
    try {
      const res = await createUser(newUser);
      if (res?.success) {
        toast.success(res.message || "User added successfully!");
        const addedUser = res?.user || res?.data?.user;
        if (addedUser) setUsers((prev) => [...prev, addedUser]);

        setIsAddModalOpen(false);
        setNewUser({
          fullName: "",
          email: "",
          password: "",
          phoneNumber: "+91",
          role: "customer",
        });
      } else {
        toast.error(res?.message || "Failed to add user");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading2(false);
    }
  };

  const manageUser = async (action) => {
    try {
      switch (action) {
        case "delete": {
          setDeleteLoading(true);
          const res = await manageUsers(
            selectedUser.id,
            "delete",
            selectedUser?.role,
          );
          if (res?.success !== false) {
            setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
            toast.success(res?.message || "User deleted");
            setIsManageModalOpen(false);
          } else {
            toast.error(res?.message || "Delete failed");
          }
          setDeleteLoading(false);
          break;
        }
        case "ban": {
          setBanLoading(true);
          const res = await manageUsers(
            selectedUser.id,
            "ban",
            selectedUser?.role,
          );
          if (res?.success !== false) {
            setUsers((prev) =>
              prev.map((u) =>
                u.id === selectedUser.id ? { ...u, status: "banned" } : u,
              ),
            );
            toast.success(res?.message || "User banned");
            setIsManageModalOpen(false);
          } else {
            toast.error(res?.message || "Ban failed");
          }
          setBanLoading(false);
          break;
        }
        case "unban": {
          setUnbanLoading(true);
          const res = await manageUsers(
            selectedUser.id,
            "unban",
            selectedUser?.role,
          );
          if (res?.success !== false) {
            setUsers((prev) =>
              prev.map((u) =>
                u.id === selectedUser.id ? { ...u, status: "active" } : u,
              ),
            );
            toast.success(res?.message || "User unbanned");
            setIsManageModalOpen(false);
          } else {
            toast.error(res?.message || "Unban failed");
          }
          setUnbanLoading(false);
          break;
        }
        case "updateRole": {
          if (!newRole) return toast.error("Please select a role");
          setRoleUpdateLoading(true);
          const res = await manageUsers(selectedUser.id, "updateRole", newRole);

          if (res?.success !== false) {
            setUsers((prev) =>
              prev.map((u) =>
                u.id === selectedUser.id ? { ...u, role: newRole } : u,
              ),
            );
            toast.success(res?.message || "Role updated");
            setIsManageModalOpen(false);
          } else {
            toast.error(res?.message || "Update failed");
          }

          setRoleUpdateLoading(false);
          break;
        }
        default:
          break;
      }
    } catch (error) {
      toast.error(error.message || error);
      setDeleteLoading(false);
      setBanLoading(false);
      setUnbanLoading(false);
      setRoleUpdateLoading(false);
    }
  };

  const openManageModal = (user) => {
    setSelectedUser(user);
    setNewRole(user?.role || "customer");
    setIsManageModalOpen(true);
  };

  function formatDateTime(isoString) {
    if (!isoString) return "N/A";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "N/A"; // Invalid date catch

      const pad = (num) => num.toString().padStart(2, "0");
      const day = pad(date.getDate());
      const month = pad(date.getMonth() + 1);
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = pad(date.getMinutes());
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;

      return `${day}-${month}-${year} ${pad(hours)}:${minutes} ${ampm}`;
    } catch (error) {
      return "N/A";
    }
  }

  // Safe Avatar Initial Generator
  const getInitials = (user) => {
    const name = user?.fullName || "";
    if (name) return name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <div className=" flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-800">
          <Users className="text-[#1a5a8a]" size={28} /> User Management
        </h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#1a5a8a] hover:bg-[#164874] text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors shadow-md"
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white shadow-sm border border-gray-100 rounded-lg p-4">
        <div className="relative flex items-center w-full md:w-1/2">
          <Search size={18} className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email"
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#1a5a8a]/30 transition-shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center border border-gray-200 rounded-md px-3 py-2 w-full md:w-auto bg-white focus-within:ring-2 focus-within:ring-[#1a5a8a]/30 transition-shadow">
          <Filter size={18} className="text-gray-400 mr-2" />
          <select
            className="outline-none bg-transparent w-full cursor-pointer text-gray-700"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-[#1a5a8a] h-10 w-10" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">
            No users found
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-[#1a5a8a]">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-white uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left font-semibold text-white uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left font-semibold text-white uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left font-semibold text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left font-semibold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((user, index) => (
                <tr
                  key={user.id || index}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                    {user?.fullName || "No Name"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {user?.email || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${
                        user?.role === "admin"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user?.role || "customer"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user?.status === "banned" ? (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-medium">
                        Banned
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => openManageModal(user)}
                      className="text-sm bg-[#1a5a8a] hover:bg-[#15476e] px-4 py-2 rounded-md text-white transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <UserCog size={16} /> Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Add User Modal ─── */}
      <Dialog
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Dialog.Panel className="bg-white rounded-3xl w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 bg-white">
              <Dialog.Title className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#1a5a8a]/10 flex items-center justify-center text-[#1a5a8a]">
                  <User size={16} />
                </span>
                Create New User
              </Dialog.Title>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-full bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 p-6 bg-gray-50/30"
            >
              {/* Full Name */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User size={12} /> Full Name
                </label>
                <input
                  onChange={handleChanges}
                  value={newUser.fullName}
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  className={`w-full px-4 py-2.5 text-sm bg-gray-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a5a8a]/20 transition-all ${
                    errors.fullName
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-[#1a5a8a]"
                  }`}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-[11px] font-medium mt-1.5 flex items-center gap-1">
                    <X size={10} />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail size={12} /> Email Address
                </label>
                <input
                  onChange={handleChanges}
                  value={newUser.email}
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  className={`w-full px-4 py-2.5 text-sm bg-gray-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a5a8a]/20 transition-all ${
                    errors.email
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-[#1a5a8a]"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-[11px] font-medium mt-1.5 flex items-center gap-1">
                    <X size={10} />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password & Role Row (Grid for compact spacing) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Lock size={12} /> Password
                  </label>
                  <input
                    onChange={handleChanges}
                    value={newUser.password}
                    name="password"
                    type="password"
                    placeholder="Min. 6 chars"
                    className={`w-full px-4 py-2.5 text-sm bg-gray-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a5a8a]/20 transition-all ${
                      errors.password
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-[#1a5a8a]"
                    }`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-[11px] font-medium mt-1.5 flex items-center gap-1">
                      <X size={10} />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Shield size={12} /> System Role
                  </label>
                  <select
                    name="role"
                    onChange={handleChanges}
                    value={newUser.role}
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a5a8a]/20 focus:border-[#1a5a8a] transition-all cursor-pointer"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone size={12} /> Phone Number
                </label>
                <input
                  onChange={handleChanges}
                  value={newUser.phoneNumber}
                  name="phoneNumber"
                  type="tel"
                  placeholder="+91 98765 43210"
                  className={`w-full px-4 py-2.5 text-sm bg-gray-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a5a8a]/20 transition-all ${
                    errors.phoneNumber
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-[#1a5a8a]"
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-[11px] font-medium mt-1.5 flex items-center gap-1">
                    <X size={10} />
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={loading2}
                  className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading2}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all ${
                    loading2
                      ? "bg-[#1a5a8a]/60 cursor-not-allowed"
                      : "bg-[#1a5a8a] hover:bg-[#15486e] shadow-lg shadow-[#1a5a8a]/20 hover:-translate-y-0.5"
                  }`}
                >
                  {loading2 ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />{" "}
                      Registering...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Manage User Modal */}
      {selectedUser && (
        <Dialog
          open={isManageModalOpen}
          onClose={() => setIsManageModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 animate-fade-in">
            <Dialog.Panel className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                <Dialog.Title className="text-lg font-bold text-gray-800">
                  Manage Identity
                </Dialog.Title>
                <button
                  onClick={() => setIsManageModalOpen(false)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* User Header */}
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-[#1a5a8a] text-white rounded-full flex items-center justify-center text-xl font-bold shadow-inner">
                    {getInitials(selectedUser)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">
                      {selectedUser?.fullName || "Unknown User"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedUser?.email || "No Email Associated"}
                    </p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-0.5">
                      Current Role
                    </p>
                    <p className="font-semibold text-gray-800 capitalize">
                      {selectedUser?.role || "customer"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-0.5">
                      System ID
                    </p>
                    <p
                      className="font-mono text-gray-800 truncate"
                      title={selectedUser?.id}
                    >
                      {selectedUser?.id || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-0.5">
                      Registered On
                    </p>
                    <p className="font-semibold text-gray-800">
                      {formatDateTime(selectedUser?.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Role Updater */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                    Transfer Access Role
                  </h4>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#1a5a8a] text-sm"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <button
                      onClick={() => manageUser("updateRole")}
                      disabled={roleUpdateLoading}
                      className="px-4 py-2 bg-[#1a5a8a] text-white text-sm font-medium rounded-lg hover:bg-[#164874] transition-colors disabled:bg-gray-400 min-w-[90px]"
                    >
                      {roleUpdateLoading ? (
                        <Loader2 size={16} className="animate-spin mx-auto" />
                      ) : (
                        "Update"
                      )}
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-4 border-t border-gray-100 flex gap-3">
                  {selectedUser?.status === "banned" ? (
                    <button
                      onClick={() => manageUser("unban")}
                      disabled={unbanLoading}
                      className="flex-1 px-4 py-2.5 bg-green-100 text-green-700 hover:bg-green-200 text-sm font-medium rounded-lg transition-colors flex justify-center items-center"
                    >
                      {unbanLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        "Restore Access"
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => manageUser("ban")}
                      disabled={banLoading}
                      className="flex-1 px-4 py-2.5 text-orange-700 bg-orange-100 hover:bg-orange-200 text-sm font-medium rounded-lg transition-colors flex justify-center items-center"
                    >
                      {banLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        "Suspend Account"
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => manageUser("delete")}
                    disabled={deleteLoading}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex justify-center items-center"
                  >
                    {deleteLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Delete Identity"
                    )}
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default UserManagement;
