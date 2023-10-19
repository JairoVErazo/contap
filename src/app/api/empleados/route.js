import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const empleados = await prisma.empleado.findMany();
    return NextResponse.json(empleados);
  } catch (error) {
    console.error("Error al procesar la solicitud GET:", error);
    return NextResponse.json(error, { status: 500 });
  }
}

export function calcularAguinaldo(inicio, final, salario) {
  let years = final.getFullYear() - inicio.getFullYear();
  const monthsDifference = final.getMonth() - inicio.getMonth();
  const isPastMonth = monthsDifference < 0;
  const isPastDay =
    monthsDifference === 0 && final.getDate() < inicio.getDate();
  if (isPastMonth || isPastDay) years--;

  const rates = [
    { from: 0, to: 3, rate: 0.5 },
    { from: 3, to: 10, rate: (19 * 0.5) / 15 },
    { from: 10, to: Infinity, rate: (21 * 0.5) / 15 },
  ];

  const foundRate = rates.find((r) => years >= r.from && years < r.to);
  const { rate } = foundRate;
  let aguinaldo = salario * rate;

  if (years === 0) {
    aguinaldo /= 365;
    aguinaldo *= monthsDifference * 30;
  }

  return aguinaldo;
}

export function calcularAFP(salarioBase) {
  const tasaAFP = 7.25;
  const montoAFP = salarioBase * (tasaAFP / 100);
  return montoAFP.toFixed(2);
}

export function calcularISSS(salarioBase) {
  const topeISSS = 1000;
  const tasaISSS = 3;
  const salarioParaISSS = Math.min(salarioBase, topeISSS);
  const montoISSS = salarioParaISSS * (tasaISSS / 100);
  return montoISSS.toFixed(2);
}

export function calcularRenta(cantidad, isss, afp) {
  const salarioNetoAntesDeRenta = cantidad - isss - afp;

  const rangos = [
    { desde: 0.01, hasta: 472, porcentaje: 0, cuotaFija: 0 },
    { desde: 472.01, hasta: 895.24, porcentaje: 10, cuotaFija: 17.67 },
    { desde: 895.25, hasta: 2038.1, porcentaje: 20, cuotaFija: 60 },
    { desde: 2038.11, hasta: Infinity, porcentaje: 30, cuotaFija: 288.57 },
  ];

  let rango = null;
  for (const r of rangos) {
    if (
      salarioNetoAntesDeRenta >= r.desde &&
      salarioNetoAntesDeRenta <= r.hasta
    ) {
      rango = r;
      break;
    }
  }

  if (rango) {
    const excedente = salarioNetoAntesDeRenta - rango.desde;
    const renta = (excedente * rango.porcentaje) / 100 + rango.cuotaFija;
    return Math.max(renta.toFixed(2), 0);
  }

  return 0;
}

function calcularSalarioNeto(salarioBase, isss, afp, renta) {
  const salarioNeto = salarioBase - isss - afp - renta;
  return salarioNeto.toFixed(2);
}

function convertirFechaISO(fecha) {
  return new Date(fecha).toISOString();
}

