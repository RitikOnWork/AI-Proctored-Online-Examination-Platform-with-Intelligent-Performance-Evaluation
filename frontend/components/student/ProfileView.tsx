"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Shield, Building, Award, Calendar, BookOpen, Key, Loader2 } from "lucide-react";
import { useStudentProfile, useUpdateProfileMutation, useChangePasswordMutation } from "@/hooks/useStudent";
import { cn } from "@/lib/utils";

export default function ProfileView() {
  const { data: profile, isLoading } = useStudentProfile();
  
  const updateProfileMutation = useUpdateProfileMutation();
  const changePasswordMutation = useChangePasswordMutation();

  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Populate inputs when profile loads
  useEffect(() => {
    if (profile) {
      setNameInput(profile.full_name);
      setEmailInput(profile.email);
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setProfileErrorMsg("");

    try {
      await updateProfileMutation.mutateAsync({
        full_name: nameInput,
        email: emailInput,
      });
      setSuccessMsg("Profile details updated successfully!");
    } catch (err: any) {
      setProfileErrorMsg(err.response?.data?.detail || "Failed to update profile details.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.response?.data?.detail || "Failed to update password. Verify current password.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-muted-foreground bg-card border border-border/40 rounded-2xl flex items-center justify-center gap-2">
        <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        Loading profile metadata...
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-foreground">Student Profile</h2>
        <p className="text-xs text-muted-foreground mt-0.5 font-medium">Manage your credentials and enrollment details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Summary & Details */}
        <div className="lg:col-span-4 bg-card border border-border/40 rounded-2xl p-6 space-y-6 shadow-sm text-center">
          {/* Avatar and name */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-2xl shadow-lg shadow-primary/25">
              {profile.full_name[0]?.toUpperCase() || "R"}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground">{profile.full_name}</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase font-mono bg-muted/40 px-2 py-0.5 rounded-full border border-border/10">
                {profile.rollNumber || "CS/2026/042"}
              </p>
            </div>
          </div>

          {/* Institutional details list */}
          <div className="space-y-3.5 pt-4 border-t border-border/20 text-xs">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Building className="w-4.5 h-4.5 text-primary shrink-0" />
              <span className="truncate text-foreground font-semibold">{profile.college || "Infosys Springboard Institute"}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <BookOpen className="w-4.5 h-4.5 text-primary shrink-0" />
              <span className="truncate text-foreground font-medium">{profile.branch || "Computer Science & Engineering"}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="w-4.5 h-4.5 text-primary shrink-0" />
              <span className="text-foreground font-medium">{profile.semester || "6th Semester"}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="w-4.5 h-4.5 text-primary shrink-0" />
              <span className="truncate text-foreground font-medium">{profile.email}</span>
            </div>
          </div>
        </div>

        {/* Right Tab panel: Edit Info & Password resets */}
        <div className="lg:col-span-8 space-y-6">
          {/* Update Info Form */}
          <div className="bg-card border border-border/40 rounded-2xl p-5 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="w-4.5 h-4.5 text-primary" /> Edit Personal Information
            </h4>

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-semibold">
                {successMsg}
              </div>
            )}
            {profileErrorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold">
                {profileErrorMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Full Name</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-muted/20 border border-border/40 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Email Address</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-muted/20 border border-border/40 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/95 disabled:opacity-50 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {updateProfileMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Information
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-card border border-border/40 rounded-2xl p-5 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4.5 h-4.5 text-primary" /> Update Security Credentials
            </h4>

            {passwordError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-semibold">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-muted/20 border border-border/40 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-muted/20 border border-border/40 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-muted/20 border border-border/40 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/95 disabled:opacity-50 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {changePasswordMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
