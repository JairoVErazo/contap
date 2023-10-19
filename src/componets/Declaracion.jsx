import { useState, useEffect } from "react";
import { calcularAguinaldo } from "@/app/api/empleados/route";

const Declaracion = ({
  employeeApellido,
  employeeNombre,
  employeePayments,
  employeeContratacion,
  employeeSalario,
}) => {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [summary, setSummary] = useState({});

  useEffect(() => {
    if (employeePayments.length > 0) {
      // Extraer los años de los pagos
      const uniqueYears = Array.from(
        new Set(
          employeePayments.map((payment) =>
            new Date(payment.fecha).getFullYear()
          )
        )
      );

      setYears(uniqueYears);
      if (uniqueYears.length > 0) {
        setSelectedYear(uniqueYears[0]);
      }
    }
  }, [employeePayments]);

  useEffect(() => {
    if (selectedYear) {
      const filteredPayments = employeePayments.filter((payment) => {
        const paymentYear = new Date(payment.fecha).getFullYear();
        return paymentYear === selectedYear;
      });

      // Realizar cálculos en filteredPayments para obtener el resumen
      const totalAmount = filteredPayments.reduce(
        (acc, payment) => acc + parseFloat(payment.cantidad),
        0
      );
      const totalISSS = filteredPayments.reduce(
        (acc, payment) => acc + parseFloat(payment.isss),
        0
      );
      const totalAFP = filteredPayments.reduce(
        (acc, payment) => acc + parseFloat(payment.afp),
        0
      );
      const totalRenta = filteredPayments.reduce(
        (acc, payment) => acc + parseFloat(payment.renta),
        0
      );

      const aguinaldoNoGravado = calcularAguinaldo(
        new Date(employeeContratacion), // Convertir a Date si no lo está
        new Date(), // Fecha actual
        parseFloat(employeeSalario) // Convertir a número si no lo está
      );

      setSummary({
        totalAmount: totalAmount.toFixed(2), // Redondear a 2 decimales
        totalISSS: totalISSS.toFixed(2),
        totalAFP: totalAFP.toFixed(2),
        totalRenta: totalRenta.toFixed(2),
        aguinaldoNoGravado: aguinaldoNoGravado.toFixed(2),
      });
    }
  }, [selectedYear, employeePayments]);

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  return (
    <div>
      <div className="row justify-content-center">
        <h4>Declaración Anual de Renta</h4>
        <label>
          Seleccione año de Declaración
          <select
            className="form-select"
            value={selectedYear}
            onChange={handleYearChange}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <p>
            El infrascrito agente de retención hace constar que{" "}
            {employeeApellido}, {employeeNombre} con NIT. 0000-000000-000-0 en
            su calidad de empleada de esta empresa, devengó durante el perído
            comprendido a lo largo del año {selectedYear} lo siguiente
          </p>
        </label>
      </div>
      {selectedYear && (
        <table className="table">
          <thead>
            <tr>
              <th>Año</th>
              <td>{selectedYear}</td>
            </tr>
            <tr>
              <th>Total Devengado</th>
              <td>${summary.totalAmount}</td>
            </tr>
            <tr>
              <th>Aguinaldo Gravado</th>
              <td>-</td>
            </tr>
            <tr>
              <th>Total AFP</th>
              <td>${summary.totalAFP}</td>
            </tr>
            <tr>
              <th>Total ISSS</th>
              <td>${summary.totalISSS}</td>
            </tr>
            <tr>
              <th>Aguinaldo no Gravado</th>
              <td>${summary.aguinaldoNoGravado}</td>
            </tr>
            <tr>
              <th>Total Renta</th>
              <td>${summary.totalRenta}</td>
            </tr>
          </thead>
        </table>
      )}
    </div>
  );
};

export default Declaracion;
