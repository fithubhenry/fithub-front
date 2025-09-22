"use client";
import Link from 'next/link';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

export default function SuccessPage() {
  const { refreshUserData, user } = useAuth();

  useEffect(() => {
    // Función para actualizar los datos del usuario después del pago
    const handlePaymentSuccess = async () => {
      try {
        // La función refreshUserData ya maneja los reintentos
        await refreshUserData();
        
        toast.success('¡Tu membresía ha sido activada exitosamente!');
      } catch (error) {
        console.error('Error al actualizar datos del usuario:', error);
        toast.info('El pago fue exitoso. Los datos se actualizarán en breve.');
      }
    };

    handlePaymentSuccess();
  }, [refreshUserData]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100 text-green-800">
      <h1 className="text-4xl font-bold mb-4">¡Pago Exitoso!</h1>
      <p className="text-lg text-center mb-4">
        Tu membresía ha sido activada. ¡Bienvenido a FitHub Premium!
      </p>
      {user?.estado === 'Activo' && (
        <p className="text-sm text-center mb-8 text-green-600 font-semibold">
          ✅ Estado de membresía: Activo
        </p>
      )}
      <Link href="/">
        <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
          Volver al inicio
        </button>
      </Link>
    </div>
  );
}