"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import type { TurnoDTO } from "@/services/turnos";
import { getTurnosDesdeUsuario, getTurnosDesdeUsuarioFallback, cancelarTurno } from "@/services/turnos";
import { toast } from "react-toastify";
import Loader from "@/components/Loader/Loader";

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
      .then((data) => {
        // Ensure data is always an array
        setTurnos(Array.isArray(data) ? data : []);
      })
      .catch(async (e) => {
        try {
          const fallbackData = await getTurnosDesdeUsuarioFallback(user.userId);
          setTurnos(Array.isArray(fallbackData) ? fallbackData : []);
        } catch {
          setErr(e.message ?? "Error");
        }
      })
      .finally(() => setLoading(false));
  }, [role, user?.userId]);

  // === Helpers de fecha/estado ===
  const toDate = (t: { fecha: string; horaInicio?: string }) => {
    const hhmm = (t.horaInicio ?? "00:00:00").slice(0, 5); // "HH:mm"
    return new Date(`${t.fecha}T${hhmm}`);
  };

  // Próximos: futuros y NO cancelados | Historial: pasados o cancelados
  const turnosVisibles = useMemo(() => {
    // Ensure turnos is always an array before spreading
    const turnosArray = Array.isArray(turnos) ? turnos : [];
    
    // Helper functions moved inside useMemo to avoid dependency issues
    const esFuturo = (t: TurnoDTO) => toDate(t).getTime() >= Date.now();
    const asc = (a: TurnoDTO, b: TurnoDTO) => toDate(a).getTime() - toDate(b).getTime();
    const desc = (a: TurnoDTO, b: TurnoDTO) => toDate(b).getTime() - toDate(a).getTime();
    
    if (mostrarHistorial) {
      return [...turnosArray].filter((t) => t.estado === "CANCELADO" || !esFuturo(t)).sort(desc);
    }
    return [...turnosArray].filter((t) => t.estado !== "CANCELADO" && esFuturo(t)).sort(asc);
  }, [turnos, mostrarHistorial]);

  const puedeCancelar = (t: TurnoDTO) => {
    const esFuturo = (turno: TurnoDTO) => toDate(turno).getTime() >= Date.now();
    return t.estado === "PENDIENTE" && esFuturo(t);
  };

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
    const base = "px-1 py-0.5 sm:px-2 sm:py-1 rounded text-[7px] sm:text-xs tracking-normal whitespace-nowrap leading-tight";
    const m =
      estado === "FINALIZADO"
        ? "bg-emerald-500/20 text-emerald-300"
        : estado === "CANCELADO"
        ? "bg-rose-500/25 text-rose-300"
        : "bg-yellow-500/20 text-yellow-300";
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
              className="inline-block rounded-lg border border-[#fee600] text-[#fee600] px-4 py-2 font-semibold hover:bg-[#fee600] hover:text-black transition cursor-pointer"
            >
              Hazte premium
            </Link>
          </div>
        </div>
      </div>
    );
  }
  if (loading) return (
    <div className="min-h-screen bg-black pt-20 px-6">
      <Loader text="Cargando tus turnos..." />
    </div>
  );
  if (err) return <div className="min-h-screen bg-black pt-20 px-6 text-red-300">Error: {err}</div>;

  // === UI principal ===
  return (
    <div className="min-h-screen bg-black pt-20 px-1 sm:px-6">
      <div className="max-w-3xl mx-auto bg-black border-[#fee600] rounded-xl sm:rounded-2xl border-2 p-2 sm:p-6 shadow-[6px_8px_24px_0px_rgba(253,230,0,0.4)]">
        <h1 className="text-center text-lg sm:text-2xl font-anton text-[#fee600]">MIS TURNOS</h1>

        {/* Tabs */}
        <div className="mt-3 sm:mt-6 flex items-center justify-center gap-1 sm:gap-3">
          <button
            onClick={() => setMostrarHistorial(false)}
            className={`px-2 py-1 sm:px-4 sm:py-2 rounded border font-semibold text-xs sm:text-base transition-colors duration-200 cursor-pointer ${
              !mostrarHistorial
                ? "bg-[#fee600] text-black border-[#fee600] hover:bg-yellow-400"
                : "border-[#fee600] text-[#fee600] hover:bg-[#fee600] hover:text-black"
            }`}
          >
            Próximos
          </button>
          <button
            onClick={() => setMostrarHistorial(true)}
            className={`px-2 py-1 sm:px-4 sm:py-2 rounded border font-semibold text-xs sm:text-base transition-colors duration-200 cursor-pointer ${
              mostrarHistorial
                ? "bg-[#fee600] text-black border-[#fee600] hover:bg-yellow-400"
                : "border-[#fee600] text-[#fee600] hover:bg-[#fee600] hover:text-black"
            }`}
          >
            Historial
          </button>
        </div>

        {/* Información de debug */}
        <div className="mt-2 sm:mt-4 text-xs text-gray-400 text-center">
          <div className="sm:hidden" style={{ fontSize: '10px' }}>
            {turnosVisibles.length} turnos
          </div>
          <div className="hidden sm:block">
            Usuario ID: {user?.userId} | Total turnos: {turnos.length} | Mostrando: {turnosVisibles.length}
          </div>
        </div>

        {/* Tabla */}
        <div className="mt-3 sm:mt-6 overflow-x-auto rounded border border-[#fee600]">
          {turnosVisibles.length === 0 ? (
            <div className="p-2 sm:p-4 bg-yellow-50 text-black text-xs sm:text-sm">
              {turnos.length === 0 
                ? "No tienes turnos reservados aún." 
                : `No hay turnos en esta vista (${mostrarHistorial ? 'historial' : 'próximos'}).`
              }{" "}
              <Link href="/clases" className="underline font-semibold">
                Ir a clases
              </Link>
            </div>
          ) : (
            <table className="w-full text-white min-w-[350px]">
              <thead className="bg-yellow-500/10">
                <tr>
                  <th className="px-0.5 py-1 sm:p-3 text-left text-[9px] sm:text-sm font-bold">Clase</th>
                  <th className="px-0.5 py-1 sm:p-3 text-left text-[9px] sm:text-sm font-bold">Fecha</th>
                  <th className="px-0.5 py-1 sm:p-3 text-center text-[9px] sm:text-sm font-bold">Estado</th>
                  {hayAcciones && <th className="px-0.5 py-1 sm:p-3 text-center text-[9px] sm:text-sm font-bold w-10 sm:w-auto sm:text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {turnosVisibles.map((t) => (
                  <tr key={t.id} className="border-t border-gray-600">
                    <td className="px-0.5 py-1 sm:p-3">
                      <div className="text-[9px] sm:text-sm font-medium text-white leading-tight">
                        {t.clase?.nombre ?? "Clase no disponible"}
                      </div>
                      {t.clase?.instructor && (
                        <div className="text-[8px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 leading-tight">
                          con {t.clase.instructor}
                        </div>
                      )}
                    </td>
                    <td className="px-0.5 py-1 sm:p-3">
                      <div className="text-[9px] sm:text-sm leading-tight">
                        <div>{t.fecha}</div>
                        <div className="text-[8px] sm:text-xs text-gray-400">{t.horaInicio?.slice(0, 5) ?? ""} hs</div>
                      </div>
                    </td>
                    <td className="px-0.5 py-1 sm:p-3 text-center">
                      <Pill estado={t.estado} />
                    </td>
                    {hayAcciones && (
                      <td className="px-0.5 py-1 sm:p-3 text-center sm:text-right">
                        {puedeCancelar(t) && (
                          <button onClick={() => handleCancelar(t.id)} className="px-0.5 py-0.5 sm:px-3 sm:py-1 rounded border border-gray-400 hover:border-red-500 hover:text-red-400 transition-colors text-[8px] sm:text-sm cursor-pointer w-5 h-5 sm:w-auto sm:h-auto flex items-center justify-center">
                            <span className="sm:hidden">✕</span>
                            <span className="hidden sm:inline">Cancelar</span>
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
