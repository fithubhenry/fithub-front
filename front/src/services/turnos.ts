// src/services/turnos.ts
import Cookies from "js-cookie";
const APIURL = process.env.NEXT_PUBLIC_API_URL!;

export type EstadoTurno = "PENDIENTE" | "CONFIRMADO" | "CANCELADO";
export type CrearTurnoDTO = { usuarioId: string; claseId: string; fecha: string; horaInicio: string; horaFin: string; };
export type TurnoDTO = {
  id: string; fecha: string; horaInicio?: string; horaFin?: string; estado: EstadoTurno;
  clase?: { id: string; nombre: string; imageUrl?: string; instructor?: string };
};

function getToken() { return Cookies.get("token") || (typeof window !== "undefined" ? localStorage.getItem("token") : null); }

export async function crear(dto: CrearTurnoDTO) {
  const token = getToken();
  const res = await fetch(`${APIURL}/turnos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error((await res.text()) || "Error al crear turno");
  return res.json();
}
export async function getTurnosDesdeUsuario(userId: string) {
  const token = getToken();
  const res = await fetch(`${APIURL}/users/${userId}`, { headers: token ? { Authorization: `Bearer ${token}` } : {}, cache: "no-store" });
  if (!res.ok) throw new Error((await res.text()) || "No se pudo obtener el usuario");
  const user = await res.json(); return user?.turnos ?? [];
}
export async function actualizarEstado(id: string, estado: EstadoTurno) {
  const token = getToken();
  const res = await fetch(`${APIURL}/turnos/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ estado }),
  });
  if (!res.ok) throw new Error((await res.text()) || "No se pudo actualizar el estado");
  return res.json();
}
export async function cancelarTurno(id: string) { return actualizarEstado(id, "CANCELADO"); }

const TurnosService = { crear, getTurnosDesdeUsuario, actualizarEstado, cancelarTurno };
export default TurnosService;
