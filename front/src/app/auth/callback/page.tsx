"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Cookies from "js-cookie";
import Loader from "@/components/Loader/Loader";

export const dynamic = "force-dynamic";

export default function GoogleCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Decodificar el JWT para obtener el estado
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.estado && payload.estado === 'Inactivo') {
        // Mostrar toast y no loguear
        import('react-toastify').then(({ toast }) => {
          toast.error('El usuario fue eliminado y no puede iniciar sesión. Por favor contactar con administración: fithub.soporte@gmail.com', {
            autoClose: 5000
          });
        });
        return;
      }
      Cookies.set("token", token, { expires: 7 });
      router.replace("/profile");
    }
  }, [router]);

  return <Loader text="Procesando login con Google..." />;
}
