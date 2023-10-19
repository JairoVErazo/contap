import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "Debes proporcionar un ID de empleado" },
        { status: 400 }
      );
    }

    const empleado = await prisma.empleado.findUnique({
      where: {
        id: parseInt(id, 10),
      },
      include: {
        pagos: true,
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

export function DELETE() {
  return NextResponse.json({
    message: "eliminando un empleado",
  });
}
