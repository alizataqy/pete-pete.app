import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getVacationPlanDetail } from "@/app/actions/vacation";
import AgendaPlanDetailView from "./AgendaPlanDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgendaDetailPage({ params }: PageProps) {
  const { id: planId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const result = await getVacationPlanDetail(planId);

  if (!result.success || !result.plan) {
    redirect("/agenda");
  }

  const plan = result.plan;

  return (
    <AgendaPlanDetailView
      userId={session.user.id}
      plan={{
        id: plan.id,
        title: plan.title,
        description: plan.description || "",
        budget: Number(plan.budget),
        date: plan.date ? plan.date.toISOString() : undefined,
        createdAt: plan.createdAt.toISOString(),
      }}
      initialMembers={plan.members.map((m) => {
        const isMe =
          m.userId === session.user.id ||
          m.userId === plan.userId ||
          (!m.userId && (m.name.toLowerCase() === session.user.name.toLowerCase() || m.name.toLowerCase() === "gua"));
        return {
          id: m.id,
          name: m.name,
          userId: m.userId,
          avatar: isMe ? (plan.createdBy?.avatar || null) : m.id,
        };
      })}
      initialExpenses={plan.expenses.map((e) => ({
        id: e.id,
        title: e.title,
        amount: Number(e.amount),
        payerId: e.payerId,
        payerName: e.payer.name,
        shares: e.shares.map((s) => ({
          memberId: s.memberId,
          memberName: s.member.name,
          amount: Number(s.amount),
        })),
        createdAt: e.createdAt.toISOString(),
      }))}
    />
  );
}
