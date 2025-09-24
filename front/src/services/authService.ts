import { ILoginUser, IRegisterUser } from "@/types";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

export async function register(userData: IRegisterUser) {
  try {

    const response = await fetch(`${APIURL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Error al registrar usuario");
    }

    const parsedResponse = await response.json();

    // Si el backend devuelve el objeto usuario creado
    if (parsedResponse && parsedResponse.id) {
      toast.success("Usuario registrado correctamente");
      // Devolvemos la respuesta completa con el status
      return {
        ...parsedResponse,
        status: response.status
      };
    } else {
      toast.error("Fallo al registrar el usuario");
    }
  } catch (error: any) {
    toast.error("Fallo al registrar el usuario: " + error.message);
    throw new Error(error);
  }
}


export async function login(userData: ILoginUser) {
  try {

    const response = await fetch(`${APIURL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Credenciales inválidas");
    }

    const parsedResponse = await response.json();

    if (parsedResponse.access_token) {
      // Decodificar el JWT para obtener el estado
      const base64Payload = parsedResponse.access_token.split('.')[1];
      const payload = JSON.parse(atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.estado && payload.estado === 'Inactivo') {
        toast.error('El usuario fue eliminado y no puede iniciar sesión. Por favor contactar con administración: fithub.soporte@gmail.com', {
          autoClose: 5000
        });
        return null;
      }
      // Guardar token en cookies
      Cookies.set("token", parsedResponse.access_token, { expires: 7 });

      toast.success("Usuario logueado correctamente");
      // Devolvemos la respuesta completa con el status
      return {
        ...parsedResponse,
        status: response.status
      };
    } else {
      toast.error("Fallo al loguear el usuario");
    }
  } catch (error: any) {
    toast.error("Fallo al loguear el usuario: " + error.message);
    throw new Error(error);
  }
}