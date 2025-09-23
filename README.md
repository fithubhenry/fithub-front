# FitHub – (Henry • Grupo 4)

Plataforma web para un gimnasio: catálogo de clases, registro/login, suscripción **Premium**, reserva de turnos y panel **Administrador**.

## Demo / Links
- Front (Render): (https://fithub-front-dev.onrender.com)
- Back (Render): https://fithub-back-dev.onrender.com/


---

## Stack técnico
- **Next.js 15** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS**
- **React Context** (Auth + sesión)
- **React-Toastify** (notificaciones)
- **Mercado Pago** (checkout redirigido)
- Deploy sugerido: **Render**

---

## Funcionalidades por rol

### Visitante
- Ver **Home** y **Clases** (solo lectura).
- CTAs a **Login** / **Register**.

### Usuario logueado (Free / Inactivo)
- Ve **Clases**, filtros y detalle.
- Botones de reserva aparecen como **“Solo Premium”**.
- CTA **“Hazte Premium”** → página con beneficios + botón **Pagar**.

### Usuario Premium (Activo)
- Puede **reservar** un horario disponible (POST `/turnos`).
- Acceso a **Mis Turnos** con reservas reales (cuando el back esté operativo para la app).
- Perfil con badge **Premium**.

### Administrador
- **/admin** Dashboard con accesos a:
  - **Usuarios**: KPIs (total, admins, activos), búsqueda, filtros, acciones (quitar admin, eliminar, cambiar estado).
  - **Clases**: listado/ABM (crear, eliminar), capacidad, sede, intensidad, horario.
  - **Pagos** (vista/placeholder) y **Estadísticas** (vista/placeholder).
- Protección de rutas (guard por rol).

---

## Flujo principal (usuario)
1. **Home** → CTA “Empezar ahora” o Navbar.
2. **Clases**:
   - Visitante: **Iniciar sesión**.
   - Logueado Free: **Solo Premium** + “Hazte Premium”.
   - Premium: **Reservar Clase**.
3. **Hazte Premium** → **Checkout** de Mercado Pago.
4. Pago OK → **Premium activo** → puede **Reservar**.
5. **Mis Turnos**: listado de reservas del usuario.

```
Home → Clases → (Free) Hazte Premium → Checkout → Clases (Premium) → Detalle → Reservar → Mis Turnos
```

---

## Estructura del proyecto

```
front/
   ├─ .env
   ├─ .env.local
   ├─ public/
   └─ src/
      ├─ app/                        # Rutas (Next.js App Router)
      │  ├─ page.tsx                 # Home
      │  ├─ layout.tsx               # Layout global
      │  ├─ not-found.tsx            # 404
      │  ├─ favicon.ico
      │  ├─ clases/                  # Listado/Detalle de clases (usa views/*)
      │  ├─ login/                   # Login
      │  ├─ register/                # Registro
      │  ├─ profile/                 # Perfil de usuario
      │  ├─ misTurnos/               # Turnos del usuario
      │  ├─ pago/                    # “Hazte Premium” / pago
      │  └─ admin/                   # Panel administrador
      │
      ├─ components/                 # Componentes UI reutilizables
      │  ├─ Navbar/
      │  ├─ Cards/
      │  ├─ ReservarHorario/
      │  ├─ GoogleButton/
      │  ├─ MpButton/
      │  ├─ Loader/
      │  └─ footer/
      │
      ├─ context/
      │  └─ AuthContext.tsx          # Sesión, token, estado/rol de usuario
      │
      ├─ services/                   # Capa de acceso a datos / negocio
      │  ├─ api.ts                   # Config base de fetch (API URL, headers)
      │  ├─ apiClases.ts             # Fetchers específicos de clases (bajo nivel)
      │  ├─ clasesService.ts         # Lógica de clases (usa apiClases)
      │  ├─ authService.ts           # Login/Register, sesión
      │  ├─ userService.ts           # Datos de usuario
      │  ├─ turnos.ts                # Crear/listar turnos
      │  └─ slots.ts                 # Motor de horarios (API → fallback local)
      │
      ├─ helpers/                    # Utilidades y datos de demo
      │  ├─ clases.json
      │  ├─ demo.json
      │  ├─ preloadClases.ts
      │  └─ validate.ts
      │
      ├─ types/                      # Tipados TS compartidos
      │  ├─ clasesFilters.ts
      │  ├─ RegisterFormValues.ts
      │  └─ index.ts
      │
      └─ views/                      # Vistas/containers usados por app/*
         ├─ ActivityDetailView/
         ├─ ClasesFilterView/
         ├─ Login/
         ├─ ProfileView/
         └─ Register/
```

---

## Autenticación, roles y guards

- **AuthContext** guarda `token` en `Cookies` o `localStorage`, decodifica datos mínimos (`userId`, `estado`, `role`).
- Reglas:
  - `estado === "Activo"` → **Premium** (puede reservar).
  - `role === "admin"` → acceso a `/admin/*`.
- Navbar cambia según el estado del usuario.

---

## Motor de horarios (`services/slots.ts`)
1. Intenta `GET /clases/:id/turnos-disponibles`.
2. Si viene vacío o falla, usa **fallback** `clase.horarios`.
3. Reglas:
   - Normaliza hora a `HH:mm:ss`.
   - Solo **futuros**.
   - Orden ascendente.
4. Devuelve lista final para pintar botones.

---

Cómo usar la aplicación (Guía rápida)

### Acceso
- **Producción:** https://fithub-front-dev.onrender.com
- **Backend:** https://fithub-back-dev.onrender.com/API
> Si corrés local, asegurate de tener `NEXT_PUBLIC_API_URL` configurado.

### Roles y permisos

|      Rol     | Ver clases  | Detalle | Reservar turno    | Mis Turnos  | Admin Panel |
|--------------|-------------|---------|-------------------|-------------|-------------|
| Visitante    |      ✅    |    ✅   |        ❌         |     ❌     |     ❌      |
| Usuario(Free)|      ✅    |    ✅   |❌ (“Solo Premium”)|     ❌     |     ❌      |
| Premium(Activo)|    ✅    |    ✅   |        ✅         |     ✅     |     ❌      |
| Admin |             ✅    |    ✅   |✅ (si es Premium) |     ✅     | ✅ `/admin` |

> El estado **Premium** se refleja en `user.estado === "Activo"`.

### Flujo por rol (resumen)

1) **Visitante**  
   - Entra a **Home** → **Clases** (lectura).  
   - Para reservar: debe **Iniciar sesión y abonar la cuota**.

