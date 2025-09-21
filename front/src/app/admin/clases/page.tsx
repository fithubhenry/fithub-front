'use client';

import { useState, useEffect } from 'react';
import apiClases from '@/services/apiClases';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { IClase } from '@/types';

export default function ClasesAdminPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  const [clases, setClases] = useState<IClase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchClases = async () => {
      try {
        setLoading(true);
        const data = await apiClases.get('/clases');
  setClases(Array.isArray(data) ? data.filter((clase: any) => clase.estado !== false) : []);
        setError(null);
      } catch {
        setError('Error al cargar clases');
      } finally {
        setLoading(false);
      }
    };
    fetchClases();
  }, []);
  const [form, setForm] = useState({
    nombre: 'Voley',
    descripcion: 'asncioas',
    intensidad: 'Media',
    instructor: 'Juli',
    horarios: [{
      fecha: '',
      horaInicio: '',
      horaFin: '',
    }],
    duracion: '',
    capacidad: 0,
    tipo: 'Yoga',
    grupo_musculo: 'Pierna',
    sub_musculo: 'Abdominal',
    sede: 'Central',
    imageUrl: '',
  });

  // Opciones únicas para los selects, lógica igual a ClasesFilterView
  const isValid = (v: any) => typeof v === 'string' && v.trim() !== '' && v.trim().toLowerCase() !== 'undefined' && v.trim().toLowerCase() !== 'null';
  const options = {
    tipo: [...new Set(clases.map((a) => a.tipo).filter(isValid))],
    grupo_musculo: [...new Set(clases.flatMap((a) => Array.isArray(a.grupo_musculo) ? a.grupo_musculo.filter(isValid) : [a.grupo_musculo].filter(isValid)))],
    intensidad: [...new Set(clases.map((a) => a.intensidad).filter(isValid))],
    sede: [...new Set(clases.map((a) => a.sede).filter(isValid))],
    sub_musculo: [...new Set((form.grupo_musculo
      ? clases.filter((a) => Array.isArray(a.grupo_musculo)
          ? a.grupo_musculo.includes(form.grupo_musculo)
          : a.grupo_musculo === form.grupo_musculo
        ).flatMap((a) => Array.isArray(a.sub_musculo) ? a.sub_musculo.filter(isValid) : [a.sub_musculo].filter(isValid))
      : clases.flatMap((a) => Array.isArray(a.sub_musculo) ? a.sub_musculo.filter(isValid) : [a.sub_musculo].filter(isValid))
    ))],
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('horarios.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        horarios: [{ ...prev.horarios[0], [field]: value }]
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: name === 'capacidad' ? Number(value) : value }));
    }
  };

  const handleAddClase = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Intentando agregar clase, form:', form);
    if (!form.nombre || !form.descripcion || !form.instructor || !form.duracion || !form.capacidad || !form.tipo || !form.grupo_musculo || !form.sub_musculo || !form.sede
  || !form.horarios[0].fecha || !form.horarios[0].horaInicio || !form.horarios[0].horaFin) {
      console.warn('Faltan campos obligatorios');
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    try {
      const payload = {
        ...form,
        grupo_musculo: [form.grupo_musculo],
        sub_musculo: [form.sub_musculo],
      };
      // Formatear horaInicio y horaFin a HH:mm:ss
      const formatHora = (h: string) => h && h.length === 5 ? h + ':00' : h;
      const horarios = [{
        fecha: form.horarios[0].fecha,
        horaInicio: formatHora(form.horarios[0].horaInicio),
        horaFin: formatHora(form.horarios[0].horaFin),
      }];
      payload.horarios = horarios;

      console.log('Payload a enviar:', payload);
      const nuevaClase = await apiClases.post('/clases', payload);
      console.log('Respuesta del backend:', nuevaClase);
      setClases([...clases, nuevaClase]);
      setForm({
        nombre: '', descripcion: '', intensidad: 'Media', instructor: '', horarios: [{ fecha: '', horaInicio: '', horaFin: '' }], duracion: '', capacidad: 0, tipo: 'Yoga', grupo_musculo: 'Pierna', sub_musculo: 'Abdominal', sede: '', imageUrl: '',
      });
      alert('Clase agregada correctamente');
    } catch (err) {
      alert('Error al agregar la clase');
      console.error('Error al agregar clase:', err);
    }
  };

  const handleDeleteClase = async (id: string) => {
    try {
      console.log('Intentando eliminar clase con id:', id);
      const res = await apiClases.delete(`/clases/${id}`);
      // Si la respuesta es texto plano y contiene "eliminada" asumimos éxito
      if (typeof res === 'string' && res.toLowerCase().includes('eliminada')) {
        toast.success('Clase eliminada correctamente');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        toast.error('No se pudo eliminar la clase');
      }
    } catch (err) {
      toast.error('Error al eliminar la clase');
      console.error('Error al eliminar clase:', err);
    }
  };



  return (
    <div className="min-h-screen bg-black pt-2 px-2 md:px-6 flex items-start justify-center">
      <div className="w-full max-w-7xl bg-black rounded-2xl p-2 sm:p-4 md:p-8 shadow-[6px_8px_24px_0px_rgba(253,230,0,0.2)] flex flex-col gap-6 items-center">
            <h1 className="text-center text-2xl font-anton text-[#fee600]">Administración de Clases</h1>
            <Link href="/admin/clases/todas" className="mt-2 mb-4 inline-block bg-[#fee600] text-black font-semibold px-4 py-2 rounded hover:bg-black hover:text-[#fee600] border border-[#fee600] transition-colors">Ver todas las clases</Link>
            {loading ? (
              <div className="text-[#fee600] py-8">Cargando clases...</div>
            ) : error ? (
              <div className="text-red-400 py-8">{error}</div>
            ) : (
              <>
                <button type="button" className="bg-[#fee600] text-black font-bold px-8 py-2 text-base rounded hover:bg-black hover:text-[#fee600] border border-[#fee600] transition-colors mb-4" onClick={() => setAddDialogOpen(true)}>Agregar Clase</button>
                {addDialogOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-neutral-900 border border-[#fee600] rounded-xl p-8 w-full max-w-2xl shadow-xl">
                      <h2 className="text-xl font-bold text-[#fee600] mb-4">Agregar Nueva Clase</h2>
                      <form onSubmit={handleAddClase} className="grid grid-cols-2 gap-4">
                        <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} className="border border-[#fee600] bg-black text-white px-2 py-1 rounded w-full col-span-2" required />
                        <input type="text" name="instructor" placeholder="Instructor" value={form.instructor} onChange={handleChange} className="border border-[#fee600] bg-black text-white px-2 py-1 rounded w-full" required />
                        <select name="sede" value={form.sede} onChange={handleChange} className="border border-[#fee600] bg-black text-white px-2 py-1 rounded w-full">
                          <option value="">Sede</option>
                          {options.sede.map((v, i) => (
                            <option key={v + '-' + i} value={v}>{v}</option>
                          ))}
                        </select>
                        <input type="number" name="capacidad" placeholder="Capacidad" value={form.capacidad || ''} onChange={handleChange} className="border border-[#fee600] bg-black text-white px-2 py-1 rounded w-full" required />
                        <input type="text" name="duracion" placeholder="Duración (ej: 60min)" value={form.duracion} onChange={handleChange} className="border border-[#fee600] bg-black text-white px-2 py-1 rounded w-full" required />
                        <input type="date" name="horarios.fecha" placeholder="Fecha" value={form.horarios[0].fecha} onChange={handleChange} className="border border-[#fee600] bg-black text-white px-2 py-1 rounded w-full" required />
                        <input type="time" name="horarios.horaInicio" placeholder="Hora inicio" value={form.horarios[0].horaInicio} onChange={handleChange} className="border border-[#fee600] bg-black text-white px-2 py-1 rounded w-full" required />
                        <input type="time" name="horarios.horaFin" placeholder="Hora fin" value={form.horarios[0].horaFin} onChange={handleChange} className="border border-[#fee600] bg-black text-white px-2 py-1 rounded w-full" required />
                        <select name="intensidad" value={form.intensidad} onChange={handleChange} className="border border-[#fee600] bg-black text-white px-2 py-1 rounded w-full">
                          <option value="">Intensidad</option>
                          {options.intensidad.map((v, i) => (
                            <option key={v + '-' + i} value={v}>{v}</option>
                          ))}
                        </select>
                        <select name="tipo" value={form.tipo} onChange={handleChange} className="border border-[#fee600] bg-black text-white px-2 py-1 rounded w-full">
                          <option value="">Tipo</option>
                          {options.tipo.map((v, i) => (
                            <option key={v + '-' + i} value={v}>{v}</option>
                          ))}
                        </select>
                        <select name="grupo_musculo" value={form.grupo_musculo} onChange={handleChange} className="border border-[#fee600] bg-black text-white px-2 py-1 rounded w-full">
                          <option value="">Grupo muscular</option>
                          {options.grupo_musculo.map((v, i) => (
                            <option key={v + '-' + i} value={v}>{v}</option>
                          ))}
                        </select>
                        <select name="sub_musculo" value={form.sub_musculo} onChange={handleChange} className={`border border-[#fee600] bg-black text-white px-2 py-1 rounded w-full ${!form.grupo_musculo ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!form.grupo_musculo}>
                          <option value="">Sub-músculo</option>
                          {options.sub_musculo.map((v, i) => (
                            <option key={v + '-' + i} value={v}>{v}</option>
                          ))}
                        </select>
                        <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} rows={3} className="border border-[#fee600] bg-black text-white px-2 py-2 rounded w-full col-span-2" required />
                        <div className="col-span-2 flex justify-end gap-2 mt-2">
                          <button type="button" className="bg-gray-700 text-white px-4 py-2 rounded font-bold border border-gray-700" onClick={() => setAddDialogOpen(false)}>Cancelar</button>
                          <button type="submit" className="bg-[#fee600] text-black px-4 py-2 rounded font-bold border border-[#fee600]">Agregar</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
                {/* Lista de clases como cards */}
                <div className="w-full mt-8">
                  <h2 className="text-xl font-bold text-[#fee600] mb-4">Clases actuales</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {clases.length === 0 ? (
                      <div className="col-span-full text-center text-white py-8">No hay clases registradas</div>
                    ) : (
                      clases.map((clase) => (
                        <div key={clase.id} className="bg-neutral-900 border border-[#fee600] rounded-xl p-4 flex flex-col gap-2 shadow-md">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-lg text-[#fee600]">{clase.nombre}</span>
                            <span className="text-xs px-2 py-1 rounded bg-[#fee600] text-black font-semibold">{clase.tipo}</span>
                          </div>
                          <div className="text-sm text-white">Instructor: <span className="font-semibold">{clase.instructor}</span></div>
                          <div className="flex flex-wrap gap-2 text-xs text-white">
                            <span>Duración: {clase.duracion}</span>
                            <span>Capacidad: {clase.capacidad}</span>
                            <span>Sede: {clase.sede}</span>
                            <span>Intensidad: {clase.intensidad}</span>
                            <span>Grupo: {Array.isArray(clase.grupo_musculo) ? clase.grupo_musculo.join(', ') : clase.grupo_musculo}</span>
                            <span>Sub: {Array.isArray(clase.sub_musculo) ? clase.sub_musculo.join(', ') : clase.sub_musculo}</span>
                          </div>
                          <div className="text-xs text-white">{clase.descripcion}</div>
                          <div className="flex gap-2 pt-2">
                            {/* <button type="button" className="bg-[#fee600] text-black px-3 py-1 rounded font-bold hover:bg-black hover:text-[#fee600] border border-[#fee600]" onClick={() => openEditModal(clase)}>Editar</button> */}
                            <button type="button" className="bg-red-600 text-white px-3 py-1 rounded font-bold hover:bg-black hover:text-red-600 border border-red-600" onClick={() => handleDeleteClase(clase.id)}>Eliminar</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
      </div>
    </div>
  );
}
