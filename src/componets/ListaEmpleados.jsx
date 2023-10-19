import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  calcularAFP,
  calcularISSS,
  calcularRenta,
} from "@/app/api/empleados/route";
import { Modal } from "react-bootstrap";
import Declaracion from "./Declaracion";
import Indemnizacion from "./Indemnizacion";
export const dynamic = "force-dynamic";

export default function ListaEmpleados() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeePayments, setEmployeePayments] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [horasDiurnas, setHorasDiurnas] = useState(0);
  const [horasNocturnas, setHorasNocturnas] = useState(0);
  const [modalData, setModalData] = useState(null);
  const [hasVacation, setHasVacation] = useState(false);
  const [showEmployeePaymentsModal, setShowEmployeePaymentsModal] =
    useState(false);
  const [showCalculoIndemnizacionModal, setShowCalculoIndemnizacionModal] =
    useState(false);

  const onEmpleadoClick = (employee) => {
    setSelectedEmployee(employee);
    setHasVacation(false); // Restablece el estado cuando cambia de empleado
    fetch(`/api/empleados/${employee.id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener los pagos del empleado");
        }
        return response.json();
      })
      .then((data) => {
        setEmployeePayments(data.pagos);
      })
      .catch((error) =>
        console.error("Error al obtener los pagos del empleado:", error)
      );
  };

  const openEmployeePaymentsModal = () => {
    setShowEmployeePaymentsModal(true);
  };

  const closeEmployeePaymentsModal = () => {
    setShowEmployeePaymentsModal(false);
  };

  const handleOpenCalculoIndemnizacionModal = () => {
    setShowCalculoIndemnizacionModal(true);
  };

  const handleCloseCalculoIndemnizacionModal = () => {
    setShowCalculoIndemnizacionModal(false);
  };

  const handleShowModal = (payment) => {
    setModalData({ payment });
    setShowModal(true);
    console.log(payment);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleVacacion = (payment) => {
    const diasVacaciones = 15;

    const salarioBono =
      parseFloat(payment.salarioBono) || parseFloat(payment.cantidad);

    const salarioVacaciones = parseFloat((payment.cantidad / 2) * 0.3);

    let sumTotal = parseFloat(salarioBono + salarioVacaciones);

    sumTotal.toFixed(2);
    const updatedPayment = {
      ...payment,
      vacationsAmount: salarioVacaciones.toFixed(2),
    };
    console.log(
      "Datos de pago antes de la actualización con vacaciones:",
      updatedPayment
    );

    // Calcula la renta para este pago
    const isssCalculado = calcularISSS(sumTotal);
    const afpCalculado = calcularAFP(sumTotal);
    const rentaCalculada = calcularRenta(sumTotal, isssCalculado, afpCalculado);
    const liquid = parseFloat(
      sumTotal - isssCalculado - afpCalculado - rentaCalculada
    );

    updatedPayment.isss = parseFloat(isssCalculado);
    updatedPayment.afp = parseFloat(afpCalculado);
    updatedPayment.renta = parseFloat(rentaCalculada);
    updatedPayment.liquidSalary = liquid.toFixed(2);
    console.log(
      "Datos de pago después de la actualización con vacaciones:",
      updatedPayment
    );

    // Realiza una solicitud PUT para actualizar el pago en la base de datos
    fetch(`/api/pagos/${payment.id}`, {
      method: "PUT",
      body: JSON.stringify(updatedPayment), // Enviar el objeto "updatedPayment" actualizado
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Error al actualizar los datos del pago en la base de datos"
          );
        }
      })
      .catch((error) => {
        console.error(
          "Error al actualizar los datos del pago en la base de datos:",
          error
        );
      });

    setHasVacation(true);

    const updatedPayments = employeePayments.map((p) => {
      if (p.id === payment.id) {
        return updatedPayment;
      }
      return p;
    });

    setEmployeePayments(updatedPayments);

    // Resto del código...
  };

  const handleSaveHours = async () => {
    const payment = modalData.payment; // Accede al objeto "payment" dentro de modalData
    console.log("Datos de pago antes de la actualización:", payment);

    const salarioBase = parseFloat(payment.cantidad);
    const recargoDiurno = 2; // 100% de recargo
    const recargoNocturno = 2.25; // 100% de recargo + 25% de recargo
    const valorHoraDiurna = (salarioBase / 160) * recargoDiurno; // Suponiendo 160 horas de trabajo al mes
    const valorHoraNocturna = (salarioBase / 160) * recargoNocturno; // Suponiendo 160 horas de trabajo al mes
    payment.horasDiurnas = parseInt(horasDiurnas);
    payment.horasNocturnas = parseInt(horasNocturnas);
    const salarioDiurno = parseFloat(horasDiurnas * valorHoraDiurna);
    const salarioNocturno = parseFloat(horasNocturnas * valorHoraNocturna);
    const sumaTotal = parseFloat(
      salarioBase + salarioDiurno + salarioNocturno + payment.vacationsAmount
    );

    console.log("sin asignar", sumaTotal);
    payment.salarioBono = sumaTotal;
    console.log("asignada", payment.salarioBono);
    // Calcula la renta para este pago
    const isssCalculado = calcularISSS(payment.salarioBono);
    const afpCalculado = calcularAFP(payment.salarioBono);
    const rentaCalculada = calcularRenta(
      payment.salarioBono,
      isssCalculado,
      afpCalculado
    );

    parseFloat(rentaCalculada);
    console.log(rentaCalculada);
    const liquid = parseFloat(
      payment.salarioBono - isssCalculado - afpCalculado - rentaCalculada
    );
    // Actualiza la renta en el pago
    payment.isss = isssCalculado;
    payment.afp = afpCalculado;
    payment.renta = rentaCalculada;
    payment.liquidSalary = liquid.toFixed(2);
    console.log("Datos de pago después de la actualización:", payment);

    // Realiza una solicitud PUT para actualizar el pago en la base de datos
    fetch(`/api/pagos/${payment.id}`, {
      method: "PUT",
      body: JSON.stringify(payment), // Enviar el objeto "payment" actualizado
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Error al actualizar los datos del pago en la base de datos"
          );
        }
      })
      .catch((error) => {
        console.error(
          "Error al actualizar los datos del pago en la base de datos:",
          error
        );
      });

    const updatedPayments = employeePayments.map((p) => {
      if (p.id === payment.id) {
        return payment;
      }
      return p;
    });

    setEmployeePayments(updatedPayments);
    handleCloseModal();
  };

  useEffect(() => {
    fetch("/api/empleados/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener la lista de empleados");
        }
        return response.json();
      })
      .then((data) => setEmpleados(data))
      .catch((error) =>
        console.error("Error al obtener la lista de empleados:", error)
      );
  }, [employeePayments]);

  return (
    <div className="container bg-primary pb-4 my-4">
      <h1 className="text-center text-light">Gestión de Empleados</h1>
      <div className="card my-4">
        <div className="card-body">
          <h2 className="card-title">Lista de Empleados</h2>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Puesto</th>
                <th>Fecha de Contratación</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((employee) => (
                <tr key={employee.id} onClick={() => onEmpleadoClick(employee)}>
                  <td>{employee.nombre}</td>
                  <td>{employee.apellido}</td>
                  <td>{employee.relacionLaboral}</td>
                  <td>
                    {new Date(employee.fechaContratacion).toLocaleDateString()}
                  </td>
                  <div className="row  gap-0 column-gap-3">
                    <button
                      className="btn btn-primary btn-sm col-5"
                      onClick={openEmployeePaymentsModal}
                    >
                      Declaración de Renta
                    </button>
                    <br />
                    <button
                      className="btn btn-primary btn-sm col-5"
                      onClick={handleOpenCalculoIndemnizacionModal}
                    >
                      Calculo Indemnización Inmediata
                    </button>
                  </div>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Link href="../">
        <button className="btn btn-secondary">Regresar</button>
      </Link>
      {selectedEmployee && (
        <div className="card my-4">
          <div className="card-body">
            <h2 className="card-title">
              Detalle de Pagos de {selectedEmployee.nombre}
            </h2>
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Fecha de Pago</th>
                  <th>Cantidad</th>
                  <th>Horas Diurnas</th>
                  <th>Horas Nocturnas</th>
                  <th>Salario más Bono</th>
                  <th>ISSS</th>
                  <th>AFP</th>
                  <th>Renta</th>
                  <th>Salario Vacaciones</th>
                  <th>Salario Liquido</th>
                </tr>
              </thead>
              <tbody>
                {employeePayments.map((payment) => {
                  return (
                    <tr key={payment.id}>
                      <td>{new Date(payment.fecha).toLocaleDateString()}</td>
                      <td>{Math.round(payment.cantidad)}</td>
                      <td>{payment.horasDiurnas}</td>
                      <td>{payment.horasNocturnas}</td>
                      <td>{payment.salarioBono}</td>
                      <td>{payment.isss}</td>
                      <td>{payment.afp}</td>
                      <td>{payment.renta}</td>
                      <td>{payment.vacationsAmount}</td>
                      <td>{payment.liquidSalary}</td>
                      <div className="row  gap-0 column-gap-3">
                        <button
                          className="btn btn-primary btn-sm col-5"
                          onClick={() => handleShowModal(payment)}
                        >
                          Agregar Horas
                        </button>
                        <br />
                        <button
                          className="btn btn-primary btn-sm col-5"
                          onClick={() => handleVacacion(payment)}
                          disabled={hasVacation}
                        >
                          Agregar vacaciones
                        </button>
                      </div>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Modal show={showModal} onClose={handleCloseModal}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Agregar Horas</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={handleCloseModal}
            ></button>
          </div>
          <div className="modal-body">
            {/* Formulario para ingresar las horas */}
            <form>
              <div className="mb-3">
                <label htmlFor="horasDiurnas" className="form-label">
                  Horas Diurnas
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="horasDiurnas"
                  value={horasDiurnas}
                  onChange={(e) => setHorasDiurnas(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="horasNocturnas" className="form-label">
                  Horas Nocturnas
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="horasNocturnas"
                  value={horasNocturnas}
                  onChange={(e) => setHorasNocturnas(e.target.value)}
                />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveHours}
            >
              Guardar Cambios
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={handleCloseModal}
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        show={showEmployeePaymentsModal}
        onHide={closeEmployeePaymentsModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Declaración de Renta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEmployee && (
            <Declaracion
              employeeNombre={selectedEmployee.nombre}
              employeeApellido={selectedEmployee.apellido}
              employeeId={selectedEmployee.id}
              employeePayments={employeePayments}
              employeeContratacion={selectedEmployee.fechaContratacion}
              employeeSalario={selectedEmployee.salarioBase}
            />
          )}
        </Modal.Body>
      </Modal>
      <Modal
        show={showCalculoIndemnizacionModal}
        onHide={handleCloseCalculoIndemnizacionModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Cálculo de Indemnización</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEmployee && (
            <Indemnizacion
              employeeNombre={selectedEmployee.nombre}
              employeeApellido={selectedEmployee.apellido}
              employeeSalario={selectedEmployee.salarioBase}
              employeeContratacion={selectedEmployee.fechaContratacion}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
