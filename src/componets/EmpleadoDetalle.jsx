import React, { useEffect, useState } from 'react';

export default function EmpleadoDetalle({ empleadoId }) {
  const [pagos, setPagos] = useState([]);

  useEffect(() => {
    if (empleadoId) {
      // Realiza la solicitud GET para obtener los pagos asociados al empleado
      fetch(`/api/empleados/${empleadoId}/pagos`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Error al obtener los pagos del empleado');
          }
          return response.json();
        })
        .then((data) => setPagos(data))
        .catch((error) =>
          console.error('Error al obtener los pagos del empleado:', error)
        );
    }
  }, [empleadoId]);

  if (!empleadoId) {
    return null; // No mostrar nada si no hay un ID válido
  }

  if (pagos.length === 0) {
    return <div>Cargando...</div>;
  }

  return (
    
    <div>
      <h1>Pagos del Empleado con ID: {empleadoId}</h1>
      <ul>
        {pagos.map((pago) => (
          <li key={pago.id}>
            <p><strong>Fecha de Pago:</strong> {pago.fechaPago}</p>
            <p><strong>Monto:</strong> {pago.monto}</p>
            {/* Agregar más detalles de pago según tus necesidades */}
          </li>
        ))}
      </ul>
    </div>
  );
}