2) **Usuario Free (logueado, sin pago)**  
   - Ve **Clases** y **Detalle**.  
   - En lugar de “Reservar” verá **“Solo Premium”** + link **Hazte Premium**.

3) **Usuario Premium**  
   - Puede **Reservar** un horario desde el detalle de la clase.  
   - Accede a **Mis Turnos** para ver/cancelar reservas.

4) **Admin**  
   - Entra a **`/admin`** (ruta protegida por rol).  
   - Gestiona **Usuarios**, **Clases** y ve **Dashboard**.

### Paso a paso (usuario)

#### 1) Crear cuenta / Iniciar sesión
- Ir a **Login** o **Register** desde la navbar.  
- Completar email/contraseña.  
- Al iniciar sesión, el sistema guarda un **token** en el navegador y muestra opciones de usuario.

#### 2) Hacerse Premium
- En **Clases** (si sos Free), verás el botón **“Solo Premium”**.  
- Click en **Hazte Premium** → página **Pago** → **Pagar** (redirige a checkout de Mercado Pago).  
- Al volver con pago aprobado, tu estado pasa a **Activo/Premium**.

#### 3) Reservar una clase (Premium)
1. Ir a **Clases** → seleccionar una actividad.  
2. En el **Detalle**, verás **horarios disponibles**.  
3. Elegí un horario → **Reservar**.  
4. Si el POST es exitoso, verás un **toast** y te redirige a **Mis Turnos**.

#### 4) Ver / Cancelar mis reservas
- Ir a **Mis Turnos** desde el menú/Perfil.  
- Verás la lista de reservas.  
- (Si está implementado en back) podés **cancelar** desde la misma lista.

### Uso del panel Admin
- **Dashboard (`/admin`)**: KPIs y accesos.  
- **Usuarios (`/admin/usuarios`)**: buscar, filtrar, cambiar estado/rol.  
- **Clases (`/admin/clases`)**: crear/eliminar clases, ver cupos/horarios.  
- **Pagos / Stats**: vistas iniciales/placeholder (según sprint).  
> Acceso **solo** con `user.role === "admin"` (guard de ruta en el front).

### Problemas frecuentes (y solución)
- **No puedo reservar** → tu usuario no es Premium (**estado ≠ “Activo”**). Hacé el flujo **Hazte Premium**.  
- **No veo Mis Turnos** → asegurate de estar **logueado**.  
- **Error 401/403** → tu token expiró o falta. **Cerrá sesión y volvé a ingresar**.  
- **Horarios raros/duplicados** → el front normaliza horarios a `HH:mm:ss`; si el back devuelve vacío, usa **fallback** local (archivo de horarios de la clase).

### Tips de prueba / demo
- Para “resetear” el estado local en pruebas: **cerrar sesión** o borrar el token del navegador.  
- Si el back no tiene seeders de turnos todavía, el front muestra slots por **fallback** (solo futuros, ordenados).

### Accesibilidad & UX
- Diseño **responsive**.  
- Feedback con **toast** en acciones importantes (login, reservar, pago).  
- Botones deshabilitados para acciones no permitidas (ej.: “Solo Premium”).

---

## Variables de entorno

Crear `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://fithub-back-dev.onrender.com/api
```

---

## Scripts

```bash
npm install
npm run dev      # desarrollo
npm run build    # build
npm run start    # preview prod
```

---

## Roadmap


- [ ] ABM completo de **Clases** (edit, crear horarios, sedes).
- [ ] **Dashboard admin** con gráficos (ocupación, ingresos).
- [ ] **Notificaciones** (emails / push / in-app).
- [ ] **OAuth Google** completo.
- [ ] Subida de archivos (Cloudinary) para perfiles/clases.

---