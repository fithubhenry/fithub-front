"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import TurnosService from "@/services/turnos";
import { cargarSlots, type Slot } from "@/services/slots";

export default function ReservarHorario({ clase }: { clase: any }) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);

  // 👇 Trae “turnos disponibles” y, si no hay, usa clase.horarios
  useEffect(() => {
    cargarSlots(clase.id, clase).then(setSlots);
  }, [clase.id]);

  async function reservar(s: Slot) {
    if (!isAuthenticated) return router.push("/login");
    const usuarioId = (user as any)?.userId || (user as any)?.id || (user as any)?.sub;
    try {
      await TurnosService.crear({
        usuarioId,
        claseId: clase.id,
        fecha: s.fecha,
        horaInicio: s.horaInicio,
        horaFin: s.horaFin,
      });
      toast.success("¡Reserva realizada!");
      router.push("/misTurnos");
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo reservar");
    }
  }

  if (!slots.length) {
    return (
      <div className="mt-4 rounded-md border border-yellow-500/40 bg-yellow-500/5 p-4 text-gray-300">
        No hay horarios publicados para esta clase.
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {slots.map((s, i) => (
        <button
          key={s.id || i}
          onClick={() => reservar(s)}
          className="px-3 py-2 rounded-md border border-yellow-500/40 text-[#fee600] font-semibold hover:bg-[#fee600] hover:text-black"
        >
          {s.fecha} {s.horaInicio.slice(0, 5)}–{s.horaFin.slice(0, 5)} hs
        </button>
      ))}
    </div>
  );
}
