"use client";

import { IClase } from "@/types";
import { Clock, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";


type HorarioOk = { fecha: string; horaInicio: string; horaFin: string };
function isHorarioOk(x: any): x is HorarioOk {
  return x && typeof x.fecha==="string" && typeof x.horaInicio==="string" && typeof x.horaFin==="string";
}
function esFuturo(h: HorarioOk) {
  const [y,m,d] = h.fecha.split("-").map(Number);
  const [hh,mm] = h.horaInicio.split(":").map(Number);
  return new Date(y,(m??1)-1,d,hh??0,mm??0,0).getTime() >= Date.now();
}





type Props = IClase;

const estilosIntensidad: Record<IClase["intensidad"], string> = {
  "muy alta": "bg-red-100 text-black",
  alta: "bg-orange-100 text-black",
  media: "bg-yellow-100 text-black",
  baja: "bg-green-100 text-black",
};

function ActivityCard({
  id,
  nombre,
  descripcion,
  duracion,
  participantes,
  intensidad,
  imageUrl,
  // Estos pueden existir en tu IClase, pero ya NO se usan para el POST:
  fecha,
  horaInicio,
  horario,
  horarios,
}: Props) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const esInvitado = !isAuthenticated;
  const esRegistrado = isAuthenticated && user?.estado === "Invitado";
  const esPremium = isAuthenticated && user?.estado === "Activo";

  const textoBoton = esPremium ? "Reservar Clase" : esRegistrado ? "Solo Premium" : "Iniciar sesión";
  const deshabilitado = esRegistrado;

async function manejarClick(e: React.MouseEvent<HTMLButtonElement>) {
  e.preventDefault();
  e.stopPropagation();

  if (esInvitado) return router.push("/login");
  if (esRegistrado) return; // solo premium puede reservar

  // Siempre redirigir a la página de detalle para seleccionar horario
  toast.info(`Ve los horarios disponibles para ${nombre} y selecciona el que prefieras.`);
  return router.push(`/clases/${id}`);
}




  return (
    <div className="group rounded-xl border border-border/60 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Imagen y contenido clickeable para ir al detalle */}
      <Link href={`/clases/${id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={nombre}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
          />
          <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/10" />
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-lg font-bold leading-snug group-hover:text-primary transition-colors">
              {nombre}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{descripcion}</p>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{duracion}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{participantes} inscriptos</span>
            </div>
          </div>

          <div className="mt-1">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${estilosIntensidad[intensidad]}`}>
              Intensidad: {intensidad}
            </span>
          </div>
        </div>
      </Link>

      {/* Botón de reserva fuera del Link para evitar conflictos */}
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={manejarClick}
          disabled={deshabilitado}
          className={`w-full rounded-md px-4 py-2.5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-colors ${
            deshabilitado
              ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
              : "bg-black text-[#fee600] border border-[#fee600] hover:bg-[#fee600] hover:text-black cursor-pointer"
          }`}
        >
          {textoBoton}
        </button>
      </div>
    </div>
  );
}

export default ActivityCard;