export async function POST(request) {
  try {
    const {
      nombre,
      apellido,
      fechaNacimiento,
      relacionLaboral,
      fechaContratacion,
      salarioBase,
      pagos,
    } = await request.json();

    const newEmpleado = await prisma.empleado.create({
      data: {
        nombre,
        apellido,
        fechaNacimiento: convertirFechaISO(fechaNacimiento),
        relacionLaboral,
        fechaContratacion: convertirFechaISO(fechaContratacion),
        salarioBase: parseFloat(salarioBase),
      },
      include: { pagos: true },
    });

    await calcularYRegistrarPagos(newEmpleado);

    const newEmpleado2 = await prisma.empleado.findUnique({
      where: {
        id: newEmpleado.id,
      },
      include: {
        pagos: true,
      },
    });

    return NextResponse.json({
      message: "Empleado creado exitosamente",
      empleado: newEmpleado2,
    });
  } catch (error) {
    console.error("Error al procesar la solicitud POST:", error);
    return NextResponse.json(
      {
        message: "Hubo un error al procesar la solicitud POST",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export function contarDiasLaborables(inicio, fin) {
  const inicioA0 = new Date(inicio).setHours(0, 0, 0);
  const finA0 = new Date(fin).setHours(0, 0, 0);
  const _inicio = new Date(inicioA0);
  const _fin = new Date(finA0);
  let días = 0;

  while (_inicio.getTime() < _fin.getTime()) {
    if ([0, 6].indexOf(_inicio.getDay()) === -1) días++;
    _inicio.setDate(_inicio.getDate() + 1);
  }

  return días;
}

export function mesesEntreFechas(fechaDeInicio, fechaDeFin) {
  const mesDeIngreso = fechaDeInicio.getMonth();
  const mesActual = fechaDeFin.getMonth();
  const diferenciaSimpleDeMeses = mesActual - mesDeIngreso;
  const añosEntreFechas =
    fechaDeFin.getFullYear() - fechaDeInicio.getFullYear();
  return diferenciaSimpleDeMeses + añosEntreFechas * 12;
}

const obtenerDiasLaborablesEnElMes = (numeroDeMesBasadoEnCero, año) => {
  const inicioDelMes = new Date(año, numeroDeMesBasadoEnCero, 1);
  const finDelMes = new Date(año, numeroDeMesBasadoEnCero + 1, 0);
  return contarDiasLaborables(inicioDelMes, finDelMes);
};

async function calcularYRegistrarPagos(empleado) {
  const hoy = new Date();
  const fechaDeIngreso = new Date(empleado.fechaContratacion);
  const pagos = [];
  const horasDiurnas = 0;
  const horasNocturnas = 0;
  const salarioBono = 0;
  const vacationsAmount = 0;

  for (let i = 0; i < mesesEntreFechas(fechaDeIngreso, hoy); i++) {
    const mes = fechaDeIngreso.getMonth() + i;
    const año = fechaDeIngreso.getFullYear();
    const dia = i === 0 ? fechaDeIngreso.getDate() : 1;
    const fechaDeInicio = new Date(año, mes, dia);
    const fechaDeFin = new Date(año, mes + 1, 0);

    const diasLaborablesEnElMes = obtenerDiasLaborablesEnElMes(mes, año);
    const precioDiario = +(
      empleado.salarioBase / diasLaborablesEnElMes
    ).toFixed(2);

    const díasTrabajados = contarDiasLaborables(fechaDeInicio, fechaDeFin);

    const cantidad = +(precioDiario * díasTrabajados).toFixed(2);
    const afp = calcularAFP(cantidad);
    const isss = calcularISSS(cantidad);
    const renta = calcularRenta(cantidad, afp, isss);
    console.log(renta);
    const liquidSalary = parseFloat(cantidad - afp - isss - renta);

    pagos.push({
      cantidad: cantidad,
      fecha: fechaDeFin.getTime(),
      horasDiurnas: horasDiurnas,
      horasNocturnas: horasNocturnas,
      salarioBono: salarioBono.toFixed(2),
      afp: afp,
      isss: isss,
      renta: renta,
      vacationsAmount: vacationsAmount.toFixed(2),
      liquidSalary: liquidSalary.toFixed(2),
    });
  }

  for (const p of pagos) {
    await prisma.pago.create({
      data: {
        cantidad: Math.round(p.cantidad),
        fecha: convertirFechaISO(new Date(p.fecha)),
        horasDiurnas: p.horasDiurnas,
        horasNocturnas: p.horasNocturnas,
        salarioBono: parseFloat(p.salarioBono),
        afp: parseFloat(p.afp),
        isss: parseFloat(p.isss),
        renta: parseFloat(p.renta),
        vacationsAmount: parseFloat(p.vacationsAmount),
        liquidSalary: parseFloat(p.liquidSalary),
        empleado: {
          connect: { id: empleado.id },
        },
      },
    });
  }
}
