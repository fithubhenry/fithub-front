"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Estado del usuario desde AuthContext
  const { user, isAuthenticated, logout } = useAuth();

  // Determina el rol según el estado del usuario
  const isGuest = !isAuthenticated;
  const isRegistered = user?.estado === "Invitado";
  const isPremium = user?.estado === "Activo";

  return (
    <nav className="sticky top-0 z-50 bg-black border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <Link href="/">
              <span className="font-anton text-3xl font-bold tracking-widest text-[#fee600]">
                FITHUB
              </span>
            </Link>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <p className="text-[#fee600] font-poppins hover:text-primary transition-colors duration-200">
                Inicio
              </p>
            </Link>
            {user?.esAdmin ? (
              <>
                <Link href="/admin/clases">
                  <p className="text-[#fee600] font-poppins hover:text-primary transition-colors duration-200">
                    Clases
                  </p>
                </Link>
                <Link href="/admin/usuarios">
                  <p className="text-[#fee600] font-poppins hover:text-primary transition-colors duration-200">
                    Usuarios
                  </p>
                </Link>
              </>
            ) : (
              !isGuest && (
                <Link href="/clases">
                  <p className="text-[#fee600] font-poppins hover:text-primary transition-colors duration-200">
                    Clases
                  </p>
                </Link>
              )
            )}

            {/* Links por estado */}
            {!isGuest && (
              <>
                <Link href="/profile">
                  <p className="text-[#fee600] font-poppins hover:text-primary transition-colors duration-200">
                    Mi perfil
                  </p>
                </Link>
                {user?.profileImageUrl && (
                  <Link href="/profile">
                    <img
                      src={user.profileImageUrl}
                      alt="Perfil"
                      className="ml-2 w-8 h-8 rounded-full border-2 border-[#fee600] object-cover shadow"
                    />
                  </Link>
                )}
              </>
            )}

            {isPremium && !user?.esAdmin && (
              <Link href="/misTurnos">
                <p className="text-[#fee600] font-poppins hover:text-primary transition-colors duration-200">
                  Mis turnos
                </p>
              </Link>
            )}

            {isRegistered && (
              <Link href="/pago">
                <p className="text-[#fee600] font-poppins hover:text-primary transition-colors duration-200">
                  Hazte premium
                </p>
              </Link>
            )}


            {/* Auth / Switch */}
            {isGuest ? (
              <>
                <Link href="/login">
                  <button className="px-4 py-2 rounded-md border border-[#fee600] text-[#fee600] font-semibold hover:bg-[#fee600] hover:text-black transition cursor-pointer">
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-4 py-2 rounded-md border border-[#fee600] text-[#fee600] font-semibold hover:bg-[#fee600] hover:text-black transition cursor-pointer">
                    Register
                  </button>
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  logout();
                  window.location.href = "/";
                }}
                className="px-4 py-2 rounded-md border border-[#fee600] text-[#fee600] font-semibold hover:bg-[#fee600] hover:text-black transition cursor-pointer"
              >
                Salir
              </button>
            )}
          </div>

          {/* Burger */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-[#fee600] hover:text-primary">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black border-t border-border">
              <Link href="/" onClick={toggleMenu}>
                <p className="block px-3 py-2 text-[#fee600] hover:text-primary transition">Inicio</p>
              </Link>

              {!isGuest && (
                <Link href="/clases" onClick={toggleMenu}>
                  <p className="block px-3 py-2 text-[#fee600] hover:text-primary transition">Clases</p>
                </Link>
              )}

              {!isGuest && (
                <Link href="/profile" onClick={toggleMenu}>
                  <p className="block px-3 py-2 text-[#fee600] hover:text-primary transition">Mi perfil</p>
                </Link>
              )}

              {isRegistered && (
                <Link href="/pago" onClick={toggleMenu}>
                  <p className="block px-3 py-2 text-[#fee600] hover:text-primary transition">Hazte premium</p>
                </Link>
              )}

              {isPremium && !user?.esAdmin && (
                <Link href="/misTurnos" onClick={toggleMenu}>
                  <p className="block px-3 py-2 text-[#fee600] hover:text-primary transition">Mis turnos</p>
                </Link>
              )}

              {isGuest ? (
                <>
                  <Link href="/login" onClick={toggleMenu}>
                    <button className="w-full mt-2 px-4 py-2 rounded-md bg-[#fee600] text-black font-semibold hover:bg-yellow-400">
                      Login
                    </button>
                  </Link>
                  <Link href="/register" onClick={toggleMenu}>
                    <button className="w-full mt-2 px-4 py-2 rounded-md border border-[#fee600] text-[#fee600] font-semibold hover:bg-[#fee600] hover:text-black">
                      Register
                    </button>
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => {
                    logout();
                    toggleMenu();
                    window.location.href = "/";
                  }}
                  className="w-full mt-2 px-4 py-2 rounded-md border border-[#fee600] text-[#fee600] font-semibold hover:bg-[#fee600] hover:text-black"
                >
                  Salir
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
