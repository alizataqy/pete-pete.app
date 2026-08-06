import React from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import AddBankForm from "./AddBankForm";

export default async function AddBankPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-transparent">
      <AddBankForm userId={session.user.id} />
    </main>
  );
}
