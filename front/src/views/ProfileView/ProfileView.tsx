"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { getUserById } from "@/services/userService";
import Image from "next/image";
import Loader from "@/components/Loader/Loader";
import { toast } from "react-toastify";

export default function ProfileView() {
  const { user, isAuthenticated, setUser } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [fullUser, setFullUser] = useState<typeof user | null>(null);

  useEffect(() => {
    if (user?.userId) {
      getUserById(user.userId)
        .then(setFullUser)
        .catch(() => setFullUser(null));
    }
  }, [user?.userId]);

  // Sincroniza avatarUrl local con el global
  useEffect(() => {
    if (user?.profileImageUrl) setAvatarUrl(user.profileImageUrl);
  }, [user?.profileImageUrl]);

  // Etiqueta legible según el rol
  const etiquetaPorRol: Record<"guest" | "registered" | "premium" | "admin", string> = {
    guest: "Invitado",
    registered: "Registrado",
    premium: "Premium",
    admin: "Admin",
  };

  const esInvitado = !isAuthenticated;
  const esRegistrado = isAuthenticated && user?.estado === "Invitado";
  const esPremium = isAuthenticated && user?.estado === "Activo";
  const esAdmin = isAuthenticated && user?.esAdmin;

  // Función para obtener el rol del usuario
  const obtenerRolUsuario = () => {
    if (esInvitado) return "guest";
    if (esAdmin) return "admin";
    if (esPremium) return "premium";
    return "registered";
  };

  // Subida al backend
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user?.userId) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const token = Cookies.get("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/profile-image/${user.userId}`,
        { method: "PATCH", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: formData }
      );
      if (!res.ok) throw new Error("Error al subir la imagen");
      const data = await res.json();
      setAvatarUrl(data.imageUrl || "");
      if (user && setUser) {
        setUser({
          ...user,
          avatarUrl: data.imageUrl || "",
          profileImageUrl: data.imageUrl || "",
        });
      }
    } catch {
      toast.error("Error al subir la imagen");
    }
    setUploading(false);
  }

  // Guardar cambios de datos
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.userId) return;
    const token = Cookies.get("token");
    const password = (document.getElementById("password") as HTMLInputElement)?.value;
    const confirmPassword = (document.getElementById("confirmPassword") as HTMLInputElement)?.value;
    if (password && password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    const telefonoValue = (document.getElementById("telefono") as HTMLInputElement)?.value;
    const payload: Record<string, any> = {
      email: (document.getElementById("email") as HTMLInputElement)?.value,
      nombre: (document.getElementById("nombre") as HTMLInputElement)?.value,
      apellido: (document.getElementById("apellido") as HTMLInputElement)?.value,
      fecha_nacimiento: (document.getElementById("fecha_nacimiento") as HTMLInputElement)?.value,
      direccion: (document.getElementById("direccion") as HTMLInputElement)?.value,
      ciudad: (document.getElementById("ciudad") as HTMLInputElement)?.value,
      ...(password ? { password } : {}),
    };
    if (telefonoValue && !isNaN(Number(telefonoValue))) payload.telefono = Number(telefonoValue);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Error al actualizar datos");
        return;
      }
      toast.success("Datos actualizados correctamente");
      setFullUser(data);
      if (setUser) setUser({ ...user, ...data, profileImageUrl: data.profileImageUrl ?? user.profileImageUrl });
    } catch {
      toast.error("Error al actualizar datos");
    }
  }

  return (
    <div className="min-h-screen bg-black pt-16 sm:pt-20 px-3 sm:px-6">
      <div className="max-w-3xl mx-auto bg-black border-[#fee600] rounded-xl sm:rounded-2xl border-2 p-3 sm:p-6 shadow-[6px_8px_24px_0px_rgba(253,230,0,0.4)]">
        {/* Título */}
        <h1 className="text-center text-xl sm:text-2xl font-anton text-[#fee600]">MI PERFIL</h1>

        {/* Encabezado con avatar, datos, badge y —> BOTÓN MIS TURNOS (solo premium) */}
        <div className="mt-3 sm:mt-6 flex items-center gap-2 sm:gap-4">
          <div
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-700 border border-slate-600 overflow-hidden flex items-center justify-center cursor-pointer group"
            onClick={() => !esInvitado && document.getElementById("avatarInput")?.click()}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="avatar"
                width={64}
                height={64}
                className="rounded-full object-cover group-hover:opacity-80 transition-opacity"
              />
            ) : (
              <span className="text-gray-400 text-[10px] sm:text-xs">Sin foto</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm sm:text-base truncate">{user?.nombre}</p>
            <p className="text-gray-300 text-xs sm:text-sm truncate">Email: {fullUser?.email || user?.email}</p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${
                esAdmin
                  ? "bg-red-500/20 text-red-300"
                  : esPremium
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-slate-700 text-gray-300 border border-slate-600"
              }`}
            >
              {etiquetaPorRol[obtenerRolUsuario()]}
            </span>
          </div>
        </div>

        {/* Input para subir imagen */}
        {!esInvitado && (
          <input
            id="avatarInput"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            style={{ display: "none" }}
          />
        )}
        {uploading && <Loader text="Subiendo imagen..." />}

        {/* Aviso para invitados */}
        {esInvitado && (
          <div className="mt-3 sm:mt-6 p-3 sm:p-4 rounded-md bg-yellow-50 text-black border border-[#fee600]">
            <p className="text-sm sm:text-base">
              Estás navegando como <strong>Invitado</strong>. Para editar tus datos, iniciá sesión.
            </p>
            <Link
              href="/login"
              className="inline-block mt-2 sm:mt-3 rounded-lg bg-[#fee600] px-3 sm:px-4 py-1.5 sm:py-2 font-semibold text-sm sm:text-base text-black hover:bg-yellow-400 transition-colors duration-200 cursor-pointer"
            >
              Iniciar sesión
            </Link>
          </div>
        )}

        {/* Formulario de datos */}
        <div className="mt-4 sm:mt-8 space-y-3 sm:space-y-4">
          <h2 className="text-[#fee600] font-semibold text-sm sm:text-base">Datos:</h2>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <input id="nombre" className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fee600] text-sm sm:text-base" placeholder="Nombre" defaultValue={fullUser?.nombre || ""} disabled={esInvitado} />
              <input id="apellido" className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fee600] text-sm sm:text-base" placeholder="Apellido" defaultValue={fullUser?.apellido || ""} disabled={esInvitado} />
              <input id="telefono" className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fee600] text-sm sm:text-base" placeholder="Teléfono" defaultValue={fullUser?.telefono || ""} disabled={esInvitado} />
              <input id="direccion" className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fee600] text-sm sm:text-base" placeholder="Dirección" defaultValue={fullUser?.direccion || ""} disabled={esInvitado} />
              <input id="ciudad" className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fee600] text-sm sm:text-base" placeholder="Ciudad" defaultValue={fullUser?.ciudad || ""} disabled={esInvitado} />
              <input id="password" type="password" className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fee600] text-sm sm:text-base" placeholder="Nueva contraseña" disabled={esInvitado} />
            </div>

            <div className="flex gap-2 sm:gap-3 flex-wrap">
              <button
                type="submit"
                className={`mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${
                  esInvitado
                    ? "bg-gray-600 cursor-not-allowed text-gray-300 "
                    : "bg-[#fee600] text-black hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fee600] shadow-lg hover:shadow-xl cursor-pointer"
                }`}
                disabled={esInvitado}
              >
                Guardar cambios
              </button>

              {/* Enlace Mis turnos para usuarios premium (pero NO para administradores) */}
              {esPremium && !user?.esAdmin && (
                <Link
                  href="/misTurnos"
                  className="mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 border border-[#fee600] text-[#fee600] hover:bg-[#fee600] hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fee600] cursor-pointer"
                >
                  Mis turnos
                </Link>
              )}

              {/* Sugerencia de upgrade para usuarios registrados */}
              {esRegistrado && !user?.esAdmin && (
                <Link
                  href="/pago"
                  className="mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-[#fee600] text-[#fee600] font-semibold hover:bg-[#fee600] hover:text-black transition-colors duration-200 cursor-pointer text-xs sm:text-sm"
                >
                  Hazte premium
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
