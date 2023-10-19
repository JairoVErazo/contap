const Indemnizacion = ({
  employeeNombre,
  employeeApellido,
  employeeSalario,
  employeeContratacion,
}) => {
  const now = new Date();
  const admissionDate = new Date(employeeContratacion);
  let years = now.getFullYear() - admissionDate.getFullYear();
  const monthsDifference = now.getMonth() - admissionDate.getMonth();
  const isPastMonth = monthsDifference < 0;
  const isPastDay =
    monthsDifference === 0 && now.getDate() < admissionDate.getDate();
  if (isPastMonth || isPastDay) years--;
  const yearsCost = years * parseFloat(employeeSalario);
  const monthPayment = (30 * monthsDifference) / 365;
  const total = yearsCost + monthPayment;

  // Convierte el objeto Date a una string
  const nowString = now.toLocaleDateString();

  return (
    <div className="container text-center">
      <p>{nowString}</p>
      <p>
        {employeeNombre} {employeeApellido},
      </p>
      <p>
        Por la presente, le comunicamos que su contrato de trabajo ha sido
        rescindido, con efectos a {nowString}. Se le otorga un finiquito por un
        monto de <strong>${total.toFixed(2)}</strong> como compensación.
      </p>
      <p>Le deseamos mucha suerte en su futuro profesional.</p>
      <p>Atentamente,</p>
      <p>PINKOILYN AUTOMOVILES</p>
    </div>
  );
};

export default Indemnizacion;
