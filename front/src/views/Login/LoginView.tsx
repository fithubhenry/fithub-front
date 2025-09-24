'use client'

import { GoogleButton } from "@/components/GoogleButton/GoogleButton";
import { validateFormLogin } from "@/helpers/validate";
import { login, } from "@/services/authService";
import { ILoginUser } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState } from "react";
import { useRouter } from "next/navigation";

const LoginView = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login: loginContext } = useAuth();


  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full rounded-2xl border-2 border-[#fee600] p-10 shadow-[6px_8px_24px_0px_rgba(253,230,0,0.4)]">
        <div className="text-center mb-8">
          <h1 className="text-4xl tracking-widest font-bold text-[#fee600] mb-2 font-anton">
            FITHUB
          </h1>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#fee600] mb-2 font-sans">
            Inicia Sesión
          </h2>
          <p className="text-white text-lg">
            Accede a tu cuenta para continuar
          </p>
        </div>

        <Formik<ILoginUser>
          initialValues={{
            email: 'usuario@ejemplo.com',
            password: 'Test123!'
          }}
          validationSchema={validateFormLogin}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              // Llamamos al servicio de login
              const response = await login(values);
              // Si el login fue exitoso (200), actualizamos el contexto y redirigimos
              if (response && response.access_token && (response.status === 200 || response.status === 201)) {
                loginContext(response.access_token);
                setTimeout(() => {
                  router.push('/');
                }, 1000);
              }
            } catch {
              // Error ya manejado por toast en el servicio
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <div>
                <label className="block mb-1 text-sm font-medium text-[#fee600]">Correo Electrónico:</label>
                <Field
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full py-3 px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fee600] focus:border-[#fee600] transition-colors duration-200"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-[#fee600]">Contraseña:</label>
                <div className="relative">
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    className="w-full pr-10 py-3 px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fee600] focus:border-[#fee600] transition-colors duration-200"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-300 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 hover: cursor-pointer ${isSubmitting ? 'bg-gray-600 cursor-not-allowed text-gray-300' : 'bg-[#fee600] text-black hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fee600] shadow-lg hover:shadow-xl'}`}
                >
                  {isSubmitting ? 'Validando...' : 'Iniciar Sesión'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
        <div className="mt-4">
          <GoogleButton
            onClick={() => {
              // Redirige directo al backend
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
            }}
            text="Iniciar sesión con Google"
          />
        </div>
        <div className="text-center mt-4">
          <p className="text-white text-sm">
            ¿No tienes una cuenta?{' '}
            <a href="/register" className="text-[#fee600] hover:text-yellow-400 font-medium transition-colors duration-200">
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>

  );
};

export default LoginView;
