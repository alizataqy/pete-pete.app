"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/lib/encryption";

export interface UserBankData {
  id?: string;
  bankName: string;
  bankAccount: string;
  bankOwner: string;
  imageUrl?: string;
}

export async function getUserBanks(userId: string) {
  try {
    const banks = await prisma.userBank.findMany({
      where: { userId },
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
    const bank = await prisma.userBank.create({
      data: {
        userId,
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
    await prisma.userBank.delete({
      where: { id: bankId, userId },
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus bank:", error);
    return { success: false, error: "Gagal menghapus rekening bank" };
  }
}

export async function updateUserProfile(data: { userId: string; name: string; email: string; avatar?: string }) {
  try {
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser && existingUser.id !== data.userId) {
        return { success: false, error: "Email sudah digunakan oleh pengguna lain." };
      }
    }

    await prisma.user.update({
      where: { id: data.userId },
      data: {
        name: data.name,
        email: data.email,
        avatar: data.avatar,
      },
    });

    revalidatePath("/tongkrongan");
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Gagal memperbarui profil:", error);
    return { success: false, error: "Gagal memperbarui profil" };
  }
}
