-- CreateTable
CREATE TABLE "Empleado" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "relacionLaboral" TEXT NOT NULL,
    "fechaContratacion" TIMESTAMP(3) NOT NULL,
    "salarioBase" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Empleado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" SERIAL NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "horasDiurnas" INTEGER NOT NULL,
    "horasNocturnas" INTEGER NOT NULL,
    "afp" DECIMAL(65,30) NOT NULL,
    "isss" DECIMAL(65,30) NOT NULL,
    "renta" DECIMAL(65,30) NOT NULL,
    "salarioBono" DECIMAL(65,30) NOT NULL,
    "vacationsAmount" DECIMAL(65,30) NOT NULL,
    "liquidSalary" DECIMAL(65,30) NOT NULL,
    "empleadoId" INTEGER NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
