// src/app/misTurnos/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import type { TurnoDTO } from "@/services/turnos";
import { getTurnosDesdeUsuario, cancelarTurno } from "@/services/turnos";
import { toast } from "react-toastify";

export default function MisTurnosPage() {
  const { user } = useAuth();
  const role = user?.estado; // "Activo" = premium

  const [turnos, setTurnos] = useState<TurnoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  useEffect(() => {
    if (role !== "Activo" || !user?.userId) {
      setLoading(false);
      return;
    }
    getTurnosDesdeUsuario(user.userId)
      .then(setTurnos)
      .catch((e) => setErr(e.message ?? "Error"))
      .finally(() => setLoading(false));
  }, [role, user?.userId]);

  // === Helpers de fecha/estado ===
  const toDate = (t: { fecha: string; horaInicio?: string }) => {
    const hhmm = (t.horaInicio ?? "00:00:00").slice(0, 5); // "HH:mm"
    return new Date(`${t.fecha}T${hhmm}`);
  };
  const esFuturo = (t: TurnoDTO) => toDate(t).getTime() >= Date.now();
  const puedeCancelar = (t: TurnoDTO) => t.estado === "PENDIENTE" && esFuturo(t);

  const asc = (a: TurnoDTO, b: TurnoDTO) => toDate(a).getTime() - toDate(b).getTime();
  const desc = (a: TurnoDTO, b: TurnoDTO) => toDate(b).getTime() - toDate(a).getTime();

  // Próximos: futuros y NO cancelados | Historial: pasados o cancelados
  const turnosVisibles = useMemo(() => {
    if (mostrarHistorial) {
      return [...turnos].filter((t) => t.estado === "CANCELADO" || !esFuturo(t)).sort(desc);
    }
    return [...turnos].filter((t) => t.estado !== "CANCELADO" && esFuturo(t)).sort(asc);
  }, [turnos, mostrarHistorial]);

  const hayAcciones = turnosVisibles.some(puedeCancelar);

  // Cancelar (optimistic UI)
  const handleCancelar = async (id: string) => {
    const prev = turnos;
    setTurnos((t) => t.map((x) => (x.id === id ? { ...x, estado: "CANCELADO" } : x)));
    try {
      await cancelarTurno(id);
      toast.success("Turno cancelado");
    } catch (e: any) {
      setTurnos(prev);
      toast.error(e.message ?? "No se pudo cancelar");
    }
  };

  // Pill de estado
  const Pill = ({ estado }: { estado: TurnoDTO["estado"] }) => {
    const base = "px-2 py-1 rounded-md text-xs tracking-wide";
    const m =
      estado === "CONFIRMADO"
        ? "bg-emerald-500/20 text-emerald-300"
        : estado === "CANCELADO"
        ? "bg-rose-500/25 text-rose-300"
        : "bg-yellow-500/20 text-yellow-800";
    return <span className={`${base} ${m}`}>{estado}</span>;
  };

  // === Vistas no premium / loading / error ===
  if (role !== "Activo") {
    return (
      <div className="min-h-screen bg-black pt-20 px-6">
        <div className="max-w-3xl mx-auto bg-black border-[#fee600] rounded-2xl border-2 p-6 shadow-[6px_8px_24px_0px_rgba(253,230,0,0.4)]">
          <h1 className="text-center text-2xl font-anton text-[#fee600]">SOLO PREMIUM</h1>
          <div className="mt-4 text-center">
            <Link
              href="/pago"
              className="inline-block rounded-lg border border-[#fee600] text-[#fee600] px-4 py-2 font-semibold hover:bg-[#fee600] hover:text-black transition"
            >
              Hazte premium
            </Link>
          </div>
        </div>
      </div>
    );
  }
  if (loading) return <div className="min-h-screen bg-black pt-20 px-6 text-[#fee600]">Cargando tus turnos…</div>;
  if (err) return <div className="min-h-screen bg-black pt-20 px-6 text-red-300">Error: {err}</div>;

  // === UI principal ===
  return (
    <div className="min-h-screen bg-black pt-20 px-6">
      <div className="max-w-3xl mx-auto bg-black border-[#fee600] rounded-2xl border-2 p-6 shadow-[6px_8px_24px_0px_rgba(253,230,0,0.4)]">
        <h1 className="text-center text-2xl font-anton text-[#fee600]">MIS TURNOS</h1>

        {/* Tabs */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setMostrarHistorial(false)}
            className={`px-4 py-2 rounded-lg border font-semibold transition-colors duration-200 ${
              !mostrarHistorial
                ? "bg-[#fee600] text-black border-[#fee600] hover:bg-yellow-400"
                : "border-[#fee600] text-[#fee600] hover:bg-[#fee600] hover:text-black"
            }`}
          >
            Próximos
          </button>
          <button
            onClick={() => setMostrarHistorial(true)}
            className={`px-4 py-2 rounded-lg border font-semibold transition-colors duration-200 ${
              mostrarHistorial
                ? "bg-[#fee600] text-black border-[#fee600] hover:bg-yellow-400"
                : "border-[#fee600] text-[#fee600] hover:bg-[#fee600] hover:text-black"
            }`}
          >
            Historial
          </button>
        </div>

        {/* Tabla */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-[#fee600]">
          {turnosVisibles.length === 0 ? (
            <div className="p-4 bg-yellow-50 text-black">
              No hay turnos en esta vista.{" "}
              <Link href="/clases" className="underline font-semibold">
                Ir a clases
              </Link>
            </div>
          ) : (
            <table className="w-full text-white">
              <thead className="bg-yellow-500/10">
                <tr>
                  <th className="p-3 text-left">Clase</th>
                  <th className="p-3 text-left">Fecha</th>
                  <th className="p-3 text-left">Estado</th>
                  {hayAcciones && <th className="p-3 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {turnosVisibles.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="p-3">{t.clase?.nombre ?? "—"}</td>
                    <td className="p-3">
                      {t.fecha} {t.horaInicio?.slice(0, 5) ?? ""} hs
                    </td>
                    <td className="p-3">
                      <Pill estado={t.estado} />
                    </td>
                    {hayAcciones && (
                      <td className="p-3 text-right">
                        {puedeCancelar(t) && (
                          <button onClick={() => handleCancelar(t.id)} className="px-3 py-1 rounded border">
                            Cancelar
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
