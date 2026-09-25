import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Foto struknya belum lo pilih nih, Bos. Pilih atau jepret struknya dulu ya!" },
        { status: 400 }
      );
    }

    // Get Session and IP Address for checking limit
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

    if (session?.user?.id) {
      // User is logged in. Limit: 3 scans per day
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const scanCount = await prisma.ocrScanLog.count({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (scanCount >= 3) {
        return NextResponse.json(
          { error: "Udah abis jatah harian lo nih (maksimal 3x scan per hari). Coba lagi besok atau input manual aja ya, Bos!" },
          { status: 403 }
        );
      }
    } else {
      // Anonymous user. Limit: 1 scan per day per cookie or IP
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const hasScannedCookie = request.cookies.get("has_scanned")?.value === "true";

      let hasScannedIp = false;
      if (ipAddress && ipAddress !== "127.0.0.1") {
        const ipScan = await prisma.ocrScanLog.findFirst({
          where: {
            ipAddress,
            userId: null,
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        });
        if (ipScan) {
          hasScannedIp = true;
        }
      }

      if (hasScannedCookie || hasScannedIp) {
        return NextResponse.json(
          { error: "Jatah scan gratis tanpa login udah abis nih. Masuk dulu yuk biar dapet jatah 3x scan sehari!" },
          { status: 403 }
        );
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to mock OCR data.");
      const mockItems = [
        { name: "Nasi Goreng Special", quantity: 2, unitPrice: 35000, totalPrice: 70000 },
        { name: "Es Teh Manis", quantity: 3, unitPrice: 8000, totalPrice: 24000 },
        { name: "Sate Ayam Madura", quantity: 1, unitPrice: 45000, totalPrice: 45000 },
        { name: "Pizza Meat Lovers (Large)", quantity: 1, unitPrice: 120000, totalPrice: 120000 },
        { name: "Extra Sambal Terasi", quantity: 2, unitPrice: 3000, totalPrice: 6000 },
      ];

      const subtotal = mockItems.reduce((acc, item) => acc + item.totalPrice, 0);
      const tax = Math.round(subtotal * 0.1); // PPN 10%
      const service = Math.round(subtotal * 0.05); // Service Charge 5%
      const grandTotal = subtotal + tax + service;

      // log the scan
      if (session?.user?.id) {
        await prisma.ocrScanLog.create({
          data: { userId: session.user.id, ipAddress },
        });
      } else {
        await prisma.ocrScanLog.create({
          data: { ipAddress },
        });
      }

      const responseObj = NextResponse.json({
        success: true,
        isMock: true,
        merchantName: "Restoran Selera Nusantara (Mock)",
        items: mockItems,
        taxAmount: tax,
        tipAmount: service,
        totalAmount: grandTotal,
        currency: "IDR",
      });

      if (!session) {
        const now = new Date();
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        const secondsLeft = Math.max(1, Math.round((endOfToday.getTime() - now.getTime()) / 1000));

        responseObj.cookies.set("has_scanned", "true", {
          path: "/",
          maxAge: secondsLeft,
          httpOnly: true,
        });
      }

      return responseObj;
    }

    // Konversi File ke base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "image/jpeg";

    // Prompt yang dioptimalkan untuk akurasi maksimal
    const prompt = `Analyze this receipt image and extract the following details into a JSON object matching this schema:
{
  "merchantName": "string (clean name of the restaurant or shop)",
  "items": [
    {
      "name": "string (clean item name, remove codes or numbers at start)",
      "quantity": "number (integer, default 1)",
      "unitPrice": "number (integer, price of a single unit of this item)",
      "totalPrice": "number (integer, quantity * unitPrice)"
    }
  ],
  "taxAmount": "number (integer, any PPN, PB1, or tax amount, default 0)",
  "tipAmount": "number (integer, any service charge, tip, or service fee, default 0)",
  "totalAmount": "number (integer, the final grand total of the receipt)"
}

Rules:
1. Identify all individual purchased items. Ignore subtotal lines, payment method lines, or change lines as items.
2. If there are item-specific discounts, subtract them from the totalPrice/unitPrice of that item so that the totalPrice reflects the final paid cost of that item.
3. If there is a general receipt discount, do not list it as an item; instead, distribute the discount proportionally across all items by reducing their totalPrice, or verify that the sum of item totalPrices + tax + tip equals the final totalAmount.
4. Ensure all prices are returned as clean integer numbers (e.g. 35000 instead of 35.000 or 35,000).
5. Output ONLY the raw JSON object, do not wrap in markdown \`\`\`json block.`;

    // Daftar model alternatif jika terjadi 503 high demand spike atau 429 rate limit
    const candidateModels = [
      "gemini-3.5-flash",
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash-lite",
      "gemini-3.8-flash",
      "gemini-flash-latest",
    ];

    let parsedData: {
      merchantName?: string;
      items?: { name: string; quantity: number; unitPrice: number; totalPrice: number }[];
      taxAmount?: number;
      tipAmount?: number;
      totalAmount?: number;
    } | null = null;
    let lastError: Error | null = null;
    const MAX_RETRIES = 5;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const modelToUse = candidateModels[(attempt - 1) % candidateModels.length];
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`;

      try {
        const response = await fetch(geminiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`[OCR Attempt ${attempt}/${MAX_RETRIES}] (${modelToUse}) Status ${response.status}: ${errorText.slice(0, 150)}`);
          if (attempt < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, attempt * 800));
            continue;
          }
          throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
          throw new Error(`Gemini tidak mengembalikan teks hasil OCR pada percobaan ke-${attempt}.`);
        }

        // Parse hasil JSON dari Gemini
        const cleanJsonText = textResponse.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        parsedData = JSON.parse(cleanJsonText);
        break; // Berhasil!
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`[OCR Attempt ${attempt}/${MAX_RETRIES}] Exception:`, lastError.message);
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, attempt * 800));
        }
      }
    }

    if (!parsedData) {
      throw lastError || new Error("Gagal memproses struk setelah 5 kali percobaan.");
    }

    // log the scan
    if (session?.user?.id) {
      await prisma.ocrScanLog.create({
        data: { userId: session.user.id, ipAddress },
      });
    } else {
      await prisma.ocrScanLog.create({
        data: { ipAddress },
      });
    }

    const responseObj = NextResponse.json({
      success: true,
      isMock: false,
      merchantName: parsedData.merchantName || "Unknown Merchant",
      items: parsedData.items || [],
      taxAmount: parsedData.taxAmount || 0,
      tipAmount: parsedData.tipAmount || 0,
      totalAmount: parsedData.totalAmount || 0,
      currency: "IDR",
    });

    if (!session) {
      const now = new Date();
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      const secondsLeft = Math.max(1, Math.round((endOfToday.getTime() - now.getTime()) / 1000));

      responseObj.cookies.set("has_scanned", "true", {
        path: "/",
        maxAge: secondsLeft,
        httpOnly: true,
      });
    }

    return responseObj;

  } catch (error) {
    console.error("OCR Scan Error:", error);
    return NextResponse.json(
      { error: "Struk lo gagal dibaca sama sistem nih setelah 5 kali percobaan. Pastiin fotonya terang, fokus, dan gak burem, atau klik coba lagi / input manual ya, Bos!" },
      { status: 500 }
    );
  }
}
