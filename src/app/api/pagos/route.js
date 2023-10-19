import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pagos = await prisma.pago.findMany();
    return NextResponse.json(pagos);
  } catch (error) {
    console.error("Error al procesar la solicitud GET:", error);
    return NextResponse.json(error, { status: 500 });
  }
}
