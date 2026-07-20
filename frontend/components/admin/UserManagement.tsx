"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Edit2, Trash2, KeyRound, X,
  Loader2, GraduationCap, UserCheck, ShieldCheck,
  CheckCircle2, AlertCircle, Eye, EyeOff
} from "lucide-react";
import { userService, UserResponse } from "@/services/user";

interface UserManagementProps {
  roleFilter?: "student" | "examiner" | "admin";
}

export default function UserManagement({ roleFilter }: UserManagementProps) {
  // Lists & Loading
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Alerts & Notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

  // Forms state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"admin" | "examiner" | "student">("student");
  const [isActive, setIsActive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers({
        role: roleFilter,
        search: searchQuery
      });
      setUsers(data);
      setCurrentPage(1);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchQuery]);

  // Show auto-dismiss toast
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Open Modals & Reset Form fields
  const openCreateModal = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setRole(roleFilter || "student");
    setIsActive(true);
    setModalError(null);
    setShowPassword(false);
    setIsCreateOpen(true);
  };

  const openEditModal = (user: UserResponse) => {
    setSelectedUser(user);
    setFullName(user.full_name);
    setEmail(user.email);
    setRole(user.role);
    setIsActive(user.is_active);
    setModalError(null);
    setIsEditOpen(true);
  };

  const openResetModal = (user: UserResponse) => {
    setSelectedUser(user);
    setPassword("");
    setConfirmPassword("");
    setModalError(null);
    setShowPassword(false);
    setIsResetOpen(true);
  };

  const openDeleteModal = (user: UserResponse) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  // Handle Create User Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!fullName || !email || !password) {
      setModalError("All fields are required");
      return;
    }
    if (password.length < 8) {
      setModalError("Password must be at least 8 characters");
      return;
    }

    setActionLoading(true);
    try {
      await userService.createUser({
        full_name: fullName,
        email,
        password,
        role,
        is_active: isActive
      });
      showToast(`User ${fullName} created successfully`);
      setIsCreateOpen(false);
      fetchUsers();
    } catch (err: any) {
      setModalError(err?.response?.data?.detail || "Failed to create user");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Edit User Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!selectedUser) return;
    if (!fullName || !email) {
      setModalError("Name and Email are required");
      return;
    }

    setActionLoading(true);
    try {
      await userService.updateUser(selectedUser.id, {
        full_name: fullName,
        email,
        role,
        is_active: isActive
      });
      showToast(`User details updated successfully`);
      setIsEditOpen(false);
      fetchUsers();
    } catch (err: any) {
      setModalError(err?.response?.data?.detail || "Failed to update user");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!selectedUser) return;
    if (!password || !confirmPassword) {
      setModalError("Password fields are required");
      return;
    }
    if (password !== confirmPassword) {
      setModalError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setModalError("Password must be at least 8 characters");
      return;
    }

    setActionLoading(true);
    try {
      await userService.updateUser(selectedUser.id, { password });
      showToast(`Password reset successfully for ${selectedUser.full_name}`);
      setIsResetOpen(false);
    } catch (err: any) {
      setModalError(err?.response?.data?.detail || "Failed to reset password");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Toggle Active/Inactive Quick Action
  const handleToggleStatus = async (user: UserResponse) => {
    try {
      const nextStatus = !user.is_active;
      await userService.updateUser(user.id, { is_active: nextStatus });
      showToast(`User account ${nextStatus ? "activated" : "deactivated"}`);
      fetchUsers();
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Failed to update status", "error");
    }
  };

  // Handle Delete User Submit
  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await userService.deleteUser(selectedUser.id);
      showToast(`User account deleted successfully`);
      setIsDeleteOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Failed to delete user", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Role details helper
  const getRoleConfig = (role: "admin" | "examiner" | "student") => {
    switch (role) {
      case "admin":
        return {
          label: "Admin",
          icon: ShieldCheck,
          bg: "bg-red-500/10 text-red-500 border-red-500/20",
          avatar: "from-red-500/60 to-rose-600/60"
        };
      case "examiner":
        return {
          label: "Examiner",
          icon: UserCheck,
          bg: "bg-teal-500/10 text-teal-500 border-teal-500/20",
          avatar: "from-teal-500/60 to-emerald-600/60"
        };
      case "student":
        return {
          label: "Student",
          icon: GraduationCap,
          bg: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
          avatar: "from-indigo-500/60 to-purple-600/60"
        };
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const pagedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getRoleDisplayName = () => {
    if (!roleFilter) return "User Directory";
    return `${roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}s Directory`;
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-xl ${
              toast.type === "success"
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/15 text-rose-400 border-rose-500/20"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="text-xs font-semibold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Add Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{getRoleDisplayName()}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user accounts, roles, login credentials, and account active states.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add User
        </motion.button>
      </div>

      {/* Main Glassmorphic Wrapper */}
      <div className="bg-card/75 border border-border/40 rounded-2xl overflow-hidden shadow-sm backdrop-blur-md">
        {/* Table Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-border/40">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by full name or email address..."
              className="w-full pl-9 pr-4 py-2 bg-muted/30 border border-border/40 rounded-xl text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
            />
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-muted/40 border border-border/40 rounded-xl text-xs text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3m0 0l3 3m-3-3v12" />
              </svg>
            )}
            Refresh
          </button>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border/40 bg-muted/10">
              <tr>
                <th className="px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">User Details</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Email Address</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">System Role</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Active Status</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span>Loading directories...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-rose-500 font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-6 h-6" />
                      <span>{error}</span>
                    </div>
                  </td>
                </tr>
              ) : pagedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-muted-foreground">
                    No matching accounts found.
                  </td>
                </tr>
              ) : (
                pagedUsers.map((user, idx) => {
                  const roleConfig = getRoleConfig(user.role);
                  const Icon = roleConfig.icon;
                  const initials = user.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${roleConfig.avatar} flex items-center justify-center text-[10px] font-bold text-primary-foreground flex-shrink-0 shadow-inner`}>
                            {initials}
                          </div>
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {user.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground font-mono">{user.email}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${roleConfig.bg}`}>
                          <Icon className="w-3 h-3" />
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                            user.is_active ? "bg-emerald-500" : "bg-muted-foreground/30"
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              user.is_active ? "translate-x-4.5" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button
                            title="Reset Password"
                            onClick={() => openResetModal(user)}
                            className="p-1.5 rounded-lg border border-border/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Edit User"
                            onClick={() => openEditModal(user)}
                            className="p-1.5 rounded-lg border border-border/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete User"
                            onClick={() => openDeleteModal(user)}
                            className="p-1.5 rounded-lg border border-border/40 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-border/40 bg-muted/5">
            <span className="text-xs text-muted-foreground">
              Showing {pagedUsers.length} of {users.length} records
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1.5 rounded-xl text-xs border border-border/40 bg-muted/20 text-muted-foreground disabled:opacity-40 disabled:pointer-events-none hover:bg-muted transition-all"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    currentPage === i + 1
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "border-transparent text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1.5 rounded-xl text-xs border border-border/40 bg-muted/20 text-muted-foreground disabled:opacity-40 disabled:pointer-events-none hover:bg-muted transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AnimatePresence for Action Modals */}
      <AnimatePresence>
        {/* CREATE MODAL */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Modal Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsCreateOpen(false)}
            />
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative w-full max-w-md p-6 bg-card border border-border/40 rounded-2xl shadow-xl z-10 space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="text-sm font-bold text-foreground">Create User Account</h3>
                <button onClick={() => setIsCreateOpen(false)} className="p-1 rounded-lg hover:bg-muted transition-all">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {modalError && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter user's full name"
                    className="w-full px-3 py-2.5 bg-muted/20 border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted-foreground">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2.5 bg-muted/20 border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted-foreground">Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-muted/20 border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                  >
                    <option value="student">Student</option>
                    <option value="examiner">Examiner</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted-foreground">Initial Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full pl-3 pr-10 py-2.5 bg-muted/20 border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground transition-all"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/40 rounded-xl">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">Activate Account</p>
                    <p className="text-[10px] text-muted-foreground">Allow login immediately after creation</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-5.5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                      isActive ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isActive ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 border border-border/40 rounded-xl text-muted-foreground hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 transition-all disabled:opacity-50"
                  >
                    {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Create Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* EDIT MODAL */}
        {isEditOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsEditOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative w-full max-w-md p-6 bg-card border border-border/40 rounded-2xl shadow-xl z-10 space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="text-sm font-bold text-foreground">Edit Account Details</h3>
                <button onClick={() => setIsEditOpen(false)} className="p-1 rounded-lg hover:bg-muted transition-all">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {modalError && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter user's full name"
                    className="w-full px-3 py-2.5 bg-muted/20 border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted-foreground">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2.5 bg-muted/20 border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted-foreground">Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-muted/20 border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                  >
                    <option value="student">Student</option>
                    <option value="examiner">Examiner</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/40 rounded-xl">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">Active Status</p>
                    <p className="text-[10px] text-muted-foreground">Allow login and exam registration</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-5.5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                      isActive ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isActive ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 border border-border/40 rounded-xl text-muted-foreground hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 transition-all disabled:opacity-50"
                  >
                    {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* RESET PASSWORD MODAL */}
        {isResetOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsResetOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative w-full max-w-md p-6 bg-card border border-border/40 rounded-2xl shadow-xl z-10 space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Reset User Password</h3>
                </div>
                <button onClick={() => setIsResetOpen(false)} className="p-1 rounded-lg hover:bg-muted transition-all">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Resetting password for account <strong className="text-foreground">{selectedUser.email}</strong> ({selectedUser.full_name}).
              </p>

              {modalError && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full pl-3 pr-10 py-2.5 bg-muted/20 border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground transition-all"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted-foreground">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Verify new password"
                    className="w-full px-3 py-2.5 bg-muted/20 border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                  <button
                    type="button"
                    onClick={() => setIsResetOpen(false)}
                    className="px-4 py-2 border border-border/40 rounded-xl text-muted-foreground hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 transition-all disabled:opacity-50"
                  >
                    {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Reset Password
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* DELETE MODAL */}
        {isDeleteOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsDeleteOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative w-full max-w-sm p-6 bg-card border border-border/40 rounded-2xl shadow-xl z-10 space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">Delete Account</h3>
                <p className="text-xs text-muted-foreground leading-relaxed px-2">
                  Are you sure you want to delete <strong className="text-foreground">{selectedUser.full_name}</strong>? This action will disable their account login and soft-delete their database profile.
                </p>
              </div>

              <div className="flex justify-center gap-2 pt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 border border-border/40 rounded-xl text-muted-foreground hover:bg-muted text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSubmit}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-destructive text-destructive-foreground font-semibold rounded-xl hover:bg-destructive/95 text-xs transition-all disabled:opacity-50"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Delete Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
