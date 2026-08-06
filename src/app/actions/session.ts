"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { encrypt } from "@/lib/encryption";

interface CreateSessionData {
  title: string;
  description?: string;
  merchantName?: string;
  totalAmount: number;
  taxAmount?: number;
  tipAmount?: number;
  userId?: string;
  bankName?: string;
  bankAccount?: string;
  bankOwner?: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

// Action untuk membuat sesi split bill baru beserta item-item hasil OCR
export async function createBillSession(data: CreateSessionData) {
  try {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Ambil info rekening dari profil user pembuat sesi
    let firstBank = null;
    if (data.userId) {
      const creator = await prisma.user.findUnique({
        where: { id: data.userId },
        select: {
          banks: {
            select: {
              bankName: true,
              bankAccount: true,
              bankOwner: true,
            },
            take: 1,
          },
        },
      });
      firstBank = creator?.banks?.[0];
    }

    const session = await prisma.billSession.create({
      data: {
        title: data.title,
        description: data.description,
        merchantName: data.merchantName,
        totalAmount: data.totalAmount,
        taxAmount: data.taxAmount || 0,
        tipAmount: data.tipAmount || 0,
        inviteCode,
        userId: data.userId || null,
        bankName: data.bankName || firstBank?.bankName,
        bankAccount: data.bankAccount ? encrypt(data.bankAccount) : firstBank?.bankAccount,
        bankOwner: data.bankOwner || firstBank?.bankOwner,
        // Sekaligus buat item-item tagihan
        items: {
          create: data.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
        // Otomatis tambahkan pembuat (organizer) sebagai anggota sesi pertama
        members: {
          create: {
            name: "Saya (Owner)",
            shareAmount: 0,
            userId: data.userId || null,
          },
        },
      },
      include: {
        items: true,
        members: true,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, session: { id: session.id } };
  } catch (error) {
    console.error("Gagal membuat sesi:", error);
    const message = error instanceof Error ? error.message : "Gagal membuat sesi PETE-PETE";
    return { success: false, error: message };
  }
}

// Action untuk menambahkan member/anggota baru ke sesi patungan
export async function addSessionMember(sessionId: string, name: string) {
  try {
    const member = await prisma.billMember.create({
      data: {
        name,
        sessionId,
        shareAmount: 0,
      },
    });
    revalidatePath(`/pete-pete/${sessionId}/split`);
    return {
      success: true,
      member: {
        id: member.id,
        name: member.name,
        shareAmount: Number(member.shareAmount)
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menambahkan anggota";
    return { success: false, error: message };
  }
}

// Action untuk menghapus member/anggota dari sesi
export async function removeSessionMember(memberId: string, sessionId: string) {
  try {
    // Hapus semua alokasi item untuk member ini terlebih dahulu
    await prisma.itemAllocation.deleteMany({
      where: { memberId },
    });

    await prisma.billMember.delete({
      where: { id: memberId },
    });

    revalidatePath(`/pete-pete/${sessionId}/split`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghapus anggota";
    return { success: false, error: message };
  }
}

// Action untuk menyimpan hasil alokasi item pembagian tagihan secara real-time
export async function saveAllocations(
  sessionId: string,
  allocations: { itemId: string; memberId: string; quantity: number; fraction: number }[]
) {
  try {
    // Hapus alokasi lama pada sesi ini
    const itemIds = allocations.map((a) => a.itemId);
    await prisma.itemAllocation.deleteMany({
      where: {
        itemId: { in: itemIds },
      },
    });

    // Simpan alokasi baru
    if (allocations.length > 0) {
      await prisma.itemAllocation.createMany({
        data: allocations.map((a) => ({
          itemId: a.itemId,
          memberId: a.memberId,
          quantity: a.quantity,
          splitFraction: a.fraction,
        })),
      });
    }

    // Hitung ulang shareAmount per member secara real-time
    await recalculateSessionShares(sessionId);

    revalidatePath(`/pete-pete/${sessionId}/split`);
    return { success: true };
  } catch (error) {
    console.error("Gagal menyimpan alokasi:", error);
    const message = error instanceof Error ? error.message : "Gagal memproses pembagian tagihan";
    return { success: false, error: message };
  }
}

// Helper modular untuk menghitung ulang tagihan per member secara real-time
export async function recalculateSessionShares(sessionId: string) {
  const session = await prisma.billSession.findUnique({
    where: { id: sessionId },
    include: {
      items: {
        include: {
          allocations: true,
        },
      },
      members: {
        include: {
          allocations: true,
        },
      },
    },
  });

  if (!session) throw new Error("Sesi tidak ditemukan");

  // Hitung cost dasar per member dari alokasi item
  const memberSubtotals: Record<string, number> = {};
  session.members.forEach((m) => {
    memberSubtotals[m.id] = 0;
  });

  session.items.forEach((item) => {
    const allocs = item.allocations;
    if (allocs.length === 0) return; // Belum dialokasikan

    // Total unit teralokasi (bisa pecahan jika dibagi bersama)
    const totalAllocatedUnits = allocs.reduce((acc, a) => acc + Number(a.splitFraction), 0);

    allocs.forEach((a) => {
      // Porsi harga item untuk member ini
      const itemShare = (Number(a.splitFraction) / totalAllocatedUnits) * Number(item.totalPrice);
      memberSubtotals[a.memberId] = (memberSubtotals[a.memberId] || 0) + itemShare;
    });
  });

  // Hitung proporsi pajak & tips secara adil berdasarkan subtotal belanjaan
  const totalSubtotal = Object.values(memberSubtotals).reduce((a, b) => a + b, 0);
  const taxAndTipsRatio =
    totalSubtotal > 0
      ? (Number(session.taxAmount) + Number(session.tipAmount)) / totalSubtotal
      : 0;

  // Update shareAmount di database untuk masing-masing member
  for (const member of session.members) {
    const subtotal = memberSubtotals[member.id] || 0;
    const shareAmount = subtotal + subtotal * taxAndTipsRatio;

    await prisma.billMember.update({
      where: { id: member.id },
      data: {
        shareAmount: Math.round(shareAmount),
      },
    });
  }
}

// Action untuk menambahkan item belanja manual baru
export async function addSessionItem(sessionId: string, name: string, quantity: number, unitPrice: number) {
  try {
    const totalPrice = quantity * unitPrice;
    await prisma.billItem.create({
      data: {
        name,
        quantity,
        unitPrice,
        totalPrice,
        sessionId,
      },
    });

    // Perbarui total tagihan sesi
    const items = await prisma.billItem.findMany({ where: { sessionId } });
    const subtotal = items.reduce((acc, item) => acc + Number(item.totalPrice), 0);
    const session = await prisma.billSession.findUnique({ where: { id: sessionId } });
    if (session) {
      const totalAmount = subtotal + Number(session.taxAmount) + Number(session.tipAmount);
      await prisma.billSession.update({
        where: { id: sessionId },
        data: { totalAmount },
      });
    }

    await recalculateSessionShares(sessionId);
    revalidatePath(`/pete-pete/${sessionId}/split`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menambahkan item secara manual";
    return { success: false, error: message };
  }
}

// Action untuk mengubah/mengedit item belanjaan
export async function updateSessionItem(itemId: string, sessionId: string, name: string, quantity: number, unitPrice: number) {
  try {
    const totalPrice = quantity * unitPrice;
    await prisma.billItem.update({
      where: { id: itemId },
      data: {
        name,
        quantity,
        unitPrice,
        totalPrice,
      },
    });

    // Perbarui total tagihan sesi
    const items = await prisma.billItem.findMany({ where: { sessionId } });
    const subtotal = items.reduce((acc, item) => acc + Number(item.totalPrice), 0);
    const session = await prisma.billSession.findUnique({ where: { id: sessionId } });
    if (session) {
      const totalAmount = subtotal + Number(session.taxAmount) + Number(session.tipAmount);
      await prisma.billSession.update({
        where: { id: sessionId },
        data: { totalAmount },
      });
    }

    await recalculateSessionShares(sessionId);
    revalidatePath(`/pete-pete/${sessionId}/split`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengubah item";
    return { success: false, error: message };
  }
}

// Action untuk menghapus item belanjaan
export async function deleteSessionItem(itemId: string, sessionId: string) {
  try {
    // Hapus alokasi terlebih dahulu
    await prisma.itemAllocation.deleteMany({ where: { itemId } });
    // Hapus item
    await prisma.billItem.delete({ where: { id: itemId } });

    // Perbarui total tagihan sesi
    const items = await prisma.billItem.findMany({ where: { sessionId } });
    const subtotal = items.reduce((acc, item) => acc + Number(item.totalPrice), 0);
    const session = await prisma.billSession.findUnique({ where: { id: sessionId } });
    if (session) {
      const totalAmount = subtotal + Number(session.taxAmount) + Number(session.tipAmount);
      await prisma.billSession.update({
        where: { id: sessionId },
        data: { totalAmount },
      });
    }

    await recalculateSessionShares(sessionId);
    revalidatePath(`/pete-pete/${sessionId}/split`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghapus item";
    return { success: false, error: message };
  }
}

// Action untuk bergabung ke sesi patungan menggunakan invite code
export async function joinSessionByCode(inviteCode: string, userId: string, userName: string) {
  try {
    const session = await prisma.billSession.findUnique({
      where: { inviteCode: inviteCode.trim().toUpperCase() },
      include: {
        members: true,
      },
    });

    if (!session) {
      return { success: false, error: "Sesi PETE-PETE tidak ditemukan. Periksa kembali kode Anda." };
    }

    // Periksa apakah user sudah terdaftar di sesi ini (misal berdasarkan userId atau nama yang sama)
    const existingMember = session.members.find(
      (m) => m.userId === userId || m.name.toLowerCase() === userName.toLowerCase()
    );

    if (existingMember) {
      // Jika sudah ada, tinggal kembalikan success dan id sesi
      if (!existingMember.userId) {
        // Link userId jika sebelumnya diinput manual tapi sekarang login
        await prisma.billMember.update({
          where: { id: existingMember.id },
          data: { userId },
        });
      }
      return { success: true, sessionId: session.id };
    }

    // Jika belum ada, buat member baru untuk user ini
    await prisma.billMember.create({
      data: {
        name: userName,
        sessionId: session.id,
        userId: userId,
        shareAmount: 0,
      },
    });

    revalidatePath(`/pete-pete/${session.id}/split`);
    revalidatePath("/dashboard");

    return { success: true, sessionId: session.id };
  } catch (error) {
    console.error("Gagal gabung sesi:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan saat bergabung ke sesi";
    return { success: false, error: message };
  }
}

// Action untuk menyelesaikan sesi patungan
export async function completeBillSession(sessionId: string) {
  try {
    await prisma.billSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
      },
    });

    revalidatePath(`/pete-pete/${sessionId}/split`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Gagal menyelesaikan sesi:", error);
    const message = error instanceof Error ? error.message : "Gagal menyelesaikan sesi PETE-PETE";
    return { success: false, error: message };
  }
}

