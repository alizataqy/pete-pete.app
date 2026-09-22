"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { updateUserProfile, UserBankData } from "@/app/actions/profile";
import { authClient } from "@/lib/auth-client";
import { ArrowLeft, Plus, Wallet03 } from "@untitledui/icons";
import { toast } from "sonner";

import { Avatar } from "@/components/base/avatar/avatar";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  banks: UserBankData[];
}

interface ProfileFormProps {
  initialData: ProfileData;
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  // Profile states
  const [name, setName] = useState(initialData.name);
  const [email, setEmail] = useState(initialData.email);
  const [avatar, setAvatar] = useState(initialData.avatar);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Bank states
  const [banks] = useState<UserBankData[]>(initialData.banks);

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(false);

    try {
      const res = await updateUserProfile({
        userId: initialData.id,
        name,
        email,
        avatar,
      });

      if (res.success) {
        // Sinkronkan data profil ke session cookie better-auth secara client-side
        await authClient.updateUser({
          name,
        });

        setProfileSuccess(true);
        toast.success("Profil berhasil diperbarui!");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal memperbarui profil.");
      }
    } catch (err) {
      console.log(err);
      toast.error("Terjadi kesalahan server saat memperbarui profil.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Kata sandi baru minimal harus 6 karakter.");
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await authClient.changePassword({
        newPassword,
        currentPassword,
        revokeOtherSessions: true,
      });

      if (res.error) {
        toast.error(res.error.message || "Gagal mengubah kata sandi.");
      } else {
        setPasswordSuccess(true);
        toast.success("Kata sandi berhasil diperbarui!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.log(err);
      toast.error("Terjadi kesalahan saat mengubah kata sandi.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Header */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/90 backdrop-blur-md border-b border-secondary-800 px-4 flex items-center gap-3">
        <Button
          onPress={() => router.push("/tongkrongan")}
          color="primary"
          size="sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-sm font-extrabold text-text-50">Profil lo</h1>
          <p className="text-[10px] text-text-300 mt-0.5">Atur akun &amp; info rekening lo</p>
        </div>
      </header>

      {/* Scrollable Body */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">

        {/* Card 1: Informasi Profil */}
        <div className="p-4 rounded-xl border border-secondary-800 bg-text-900/60 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-text-100 uppercase tracking-wider">Info Akun</h3>
            <p className="text-[10px] text-text-300 mt-0.5">Ubah nama dan alamat email login lo.</p>
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col gap-2 items-center mt-4 ">
              <Avatar
                size="2xl"
                src={avatar ? `https://api.dicebear.com/9.x/dylan/svg?seed=${encodeURIComponent(avatar)}` : undefined}
                alt={name}
                className="shadow-lg border-2 border-secondary-800"
              />
              <Button
                type="button"
                onPress={() => {
                  const newSeed = Math.random().toString(36).substring(7);
                  setAvatar(newSeed);
                }}
                color="secondary"
                className="text-[10px] py-1 px-3 mt-1.5"
              >
                Acak Avatar
              </Button>
            </div>

            <div className="flex-1">

              <form onSubmit={handleUpdateProfile} className="space-y-3.5">
                <Input
                  label="Nama lo"
                  isRequired
                  type="text"
                  value={name}
                  onChange={setName}
                  placeholder="Nama lengkap atau panggilan"
                  size="sm"
                />

                <Input
                  label="Alamat Email"
                  isRequired
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="nama@email.com"
                  size="sm"
                  autoComplete="off"
                />

                <Button
                  type="submit"
                  isDisabled={profileLoading || profileSuccess}
                  isLoading={profileLoading}
                  className="w-full py-2.5 text-white text-xs"
                >
                  Simpan
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Card 2: Wallet Summary Block with Lihat Semua button */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-secondary-800 bg-text-900/60 space-y-3">
            <div className="flex flex-row flex-nowrap items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary-900/40 border border-primary-800 flex items-center justify-center shrink-0">
                  <Wallet03 className="w-5 h-5 text-primary-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-50 truncate">{banks.length} Wallet</p>
                  <p className="text-[10px] text-text-300 truncate">
                    {banks.filter((b: UserBankData) => !["GoPay", "OVO", "Dana", "QRIS"].includes(b.bankName)).length} Bank
                    {" "}&bull;{" "}
                    {banks.filter((b: UserBankData) => ["GoPay", "OVO", "Dana"].includes(b.bankName)).length} E-Wallet
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onPress={() => router.push("/profile/banks/new")}
                iconLeading={<Plus className="w-4 h-4 " />}
                className="text-xs py-1.5 px-3"
                color='primary'
              >
                Tambah Bank
              </Button>
            </div>

            {banks.length > 0 && (
              <div className="border-t border-secondary-800/60 pt-3">
                <Button
                  onPress={() => router.push("/profile/banks")}
                  className="w-full py-2.5 px-4 text-xs"
                  color='primary'
                >
                  Lihat Semua Wallet
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Ubah Kata Sandi */}
        <div className="p-4 rounded-xl border border-secondary-800 bg-text-900/60 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-text-100 uppercase tracking-wider">Ganti Password</h3>
            <p className="text-[10px] text-text-300 mt-0.5">Jangan lupa ganti password secara berkala biar aman.</p>
          </div>

          {passwordSuccess && (
            <div className="p-2.5 text-[10px] text-emerald-300 bg-emerald-950 border border-emerald-800 rounded-lg">
              Password udah diganti!
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3.5">
            <Input
              label="Password lama"
              isRequired
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Masukin password lama lo"
              size="sm"
            />

            <Input
              label="Password baru"
              isRequired
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Minimal 6 karakter ya"
              size="sm"
            />

            <Input
              label="Ulangi password baru"
              isRequired
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Ketik ulang password barunya"
              size="sm"
            />

            <Button
              type="submit"
              isDisabled={passwordLoading || passwordSuccess}
              isLoading={passwordLoading}
              className="w-full text-xs"
              size="sm"
              color="primary"
            >
              Ganti Password
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
}
