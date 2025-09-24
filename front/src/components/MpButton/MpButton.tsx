"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function MpButton() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const createPreference = async () => {
    const userId = user?.userId;          

    if (!userId) return;                   

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mercado-pago/create-preference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            { id: "premium-fithub-id", title: "Premium Fithub", quantity: 1, unit_price: 100 },
          ],
          userId,                          
        }),
      });

      const data = await res.json();
      if (data.init_point) window.location.href = data.init_point;
      // Error ya manejado por toast en el servicio
    } catch (err) {
  // Error ya manejado por toast en el servicio
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={createPreference}
      disabled={loading || !user?.userId}
      className="w-full px-2 py-2 rounded-md border bg-[#fee600] border-[#fee600] text-black font-semibold hover:bg-black hover:text-[#fee600] transition cursor-pointer"
    >
      {loading ? "Redirigiendo..." : "Pagar ahora"}
    </button>
  );
}
