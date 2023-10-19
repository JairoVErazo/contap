"use client";
import { useState } from "react";
import Link from "next/link";

async function submitEmployee(employeeData) {
  console.log("Enviando datos al servidor:", employeeData);

  try {
    const response = await fetch(`/api/empleados`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(employeeData),
    });

    if (response.status === 200) {
      const result = await response.json();
      console.log("Respuesta del servidor:", result);
      alert(result.message);
    } else {
      const errorData = await response.json();
      console.error("Error del servidor:", errorData);
      alert(`Error: ${errorData.message}`);
    }
  } catch (error) {
    console.error("Error al enviar datos al servidor:", error);
    alert("Ocurrió un error al enviar el formulario.");
  }
}
export default function EmpleadoForm() {
  const [datosEmpleado, setDatosEmpleado] = useState({
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    relacionLaboral: "",
    fechaContratacion: "",
    salarioBase: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatosEmpleado({ ...datosEmpleado, [name]: value });
  };

  const handleSubmit = () => {
    submitEmployee(datosEmpleado);
    setDatosEmpleado({
      nombre: "",
      apellido: "",
      fechaNacimiento: "",
      relacionLaboral: "",
      fechaContratacion: "",
      salarioBase: "",
    });
  };

  return (
    <div className="container bg-primary mt-5">
      <h1 className="text-center text-light mb-3">
        Formulario de Registro de Empleado asalariado
      </h1>
      <form>
        <div className="row justify-content-center">
          <div className="col-4">
            <div className="form-group">
              <label htmlFor="nombre" className="text-light">
                Nombre
              </label>
              <input
                type="text"
                className="form-control"
                id="nombre"
                name="nombre"
                value={datosEmpleado.nombre}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="col-4">
            <div className="form-group">
              <label htmlFor="apellido" className="text-light">
                Apellido
              </label>
              <input
                type="text"
                className="form-control"
                id="apellido"
                name="apellido"
                value={datosEmpleado.apellido}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-4">
            <div className="form-group">
              <label htmlFor="fechaNacimiento" className="text-light">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                className="form-control"
                id="fechaNacimiento"
                name="fechaNacimiento"
                value={datosEmpleado.fechaNacimiento}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="col-4">
            <div className="form-group">
              <label htmlFor="relacionLaboral" className="text-light">
                Relación Laboral
              </label>
              <input
                type="text"
                className="form-control"
                id="relacionLaboral"
                name="relacionLaboral"
                value={datosEmpleado.relacionLaboral}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-4">
            <div className="form-group">
              <label htmlFor="fechaContratacion" className="text-light">
                Fecha de Contratación
              </label>
              <input
                type="date"
                className="form-control"
                id="fechaContratacion"
                name="fechaContratacion"
                value={datosEmpleado.fechaContratacion}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="col-4">
            <div className="form-group">
              <label htmlFor="salarioBase" className="text-light">
                Salario Base
              </label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                id="salarioBase"
                name="salarioBase"
                value={datosEmpleado.salarioBase}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        <br />
        <div className="row justify-content-center">
          <button
            type="button"
            className="col-8 btn btn-light btn-lg mb-5"
            onClick={handleSubmit}
          >
            Registrar Empleado
          </button>
        </div>
      </form>
      <Link href="../">
        <button className="btn btn-secondary">Regresar</button>
      </Link>
    </div>
  );
}
