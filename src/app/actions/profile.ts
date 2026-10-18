"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/lib/encryption";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export interface UserBankData {
  id?: string;
  bankName: string;
  bankAccount: string;
  bankOwner: string;
  imageUrl?: string;
}

export async function getUserBanks(userId?: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return { success: false, error: "Lo belum login nih, Bos." };
    }
    const targetUserId = session.user.id;
    if (userId && userId !== targetUserId) {
      return { success: false, error: "Gak ada izin akses rekening user lain." };
    }

    const banks = await prisma.userBank.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: "asc" },
    });
    return {
      success: true,
      banks: banks.map((b) => ({
        id: b.id,
        bankName: b.bankName,
        bankAccount: decrypt(b.bankAccount),
        bankOwner: b.bankOwner,
        imageUrl: b.imageUrl || undefined,
      })),
    };
  } catch (error) {
    console.error("Gagal mengambil daftar bank:", error);
    return { success: false, error: "Gagal mengambil daftar bank" };
  }
}

export async function addUserBank(userId: string, data: Omit<UserBankData, "id">) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return { success: false, error: "Lo belum login nih, Bos." };
    }
    const targetUserId = session.user.id;

    const bank = await prisma.userBank.create({
      data: {
        userId: targetUserId,
        bankName: data.bankName,
        bankAccount: encrypt(data.bankAccount),
        bankOwner: data.bankOwner,
        imageUrl: data.imageUrl || null,
      },
    });
    revalidatePath("/profile");
    return { success: true, bankId: bank.id };
  } catch (error) {
    console.error("Gagal menambahkan bank:", error);
    return { success: false, error: "Gagal menambahkan rekening bank baru" };
  }
}

export async function deleteUserBank(userId: string, bankId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return { success: false, error: "Lo belum login nih, Bos." };
    }
    const targetUserId = session.user.id;

    await prisma.userBank.delete({
      where: { id: bankId, userId: targetUserId },
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus bank:", error);
    return { success: false, error: "Gagal menghapus rekening bank" };
  }
}

export async function getUserAvatar(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });
    return { success: true, avatar: user?.avatar || null };
  } catch (error) {
    console.error("Gagal mengambil avatar user:", error);
    return { success: false, avatar: null };
  }
}

export async function updateUserProfile(data: { userId: string; name: string; email: string; avatar?: string }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return { success: false, error: "Lo belum login nih, Bos." };
    }

    if (session.user.id !== data.userId) {
      return { success: false, error: "Gak ada izin buat ubah profil akun ini." };
    }

    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser && existingUser.id !== session.user.id) {
        return { success: false, error: "Email sudah digunakan oleh pengguna lain." };
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        email: data.email,
        avatar: data.avatar,
      },
    });

    revalidatePath("/tongkrongan");
    revalidatePath("/profile");
    revalidatePath("/agenda", "layout");
    revalidatePath("/pete-pete", "layout");
    revalidatePath("/bon", "layout");
    return { success: true };
  } catch (error) {
    console.error("Gagal memperbarui profil:", error);
    return { success: false, error: "Gagal memperbarui profil" };
  }
}
