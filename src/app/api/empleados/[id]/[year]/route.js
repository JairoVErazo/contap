import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { id, year } = params;

    if (!id || !year) {
      return NextResponse.json(
        { error: "Debes proporcionar un ID de empleado y un año" },
        { status: 400 }
      );
    }

    const empleado = await prisma.empleado.findUnique({
      where: {
        id: parseInt(id, 10),
      },
      include: {
        pagos: {
          where: {
            fecha: {
              gte: new Date(`${year}-01-01T00:00:00.000Z`),
              lte: new Date(`${year}-12-31T23:59:59.999Z`),
            },
          },
        },
      },
    });

    if (!empleado) {
      return NextResponse.json(
        { error: "Empleado no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(empleado);
  } catch (error) {
    console.error("Error al procesar la solicitud GET:", error);
    return NextResponse.json(error, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
