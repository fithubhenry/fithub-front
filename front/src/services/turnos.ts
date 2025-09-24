// src/services/turnos.ts
import Cookies from "js-cookie";
const APIURL = process.env.NEXT_PUBLIC_API_URL!;

export type EstadoTurno = "PENDIENTE" | "FINALIZADO" | "CANCELADO";
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
  const res = await fetch(`${APIURL}/users/${userId}`, { 
    headers: token ? { Authorization: `Bearer ${token}` } : {}, 
    cache: "no-store" 
  });
  if (!res.ok) throw new Error((await res.text()) || "No se pudo obtener los turnos");
  const userData = await res.json();
  
  // El endpoint /users/:id devuelve el usuario completo con turnos
  const turnos = userData.turnos || [];
  
  // Normalizar los turnos para asegurar que tengan una estructura consistente
  return turnos.map((turno: any) => ({
    id: turno.id,
    fecha: turno.fecha,
    horaInicio: turno.horaInicio,
    horaFin: turno.horaFin,
    estado: turno.estado,
    clase: turno.clase ? {
      id: turno.clase.id,
      nombre: turno.clase.nombre,
      imageUrl: turno.clase.imageUrl,
      instructor: turno.clase.instructor
    } : {
      id: 'unknown',
      nombre: 'Clase no disponible',
      imageUrl: null,
      instructor: 'N/A'
    }
  }));
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

// Función alternativa para obtener turnos desde el endpoint de todos los turnos
export async function getTurnosDesdeUsuarioFallback(userId: string) {
  const token = getToken();
  const res = await fetch(`${APIURL}/turnos`, { 
    headers: token ? { Authorization: `Bearer ${token}` } : {}, 
    cache: "no-store" 
  });
  if (!res.ok) throw new Error((await res.text()) || "No se pudo obtener los turnos");
  const allTurnos = await res.json();
  
  // Filtrar turnos por userId y normalizar estructura
  return allTurnos
    .filter((turno: any) => turno.user?.id === userId)
    .map((turno: any) => ({
      id: turno.id,
      fecha: turno.fecha,
      horaInicio: turno.horaInicio,
      horaFin: turno.horaFin,
      estado: turno.estado,
      clase: turno.clase ? {
        id: turno.clase.id,
        nombre: turno.clase.nombre,
        imageUrl: turno.clase.imageUrl,
        instructor: turno.clase.instructor
      } : {
        id: 'unknown',
        nombre: 'Clase no disponible',
        imageUrl: null,
        instructor: 'N/A'
      }
    }));
}

const TurnosService = { crear, getTurnosDesdeUsuario, getTurnosDesdeUsuarioFallback, actualizarEstado, cancelarTurno };
export default TurnosService;
