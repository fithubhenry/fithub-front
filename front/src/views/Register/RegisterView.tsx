'use client'

import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IRegisterUser } from "@/types";
import { validateFormRegister } from "@/helpers/validate";
import { register } from "@/services/authService";
import { GoogleButton } from "@/components/GoogleButton/GoogleButton";
import { RegisterFormValues } from "@/types/RegisterFormValues";

const RegisterView = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-8 px-4">
      <div className="max-w-2xl w-full rounded-2xl border-2 border-[#fee600] p-10 shadow-[6px_8px_24px_0px_rgba(253,230,0,0.4)]">
        <div className="text-center mb-8">
          <h1 className="text-4xl tracking-widest font-bold text-[#fee600] mb-2 font-anton">
            FITHUB
          </h1>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4 text-center text-[#fee600]">Registro</h2>
          <p className="text-white text-lg">
            Completa tus datos para empezar a entrenar con nosotros
          </p>
        </div>

        <Formik<RegisterFormValues>
          initialValues={{
            nombre: "Juan",
            apellido: "Doe",
            fecha_nacimiento: "",
            email: "mail@gmail.com",
            password: "123456",
            confirmPassword: "T!aA123",
            ciudad: "Buenos Aires",
            direccion: "Direccion Falsa 123",
            telefono: "1234567890"
          }}
          validationSchema={validateFormRegister}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              
              const payload: IRegisterUser = {
                nombre: values.nombre,
                apellido: values.apellido,
                password: values.password,
                confirmPassword: values.confirmPassword,
                telefono: parseInt(values.telefono),
                fecha_nacimiento: values.fecha_nacimiento,
                email: values.email,
                direccion: values.direccion,
                ciudad: values.ciudad
              };
              
              
              const response = await register(payload);
              
              
              if (response && (response.status === 200 || response.status === 201)) {
                
                setTimeout(() => {
                  router.push('/login');
                }, 1000);
              }
            } catch (error) {
              // Error ya manejado por toast en el servicio
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="sm:col-span-1">
                <label className="block mb-1 text-sm font-medium text-[#fee600]">Nombre:</label>
                <Field
                  name="nombre"
                  type="text"
                  placeholder="Tu nombre"
                  className="w-full py-3 px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300
focus:outline-none focus:ring-2 focus:ring-[#fee600] focus:border-[#fee600] transition-colors duration-200"
                />
                <div className="h-5">
                  <ErrorMessage name="nombre" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              {/* Apellido */}
              <div className="sm:col-span-1">
                <label className="block mb-1 text-sm font-medium text-[#fee600]">Apellido:</label>
                <Field
                  name="apellido"
                  type="text"
                  placeholder="Tu apellido"
                  className="w-full py-3 px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300
focus:outline-none focus:ring-2 focus:ring-[#fee600] focus:border-[#fee600] transition-colors duration-200"
                />
                <div className="h-5">
                  <ErrorMessage name="apellido" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              {/* Fecha de nacimiento */}
              <div className="sm:col-span-1">
                <label className="block mb-1 text-sm font-medium text-[#fee600]">Fecha de nacimiento:</label>
                <Field
                  name="fecha_nacimiento"
                  type="date"
                  className="w-full py-3 px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300
focus:outline-none focus:ring-2 focus:ring-[#fee600] focus:border-[#fee600] transition-colors duration-200"
                />
                <div className="h-5">
                  <ErrorMessage name="fecha_nacimiento" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              {/* Email */}
              <div className="sm:col-span-1">
                <label className="block mb-1 text-sm font-medium text-[#fee600]">Email:</label>
                <Field
                  name="email"
                  type="email"
                  placeholder="example@example.com"
                  className="w-full py-3 px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300
focus:outline-none focus:ring-2 focus:ring-[#fee600] focus:border-[#fee600] transition-colors duration-200"
                />
                <div className="h-5">
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              {/* Contraseña */}
              <div className="sm:col-span-1">
                <label className="block mb-1 text-sm font-medium text-[#fee600]">Contraseña:</label>
                <div className="relative">
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="*********"
                    className="w-full pr-10 py-3 px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300
focus:outline-none focus:ring-2 focus:ring-[#fee600] focus:border-[#fee600] transition-colors duration-200"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <div className="h-5">
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div className="sm:col-span-1">
                <label className="block mb-1 text-sm font-medium text-[#fee600]">Confirmar Contraseña:</label>
                <div className="relative">
                  <Field
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    className="w-full pr-10 py-3 px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300
focus:outline-none focus:ring-2 focus:ring-[#fee600] focus:border-[#fee600] transition-colors duration-200"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-300"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <div className="h-5">
                  <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              {/* Ciudad */}
              <div className="sm:col-span-1">
                <label className="block mb-1 text-sm font-medium text-[#fee600]">Ciudad:</label>
                <Field
                  name="ciudad"
                  type="text"
                  placeholder="Ciudad"
                  className="w-full py-3 px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300
focus:outline-none focus:ring-2 focus:ring-[#fee600] focus:border-[#fee600] transition-colors duration-200"
                />
                <div className="h-5">
                  <ErrorMessage name="ciudad" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              {/* Dirección */}
              <div className="sm:col-span-1">
                <label className="block mb-1 text-sm font-medium text-[#fee600]">Dirección:</label>
                <Field
                  name="direccion"
                  type="text"
                  placeholder="Av. Siempre Viva 742"
                  className="w-full py-3 px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300
focus:outline-none focus:ring-2 focus:ring-[#fee600] focus:border-[#fee600] transition-colors duration-200"
                />
                <div className="h-5">
                  <ErrorMessage name="direccion" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              {/* Teléfono */}
              <div className="sm:col-span-2">
                <label className="block mb-1 text-sm font-medium text-[#fee600]">Teléfono:</label>
                <Field
                  name="telefono"
                  type="text"
                  placeholder="+54 9 11 1234 5678"
                  className="w-full py-3 px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300
focus:outline-none focus:ring-2 focus:ring-[#fee600] focus:border-[#fee600] transition-colors duration-200"
                />
                <div className="h-5">
                  <ErrorMessage name="telefono" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              {/* Botón */}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-4 rounded-lg font-medium text-sm transition-all duration-200 bg-[#fee600] text-black hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fee600] shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? "Validando..." : "Registrarse"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
        
        <div className="mt-4">
          <GoogleButton
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
            }}
            text="Registrarse con Google"
          />
        </div>
        <div className="text-center text-white mt-3">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-[#fee600] hover:text-yellow-400 font-medium transition-colors duration-200">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterView;