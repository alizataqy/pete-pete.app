export interface Member {
  id: string;
  name: string;
  userId?: string | null;
}

export interface Share {
  memberId: string;
  memberName: string;
  amount: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  payerId: string;
  payerName: string;
  shares: Share[];
  createdAt: string;
}

export interface Transfer {
  from: string;
  to: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
}

export interface VacationPlanDetailViewProps {
  userId: string;
  plan: {
    id: string;
    title: string;
    description: string;
    budget: number;
    date?: string;
    createdAt: string;
  };
  initialMembers: Member[];
  initialExpenses: Expense[];
}

export const formatRupiah = (value: number | string): string => {
  if (value === undefined || value === null || value === "") return "";
  const str = String(value);
  const cleaned = str.replace(/[^0-9]/g, "");
  if (!cleaned) {
    if (str === "0") return "Rp 0";
    return "";
  }
  const formatted = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Rp ${formatted}`;
};

export const parseRupiah = (formatted: string): string => {
  if (!formatted) return "";
  return formatted.replace(/[^0-9]/g, "");
};

export const formatDateString = (dateStr?: string) => {
  if (!dateStr) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length === 3) {
    const y = parts[0];
    const m = months[parseInt(parts[1], 10) - 1];
    const d = parseInt(parts[2], 10);
    return `${d} ${m} ${y}`;
  }
  return dateStr;
};
