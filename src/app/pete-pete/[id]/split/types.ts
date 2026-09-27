export interface Member {
  id: string;
  name: string;
  shareAmount: number;
  userId?: string | null;
  isPaid?: boolean;
}

export interface Item {
  id: string;
  name: string;
  quantity: number;
  totalPrice: number;
}

export interface Allocation {
  itemId: string;
  memberId: string;
  quantity: number;
}

export interface SplitSessionData {
  id: string;
  title: string;
  merchantName?: string;
  inviteCode: string;
  totalAmount: number;
  taxAmount: number;
  tipAmount: number;
  discountAmount?: number;
  bankName?: string;
  bankAccount?: string;
  bankOwner?: string;
  status: string;
  userId?: string | null;
}

export interface ShareModalConfig {
  isOpen: boolean;
  title: string;
  description: string;
  text: string;
  memberId?: string;
}
