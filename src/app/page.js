import EmpleadoForm from "@/componets/EmpleadoForm";
import Link from "next/link";
import Image from "next/image";
import logo from "../../public/logo.png"
export const dynamic = "force-dynamic";

function page() {
  return (
    <div className="container text-center">
      <div>
      <Image
      src={logo}
      alt="Picture of the author"
      className="mb-5"
      height={300}
    />
      </div>
    <div className="row justify-content-center">
      <div className="col-md-4">
        <div className="card text-white bg-primary mb-3">
          <div className="card-header">PINKOILYN AUTOMOVILES</div>
          <div className="card-body">
            <h4 className="card-title">Registro de Empleado</h4>
            <p className="card-text">
              Formulario de registro de empleado a planilla
            </p>
            <Link href="/registro">
              <button className="btn btn-light">Ir a Registro</button>
            </Link>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card text-black secondary mb-3">
          <div className="card-header">PINKOILYN AUTOMOVILES</div>
          <div className="card-body">
            <h4 className="card-title">Gestion de empleados</h4>
            <p className="card-text">
              Gestión y verificación de datos de los empleados
            </p>
            <Link href="/gestion">
              <button className="btn btn-primary">Ir a Gestión</button> {/* Botón para redirigir a la página de gestión */}
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
export default page;
