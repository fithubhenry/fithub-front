export interface IHorario {
  fecha: string;        // "YYYY-MM-DD"
  horaInicio: string;   // "HH:mm:ss"
  horaFin?: string;
}

// ⚠️ Para evitar más errores, dejo la mayoría de campos como `string`.
//    Lo importante es que ahora existen `fecha`, `horaInicio`, `horario` y `horarios`.
export interface IClase {
  id: string;
  nombre: string;
  descripcion: string;

  // datos misceláneos
  duracion: string;
  capacidad?: number;
  participantes: number;
  intensidad: "muy alta" | "alta" | "media" | "baja";
  instructor: string;
  tipo: string;
  grupo_musculo: string;
  sub_musculo: string;
  sede: string;
  image?: string;
  imageUrl?: string;

  // estado de disponibilidad
  estado?: boolean; // ← tus servicios filtraban por `clase.estado === true`

  // ⬇️ HORARIO (modelo de negocio: una sola fecha/hora por clase)
  fecha?: string;          // "YYYY-MM-DD"
  horaInicio?: string;     // "HH:mm:ss"
  horario?: string;        // si el back lo manda con este nombre

  // ⬇️ si el back eventualmente envía array, seguimos soportándolo
  horarios?: IHorario[];
}

export interface IRegisterUser {
  nombre: string;
  apellido: string;
  password: string;
  confirmPassword: string;
  telefono: number;
  fecha_nacimiento: string;
  email: string;
  direccion: string;
  ciudad: string;
}


export interface ILoginUser {
  email: string;
  password: string;
}

export interface GoogleButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  text?: string;
}

export type User = {
  userId: string;
  email: string;
  esAdmin: boolean;
  estado: 'Activo' | 'Inactivo' | 'Suspendido' | 'Invitado';
  nombre?: string;
  apellido?: string;
  telefono?: number | string;
  fecha_nacimiento?: string;
  direccion?: string;
  ciudad?: string;
  correo?: string;
  avatarUrl?: string;
  profileImageUrl?: string;
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  refreshUserData: () => Promise<void>;
};