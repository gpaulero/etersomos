import { redirect } from "next/navigation";

// El registro público de alumnos está deshabilitado:
// las cuentas las crea el admin o se crean automáticamente al pagar.
export default function RegistroPage() {
  redirect("/aula/login");
}
