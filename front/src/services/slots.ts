// src/services/slots.ts
export type Slot = { id?: string; fecha: string; horaInicio: string; horaFin: string };

const API = process.env.NEXT_PUBLIC_API_URL!;
const norm = (s?: string) => (!s ? "" : s.length === 5 ? `${s}:00` : s);

// helpers: ms(), soloFuturo(), dedup(), clean()
const ms = (s: Slot) => {
  const [y, m, d] = s.fecha.split("-").map(Number);
  const [hh, mm] = (s.horaInicio || "00:00").split(":").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0).getTime();
};
const soloFuturo = (s: Slot) => ms(s) >= Date.now();

const dedup = (arr: Slot[]) => {
  const seen = new Set<string>();
  const out: Slot[] = [];
  for (const s of arr) {
    const k = `${s.fecha}|${s.horaInicio}|${s.horaFin}`;
    if (!seen.has(k)) {
      seen.add(k);
      out.push(s);
    }
  }
  return out;
};

const clean = (arr: Slot[]) =>
  dedup(arr).filter(soloFuturo).sort((a, b) => ms(a) - ms(b));

/** Trae turnos disponibles del back; si no hay, usa clase.horarios (fallback). */
export async function cargarSlots(
  claseId: string,
  clase?: { horarios?: any[] }
): Promise<Slot[]> {
  // 1) intento endpoint oficial
  try {
    const r = await fetch(`${API}/clases/${claseId}/turnos-disponibles`, { cache: "no-store" });
    if (r.ok) {
      const data: any[] = await r.json();
      const arr: any[] = Array.isArray(data) ? data : [];
      const slotsRaw: Slot[] = arr
        .map((t: any): Slot => ({
          id: t?.id,
          fecha: String(t?.fecha ?? "").slice(0, 10),
          horaInicio: norm(String(t?.horaInicio ?? "")),
          horaFin: norm(String(t?.horaFin ?? "")),
        }))
        .filter(s => s.fecha && s.horaInicio && s.horaFin);

      const slots = clean(slotsRaw);
      if (slots.length) return slots; // si hay válidos, ya está
    }
  } catch {
    // sigo al plan B
  }

  // 2) fallback: clase.horarios
  const hs: any[] = Array.isArray(clase?.horarios) ? (clase!.horarios as any[]) : [];
  const fallbackRaw: Slot[] = hs
    .map((h: any): Slot => ({
      fecha: String(h?.fecha ?? "").slice(0, 10),
      horaInicio: norm(String(h?.horaInicio ?? "")),
      horaFin: norm(String(h?.horaFin ?? "")),
    }))
    .filter(s => s.fecha && s.horaInicio && s.horaFin);

  return clean(fallbackRaw);
}
