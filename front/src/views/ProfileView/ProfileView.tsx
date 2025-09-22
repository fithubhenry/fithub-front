"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { getUserById } from "@/services/userService";
import { useState } from "react";
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
  const etiquetaPorRol: Record<"guest" | "registered" | "premium", string> = {
    guest: "Invitado",
    registered: "Registrado",
    premium: "Premium",
  };

  const esInvitado = !isAuthenticated;
  const esRegistrado = isAuthenticated && user?.estado === "Invitado";
  const esPremium = isAuthenticated && user?.estado === "Activo";


  // Subida al backend
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user?.userId) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const token = Cookies.get("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile-image/${user.userId}`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error("Error al subir la imagen");
      const data = await res.json();
      setAvatarUrl(data.imageUrl || "");
      if (user && setUser) {
        setUser({
          ...user,
          avatarUrl: data.imageUrl || "",
          profileImageUrl: data.imageUrl || ""
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
    const nombreValue = (document.getElementById("nombre") as HTMLInputElement)?.value;
    const payload: Record<string, any> = {
      email: (document.getElementById("email") as HTMLInputElement)?.value,
      nombre: nombreValue,
      apellido: (document.getElementById("apellido") as HTMLInputElement)?.value,
      fecha_nacimiento: (document.getElementById("fecha_nacimiento") as HTMLInputElement)?.value,
      direccion: (document.getElementById("direccion") as HTMLInputElement)?.value,
      ciudad: (document.getElementById("ciudad") as HTMLInputElement)?.value,
      ...(password ? { password } : {}),
    };
    if (telefonoValue && !isNaN(Number(telefonoValue))) {
      payload.telefono = Number(telefonoValue);
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Error al actualizar datos");
        return;
      }
      toast.success("Datos actualizados correctamente");
      setFullUser(data);
      if (setUser) setUser({
        ...user,
        ...data,
        profileImageUrl: data.profileImageUrl ?? user.profileImageUrl
      });
    } catch {
      toast.error("Error al actualizar datos");
    }
  }

  return (
   <div className="min-h-screen bg-black pt-20 px-6">
  <div className="max-w-3xl mx-auto bg-black  border-[#fee600] rounded-2xl border-2 p-6 shadow-[6px_8px_24px_0px_rgba(253,230,0,0.4)]">
    <h1 className="text-center text-2xl font-anton text-[#fee600]">MI PERFIL</h1>

    {/* Encabezado con avatar, datos y etiqueta de rol */}
    <div className="mt-6 flex items-center gap-4">
      <div
        className="w-16 h-16 rounded-full bg-slate-700 border border-slate-600 overflow-hidden flex items-center justify-center cursor-pointer group"
        onClick={() => !esInvitado && document.getElementById('avatarInput')?.click()}
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
          <span className="text-gray-400 text-xs">Sin foto</span>
        )}
      </div>
      <div>
      <p className="text-white font-semibold">{user?.nombre}</p>
      <p className="text-gray-300 text-sm">Email: {fullUser?.email || user?.email}</p>
      </div>

      <span
        className={`ml-auto text-xs px-2 py-1 rounded-full ${
          esPremium
            ? "bg-emerald-500/20 text-emerald-300"
            : "bg-slate-700 text-gray-300 border border-slate-600"
        }`}
      >
        {etiquetaPorRol[esInvitado ? "guest" : esPremium ? "premium" : "registered"]}
      </span>
    </div>

    {/* Input para subir imagen */}
    {!esInvitado && (
      <input
        id="avatarInput"
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={uploading}
        style={{ display: 'none' }}
      />
    )}
  {uploading && <Loader text="Subiendo imagen..." />}

    {/* Aviso para invitados */}
    {esInvitado && (
      <div className="mt-6 p-4 rounded-md bg-yellow-50 text-black border border-[#fee600]">
        <p>
          Estás navegando como <strong>Invitado</strong>. Para editar tus
          datos, iniciá sesión.
        </p>
        <Link
          href="/login"
          className="inline-block mt-3 rounded-lg bg-[#fee600] px-4 py-2 font-semibold text-black hover:bg-yellow-400 transition-colors duration-200"
        >
          Iniciar sesión
        </Link>
      </div>
    )}

    {/* Formulario de datos */}
    <div className="mt-8 space-y-4">
      <h2 className="text-[#fee600] font-semibold">Datos:</h2>

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          <input id="nombre" className="w-full py-3 px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fee600]" placeholder="Nombre" defaultValue={fullUser?.nombre || ""} disabled={esInvitado} />
          <input id="apellido" className="w-full py-3 px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fee600]" placeholder="Apellido" defaultValue={fullUser?.apellido || ""} disabled={esInvitado} />
          <input id="telefono" className="w-full py-3 px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fee600]" placeholder="Teléfono" defaultValue={fullUser?.telefono || ""} disabled={esInvitado} />
          <input id="direccion" className="w-full py-3 px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fee600]" placeholder="Dirección" defaultValue={fullUser?.direccion || ""} disabled={esInvitado} />
          <input id="ciudad" className="w-full py-3 px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fee600]" placeholder="Ciudad" defaultValue={fullUser?.ciudad || ""} disabled={esInvitado} />
          <input id="password" type="password" className="w-full py-3 px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fee600]" placeholder="Nueva contraseña" disabled={esInvitado} />
          
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className={`mt-3 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200
              ${
                esInvitado
                  ? "bg-gray-600 cursor-not-allowed text-gray-300 "
                  : "bg-[#fee600] text-black hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fee600] shadow-lg hover:shadow-xl"
              }`}
            disabled={esInvitado}
          >
            Guardar cambios
          </button>

          {/* Sugerencia de upgrade para usuarios registrados */}
          {esRegistrado && (
            <Link
              href="/pago"
              className="mt-3 px-4 py-2 rounded-lg border border-[#fee600] text-[#fee600] font-semibold hover:bg-[#fee600] hover:text-black transition-colors duration-200"
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
