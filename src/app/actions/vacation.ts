"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
interface CreateVacationPlanData {
  title: string;
  description?: string;
  budget: number;
  members: string[];
}

export async function getVacationPlans(userId: string) {
  try {
    const plans = await prisma.vacationPlan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        members: {
          select: { id: true, name: true },
        },
        expenses: {
          select: { amount: true },
        },
      },
    });
    return { success: true, plans };
  } catch (error) {
    console.error("Gagal mengambil rencana liburan:", error);
    return { success: false, error: "Gagal mengambil rencana liburan" };
  }
}

export async function createVacationPlan(userId: string, data: CreateVacationPlanData) {
  try {
    // Ambil info nama user pembuat untuk dijadikan anggota otomatis
    const creatorUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const creatorName = creatorUser?.name || "Gua";

    const plan = await prisma.vacationPlan.create({
      data: {
        title: data.title,
        description: data.description,
        budget: data.budget,
        userId,
        members: {
          create: [
            { name: creatorName, userId },
            ...data.members
              .filter((name) => name.trim() !== "" && name !== creatorName)
              .map((name) => ({ name })),
          ],
        },
      },
      include: {
        members: true,
      },
    });

    revalidatePath("/agenda");
    return { success: true, planId: plan.id };
  } catch (error) {
    console.error("Gagal membuat rencana liburan:", error);
    return { success: false, error: "Gagal membuat rencana liburan baru" };
  }
}

export async function getVacationPlanDetail(planId: string) {
  try {
    const plan = await prisma.vacationPlan.findUnique({
      where: { id: planId },
      include: {
        members: true,
        expenses: {
          orderBy: { createdAt: "desc" },
          include: {
            payer: {
              select: { id: true, name: true },
            },
            shares: {
              include: {
                member: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!plan) {
      return { success: false, error: "Rencana liburan tidak ditemukan" };
    }

    return { success: true, plan };
  } catch (error) {
    console.error("Gagal mengambil detail rencana liburan:", error);
    return { success: false, error: "Gagal mengambil detail rencana liburan" };
  }
}

export async function addVacationMember(planId: string, name: string) {
  try {
    const member = await prisma.vacationMember.create({
      data: {
        name,
        planId,
      },
    });

    revalidatePath(`/vacation/${planId}`);
    return { success: true, member };
  } catch (error) {
    console.error("Gagal menambahkan anggota:", error);
    return { success: false, error: "Gagal menambahkan anggota baru" };
  }
}

export async function removeVacationMember(memberId: string, planId: string) {
  try {
    await prisma.vacationMember.delete({
      where: { id: memberId, planId },
    });

    revalidatePath(`/vacation/${planId}`);
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus anggota:", error);
    return { success: false, error: "Gagal menghapus anggota" };
  }
}

export async function addVacationExpense(
  planId: string,
  data: {
    title: string;
    amount: number;
    payerId: string;
    memberIds: string[];
  }
) {
  try {
    if (data.memberIds.length === 0) {
      return { success: false, error: "Minimal ada 1 anggota yang patungan" };
    }

    const shareAmount = Math.round(data.amount / data.memberIds.length);

    await prisma.$transaction(async (tx) => {
      const expense = await tx.vacationExpense.create({
        data: {
          title: data.title,
          amount: data.amount,
          payerId: data.payerId,
          planId,
        },
      });

      const sharesData = data.memberIds.map((memberId) => ({
        expenseId: expense.id,
        memberId,
        amount: shareAmount,
      }));

      await tx.vacationExpenseShare.createMany({
        data: sharesData,
      });
    });

    revalidatePath(`/vacation/${planId}`);
    return { success: true };
  } catch (error) {
    console.error("Gagal menambahkan pengeluaran:", error);
    return { success: false, error: "Gagal menambahkan pengeluaran" };
  }
}

export async function deleteVacationExpense(expenseId: string, planId: string) {
  try {
    await prisma.vacationExpense.delete({
      where: { id: expenseId, planId },
    });

    revalidatePath(`/vacation/${planId}`);
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus pengeluaran:", error);
    return { success: false, error: "Gagal menghapus pengeluaran" };
  }
}

export async function updateVacationExpense(
  expenseId: string,
  planId: string,
  data: {
    title: string;
    amount: number;
    payerId: string;
    memberIds: string[];
  }
) {
  try {
    if (data.memberIds.length === 0) {
      return { success: false, error: "Minimal ada 1 anggota yang patungan" };
    }

    const shareAmount = Math.round(data.amount / data.memberIds.length);

    await prisma.$transaction(async (tx) => {
      await tx.vacationExpense.update({
        where: { id: expenseId, planId },
        data: {
          title: data.title,
          amount: data.amount,
          payerId: data.payerId,
        },
      });

      await tx.vacationExpenseShare.deleteMany({
        where: { expenseId },
      });

      const sharesData = data.memberIds.map((memberId) => ({
        expenseId,
        memberId,
        amount: shareAmount,
      }));

      await tx.vacationExpenseShare.createMany({
        data: sharesData,
      });
    });

    revalidatePath(`/vacation/${planId}`);
    return { success: true };
  } catch (error) {
    console.error("Gagal mengupdate pengeluaran:", error);
    return { success: false, error: "Gagal mengupdate pengeluaran" };
  }
}

export async function renameVacationMember(memberId: string, planId: string, name: string) {
  try {
    await prisma.vacationMember.update({
      where: { id: memberId, planId },
      data: { name },
    });

    revalidatePath(`/vacation/${planId}`);
    return { success: true };
  } catch (error) {
    console.error("Gagal mengubah nama sohib:", error);
    return { success: false, error: "Gagal mengubah nama sohib" };
  }
}
