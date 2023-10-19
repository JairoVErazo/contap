import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  try {
    const {
      cantidad,
      empleadoId,
      horasDiurnas,
      horasNocturnas,
      salarioBono,
      afp,
      isss,
      renta,
      vacationsAmount,
      liquidSalary,
    } = await request.json();

    const id = parseInt(params.id, 10); // Convierte params.id en un número entero

    // Agrega un log para verificar los datos recibidos
    console.log("Datos recibidos para actualizar el pago:", {
      id,
      cantidad,
      empleadoId,
      horasDiurnas,
      horasNocturnas,
      salarioBono,
      afp,
      isss,
      renta,
      vacationsAmount,
      liquidSalary,
    });

    // Llama a la función `pagoUpdate` para actualizar el pago
    const pagoUpdate = await prisma.pago.update({
      where: {
        id: id,
      },
      data: {
        cantidad,
        empleadoId,
        horasDiurnas,
        horasNocturnas,
        salarioBono,
        afp,
        isss,
        renta,
        vacationsAmount,
        liquidSalary,
      },
    });

    console.log(pagoUpdate);
    return NextResponse.json({
      message: "pago actualizado exitosamente",
      pago: pagoUpdate,
    });
  } catch (error) {
    // Agrega un log para identificar errores
    console.error("Error al actualizar los datos del pago:", error);

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  } finally {
    await prisma.$disconnect();
  }
}
