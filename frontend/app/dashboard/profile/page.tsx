"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "../../context";
import api from "../../../lib/api";

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch("/user/profile", {
        name,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      updateUser({ ...user, name: data.user.name });
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-medium mb-1">Profile</h1>
      <p className="text-sm text-gray-500 mb-5">Manage your account and plan</p>

      <div className="bg-surface-1 rounded-2xl p-5 shadow-md mb-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-800 flex items-center justify-center font-medium">
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface-1 rounded-2xl p-5 shadow-md mb-3 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium">Free plan</p>
          <p className="text-xs text-gray-400">{user.credits} credits remaining</p>
        </div>
        <button className="bg-brand-400 text-white rounded-xl px-4">Upgrade to Pro</button>
      </div>

      <form onSubmit={handleSave} className="bg-surface-1 rounded-2xl p-5 shadow-md mb-3">
        <p className="text-sm font-medium mb-4">Edit profile</p>

        <label className="text-xs text-gray-500">Full name</label>
        <input className="w-full rounded-xl mt-1 mb-4" value={name} onChange={(e) => setName(e.target.value)} />

        <p className="text-xs text-gray-400 mb-2">Change password (optional)</p>
        <label className="text-xs text-gray-500">Current password</label>
        <input
          type="password"
          className="w-full rounded-xl mt-1 mb-3"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Leave blank to keep current password"
        />
        <label className="text-xs text-gray-500">New password</label>
        <input
          type="password"
          className="w-full rounded-xl mt-1 mb-4"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button disabled={saving} className="bg-brand-400 text-white rounded-xl px-5">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <button onClick={handleLogout} className="text-sm text-red-500 mt-2">
        Log out
      </button>
    </div>
  );
}
