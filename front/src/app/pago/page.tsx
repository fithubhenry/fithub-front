// src/app/pago/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import MpButton from "@/components/MpButton/MpButton";

export default function PagoPage() {
  const { user } = useAuth();

  return (
    <div className="mb-10 max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-10 flex flex-col md:flex-row gap-8 items-center">
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex flex-col items-center mb-6">
          <span className="inline-block bg-[#fee600] rounded-full p-4 mb-2">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path fill="black" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hazte Premium</h1>
          <p className="text-gray-600 text-center">Sé parte de nuestra comunidad.</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-black">Beneficios Premium</h2>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-[#fee600]">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="black" d="M9 16.2l-3.5-3.5 1.4-1.4L9 13.4l7.1-7.1 1.4 1.4z"/></svg>
              </span>
              Reservas ilimitadas
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#fee600]">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="black" d="M9 16.2l-3.5-3.5 1.4-1.4L9 13.4l7.1-7.1 1.4 1.4z"/></svg>
              </span>
              Acceso a clases premium
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#fee600]">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="black" d="M9 16.2l-3.5-3.5 1.4-1.4L9 13.4l7.1-7.1 1.4 1.4z"/></svg>
              </span>
              Soporte prioritario
            </li>
          </ul>
        </div>

        <div className="mb-4 flex flex-col items-center">
          <div className="bg-gray-100 rounded-lg p-4 w-full flex flex-col items-center">
            <span className="text-2xl font-bold text-gray-900 mb-1">$100</span>
            <span className="text-gray-500 mb-2">por mes</span>
            <span className="inline-block bg-[#fee600] rounded-full px-3 py-1 text-sm font-semibold text-black">Oferta limitada</span>
          </div>
        </div>

        {/* Aquí va tu lógica: si no hay user -> login; si hay user -> MpButton */}
        <div className="flex items-center justify-center">
          {!user?.userId ? (
            <a
              href="/login"
              className="w-full block text-center bg-black text-[#fee600] hover:bg-[#fee600] hover:text-black font-semibold rounded px-4 py-2 transition-colors duration-200"
            >
              Iniciar sesión para pagar
            </a>
          ) : (
            <MpButton />
          )}
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center">
        <img
          src="https://st.depositphotos.com/1518767/3624/i/600/depositphotos_36245523-stock-photo-portrait-of-fitness-class-gesturing.jpg"
          alt="Fitness class"
          className="rounded-2xl shadow-2xl w-full max-w-2xl h-[500px] object-cover border-4 border-[#fee600]"
        />
      </div>
    </div>
  );
}
