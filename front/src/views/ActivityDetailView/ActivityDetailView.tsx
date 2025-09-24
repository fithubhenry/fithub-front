// ActivityDetailView.tsx (o donde lo tengas)
"use client";

import { IClase } from "@/types";
import Image from "next/image";
import { Clock, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ReservarHorario from "@/components/ReservarHorario/ReservarHorario";

const intensityStyles: Record<IClase["intensidad"], string> = {
  "muy alta": "bg-red-100 text-black",
  alta: "bg-orange-100 text-black",
  media: "bg-yellow-100 text-black",
  baja: "bg-green-100 text-black",
};

export default function ActivityDetailView({ clase }: { clase: IClase }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  if (!clase) return <div className="p-6">Clase no encontrada</div>;

  const esInvitado = !isAuthenticated;
  const esRegistrado = isAuthenticated && user?.estado === "Invitado";
  const esPremium = isAuthenticated && user?.estado === "Activo";

  const manejarClickPremium = () => {
    if (esInvitado) return router.push("/login");
    if (esRegistrado) return router.push("/pago");
  };

  return (
    <div className="mt-10 max-w-5xl mx-auto p-6 bg-white rounded-xl shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
          <Image
            src={clase.imageUrl || "/placeholder.svg"}
            alt={clase.nombre}
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold">{clase.nombre}</h2>
          <p className="text-gray-700">{clase.descripcion}</p>

          <div className="flex gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {clase.duracion}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {clase.participantes} inscriptos
            </span>
          </div>

          <div className="mt-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${intensityStyles[clase.intensidad]}`}>
              Intensidad: {clase.intensidad}
            </span>
          </div>

          <div className="text-sm text-gray-600">
            <p>Instructor: {clase.instructor}</p>
            <p>Tipo: {clase.tipo}</p>
            <p>Grupo muscular: {clase.grupo_musculo}</p>
            <p>Músculo específico: {clase.sub_musculo}</p>
            <p>Sede: {clase.sede}</p>
          </div>

          {/* 👉 Zona de reserva */}
          {esPremium ? (
           <ReservarHorario clase={clase} />
          ) : (
            <button
              type="button"
              onClick={manejarClickPremium}
              className="mt-3 w-full rounded-md px-4 py-2.5 text-sm font-semibold bg-black text-[#fee600] border border-[#fee600] hover:bg-[#fee600] hover:text-black transition-colors cursor-pointer"
            >
              {esRegistrado ? "Hazte Premium" : "Iniciar sesión"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
