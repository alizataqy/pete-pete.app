import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getVacationPlans } from "@/app/actions/vacation";
import AgendaPlansView from "./AgendaPlansView";


export default async function AgendaPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const result = await getVacationPlans(session.user.id);
  const plans = result.success && result.plans ? result.plans : [];

  return (
    <AgendaPlansView
      userId={session.user.id}
      userName={session.user.name}
      initialPlans={plans.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description || "",
        budget: Number(p.budget),
        membersCount: p.members.length,
        expensesCount: p.expenses.length,
        totalExpenses: p.expenses.reduce((sum, e) => sum + Number(e.amount), 0),
        date: p.date ? p.date.toISOString() : undefined,
        createdAt: p.createdAt.toISOString(),
      }))}
    />
  );
}
