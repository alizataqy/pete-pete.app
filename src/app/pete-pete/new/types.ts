export interface ScanItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ScanResult {
  merchantName: string;
  items: ScanItem[];
  taxAmount: number;
  tipAmount: number;
  discountAmount?: number;
  totalAmount: number;
  currency: string;
  isMock?: boolean;
}

export type InputMode = "scan" | "manual";

export const BANK_TEMPLATES = [
  { name: "BCA", logo: "/bank-logos/bca.svg", placeholder: "Contoh: 1234567890" },
  { name: "Mandiri", logo: "/bank-logos/mandiri.svg", placeholder: "Contoh: 1370012345678" },
  { name: "BRI", logo: "/bank-logos/bri.svg", placeholder: "Contoh: 001201000123456" },
  { name: "BNI", logo: "/bank-logos/bni.svg", placeholder: "Contoh: 0123456789" },
  { name: "GoPay", logo: "/bank-logos/gopay.svg", placeholder: "Contoh: 081234567890" },
  { name: "OVO", logo: "/bank-logos/ovo.svg", placeholder: "Contoh: 081234567890" },
  { name: "Dana", logo: "/bank-logos/dana.svg", placeholder: "Contoh: 081234567890" },
];

export const formatRupiah = (value: number | string): string => {
  if (value === undefined || value === null || value === "") return "";
  const str = String(value);
  const isNegative = str.startsWith("-") || (typeof value === "number" && value < 0);
  const cleaned = str.replace(/[^0-9]/g, "");
  if (!cleaned) {
    if (str === "0") return "Rp 0";
    return isNegative ? "Rp -" : "";
  }
  const formatted = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Rp ${isNegative ? "-" : ""}${formatted}`;
};

export const parseRupiah = (formatted: string): string => {
  if (!formatted) return "";
  const isNegative = formatted.includes("-");
  const cleaned = formatted.replace(/[^0-9]/g, "");
  return isNegative ? `-${cleaned}` : cleaned;
};
