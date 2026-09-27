import { Member, Item, Allocation, SplitSessionData } from "../types";

export function generateMemberSummaryText(
  member: Member,
  allocations: Allocation[],
  itemList: Item[],
  session: SplitSessionData
): string {
  const memberAllocations = allocations.filter((a) => a.memberId === member.id);

  let itemsText = "";
  let subtotal = 0;

  memberAllocations.forEach((alloc) => {
    const item = itemList.find((i) => i.id === alloc.itemId);
    if (item) {
      const itemAllocations = allocations.filter((x) => x.itemId === item.id);
      const totalAllocatedQty = itemAllocations.reduce((sum, x) => sum + x.quantity, 0);
      const sharePrice = Math.round((alloc.quantity / totalAllocatedQty) * Number(item.totalPrice));
      subtotal += sharePrice;

      const portionLabel =
        alloc.quantity === totalAllocatedQty && totalAllocatedQty === 1
          ? ""
          : ` (${alloc.quantity}/${totalAllocatedQty} porsi)`;

      itemsText += `  • ${item.name}${portionLabel} ➔ Rp ${sharePrice.toLocaleString("id-ID")}\n`;
    }
  });

  const totalSubtotal = itemList.reduce((acc, item) => {
    const hasAlloc = allocations.some((a) => a.itemId === item.id);
    return acc + (hasAlloc ? Number(item.totalPrice) : 0);
  }, 0);

  const taxAmount = Number(session.taxAmount) || 0;
  const tipAmount = Number(session.tipAmount) || 0;
  const discountAmount = Number(session.discountAmount) || 0;
  const taxAndTips = taxAmount + tipAmount;
  const memberTax = totalSubtotal > 0 ? Math.round(subtotal * (taxAmount / totalSubtotal)) : 0;
  const memberTips = totalSubtotal > 0 ? Math.round(subtotal * (tipAmount / totalSubtotal)) : 0;
  const memberDiscount = totalSubtotal > 0 ? Math.round(subtotal * (discountAmount / totalSubtotal)) : 0;
  const memberTaxAndTips = memberTax + memberTips;
  const grandTotal = Math.max(0, subtotal + memberTaxAndTips - memberDiscount);

  let feeBreakdownText = "";
  if (taxAmount > 0) {
    const taxPercent = totalSubtotal > 0 ? ((taxAmount / totalSubtotal) * 100).toFixed(1).replace(/\.0$/, "") : "0";
    feeBreakdownText += `Pajak (${taxPercent}%): Rp ${memberTax.toLocaleString("id-ID")}\n`;
  }
  if (tipAmount > 0) {
    const tipPercent = totalSubtotal > 0 ? ((tipAmount / totalSubtotal) * 100).toFixed(1).replace(/\.0$/, "") : "0";
    feeBreakdownText += `Servis/Tip (${tipPercent}%): Rp ${memberTips.toLocaleString("id-ID")}\n`;
  }
  if (discountAmount > 0) {
    const discountPercent = totalSubtotal > 0 ? ((discountAmount / totalSubtotal) * 100).toFixed(1).replace(/\.0$/, "") : "0";
    feeBreakdownText += `Diskon/Promo (-${discountPercent}%): -Rp ${memberDiscount.toLocaleString("id-ID")}\n`;
  }
  if (!feeBreakdownText && taxAndTips > 0) {
    feeBreakdownText += `Pajak & Servis: Rp ${memberTaxAndTips.toLocaleString("id-ID")}\n`;
  }

  const bankDetails = session.bankName
    ? `💳 *Info Pembayaran:*\nTransfer ke: ${session.bankName}\nNo. Rekening: ${session.bankAccount}\nA/N: ${session.bankOwner}`
    : "Silakan hubungi pembuat sesi untuk detail transfer.";

  const cleanTitle = session.title.replace(/^PETE-PETE\s+/i, "");

  const bonUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/bon/${session.inviteCode}?member=${member.id}`
      : `/bon/${session.inviteCode}?member=${member.id}`;

  return `🧾 *TAGIHAN PETE-PETE: ${cleanTitle}*
${session.merchantName ? `📍 Lokasi: ${session.merchantName}\n` : ""}Halo *${member.name}*, ini rincian tagihan lo:

🍽️ *Menu Pesanan:*
${itemsText || "  • Belum memilih menu makanan\n"}───────────────────
Subtotal Pesanan: Rp ${subtotal.toLocaleString("id-ID")}
${feeBreakdownText}💰 *Total Tagihan: Rp ${grandTotal.toLocaleString("id-ID")}*

${bankDetails}

🔗 *Cek Bon & Konfirmasi Transfer:*
${bonUrl}

🙏 Ditunggu transferannya ya, Bos! Thank you.`;
}

export function generateAllSummaryText(
  members: Member[],
  allocations: Allocation[],
  itemList: Item[],
  session: SplitSessionData
): string {
  let allMembersShareText = "";

  const totalSubtotal = itemList.reduce((acc, item) => {
    const hasAlloc = allocations.some((a) => a.itemId === item.id);
    return acc + (hasAlloc ? Number(item.totalPrice) : 0);
  }, 0);

  const taxAmount = Number(session.taxAmount) || 0;
  const tipAmount = Number(session.tipAmount) || 0;
  const discountAmount = Number(session.discountAmount) || 0;

  members.forEach((member) => {
    const memberAllocations = allocations.filter((a) => a.memberId === member.id);
    let subtotal = 0;
    let memberItemsText = "";

    memberAllocations.forEach((alloc) => {
      const item = itemList.find((i) => i.id === alloc.itemId);
      if (item) {
        const itemAllocations = allocations.filter((x) => x.itemId === item.id);
        const totalAllocatedQty = itemAllocations.reduce((sum, x) => sum + x.quantity, 0);
        const sharePrice = Math.round((alloc.quantity / totalAllocatedQty) * Number(item.totalPrice));
        subtotal += sharePrice;

        const portionLabel =
          alloc.quantity === totalAllocatedQty && totalAllocatedQty === 1
            ? ""
            : ` _(${alloc.quantity}/${totalAllocatedQty} porsi)_`;

        memberItemsText += `  • ${item.name}${portionLabel} ➔ Rp ${sharePrice.toLocaleString("id-ID")}\n`;
      }
    });

    const memberTax = totalSubtotal > 0 ? Math.round(subtotal * (taxAmount / totalSubtotal)) : 0;
    const memberTips = totalSubtotal > 0 ? Math.round(subtotal * (tipAmount / totalSubtotal)) : 0;
    const memberDiscount = totalSubtotal > 0 ? Math.round(subtotal * (discountAmount / totalSubtotal)) : 0;
    const memberTaxAndTips = memberTax + memberTips;
    const grandTotal = Math.max(0, subtotal + memberTaxAndTips - memberDiscount);

    let memberFeeText = "";
    const feeParts: string[] = [];
    if (taxAmount > 0) feeParts.push(`Pajak: Rp ${memberTax.toLocaleString("id-ID")}`);
    if (tipAmount > 0) feeParts.push(`Servis: Rp ${memberTips.toLocaleString("id-ID")}`);
    if (discountAmount > 0) feeParts.push(`Diskon: -Rp ${memberDiscount.toLocaleString("id-ID")}`);

    if (feeParts.length > 0) {
      memberFeeText = `  _↳ Subtotal: Rp ${subtotal.toLocaleString("id-ID")} + ${feeParts.join(" + ")}_\n`;
    }

    allMembersShareText += `👤 *${member.name}* : *Rp ${grandTotal.toLocaleString("id-ID")}*\n${
      memberItemsText || "  • Belum pilih menu\n"
    }${memberFeeText}\n`;
  });

  let overallFeeText = `Subtotal Struk: Rp ${totalSubtotal.toLocaleString("id-ID")}\n`;
  if (taxAmount > 0) {
    const taxPercent = totalSubtotal > 0 ? ((taxAmount / totalSubtotal) * 100).toFixed(1).replace(/\.0$/, "") : "0";
    overallFeeText += `Pajak (${taxPercent}%): Rp ${taxAmount.toLocaleString("id-ID")}\n`;
  }
  if (tipAmount > 0) {
    const tipPercent = totalSubtotal > 0 ? ((tipAmount / totalSubtotal) * 100).toFixed(1).replace(/\.0$/, "") : "0";
    overallFeeText += `Servis/Tip (${tipPercent}%): Rp ${tipAmount.toLocaleString("id-ID")}\n`;
  }
  if (discountAmount > 0) {
    const discountPercent = totalSubtotal > 0 ? ((discountAmount / totalSubtotal) * 100).toFixed(1).replace(/\.0$/, "") : "0";
    overallFeeText += `Diskon/Promo (-${discountPercent}%): -Rp ${discountAmount.toLocaleString("id-ID")}\n`;
  }

  const bankDetails = session.bankName
    ? `💳 *Info Pembayaran:*\nTransfer ke: ${session.bankName}\nNo. Rekening: ${session.bankAccount}\nA/N: ${session.bankOwner}`
    : "Silakan hubungi pembuat sesi untuk detail transfer.";

  const cleanTitle = session.title.replace(/^PETE-PETE\s+/i, "");

  const bonUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/bon/${session.inviteCode}`
      : `/bon/${session.inviteCode}`;

  return `🧾 *REKAP TAGIHAN PETE-PETE: ${cleanTitle}*
${session.merchantName ? `📍 Lokasi: ${session.merchantName}\n` : ""}
📊 *Rincian Keseluruhan Bill:*
${overallFeeText}💰 Total Tagihan: *Rp ${session.totalAmount.toLocaleString("id-ID")}*
───────────────────
👥 *Rincian per Orang:*
${allMembersShareText}───────────────────
${bankDetails}

🔗 *Cek Bon & Rincian Lengkap Online:*
${bonUrl}

🙏 Ditunggu transferannya ya, Bos! Thank you.`;
}
