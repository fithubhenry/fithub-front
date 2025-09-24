"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { FaUser, FaUserShield, FaUserCheck } from "react-icons/fa";
import api from "@/services/api";
// ...existing code...
import { Search } from "lucide-react";
import { toast } from "react-toastify";

export default function UsuariosAdminPage() {
  // Estado local para cambios en el modal de inactivos
  const [inactiveEdits, setInactiveEdits] = useState<{[id: string]: string}>({});

  // Manejar cambio en el select de estado
  const handleInactiveEditChange = (id: string, value: string) => {
    setInactiveEdits(prev => ({ ...prev, [id]: value }));
  };

  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"Admin" | "Usuario">("Usuario");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await api.get("/users");
        
        const mapped = data.map((user: any) => ({
          id: user.id,
          name: user.nombre && user.apellido ? `${user.nombre} ${user.apellido}` : user.apellido_nombre || user.nombre || "",
          email: user.email,
          role: user.esAdmin ? "Admin" : "Usuario",
          estado: user.estado,
          imageUrl: user.profileImageUrl || null,
          telefono: user.telefono || null,
          historialPagos: user.historialPagos || [],
          ultimoPago: user.historialPagos && user.historialPagos.length > 0 
            ? new Date(user.historialPagos[user.historialPagos.length - 1].dateApproved).toLocaleDateString('es-ES')
            : null,
        }));
        
        setUsers(mapped);
      } catch {
        // Error silencioso, no mostrar en consola en producción
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);
  const handleDeleteUser = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      // Si llegamos aquí, el delete fue exitoso
      const data = await api.get("/users");
      const mapped = data.map((user: any) => ({
        id: user.id,
        name: user.nombre && user.apellido ? `${user.nombre} ${user.apellido}` : user.apellido_nombre || user.nombre || "",
        email: user.email,
        role: user.esAdmin ? "Admin" : "Usuario",
        estado: user.estado,
        imageUrl: user.profileImageUrl || null,
        telefono: user.telefono || null,
        historialPagos: user.historialPagos || [],
        ultimoPago: user.historialPagos && user.historialPagos.length > 0 
          ? new Date(user.historialPagos[user.historialPagos.length - 1].dateApproved).toLocaleDateString('es-ES')
          : null,
      }));
      setUsers(mapped);
      toast.success("Usuario eliminado correctamente");
    } catch {
      toast.error("Error al eliminar usuario");
    }
  };

  const handleSave = async (id: string) => {
    try {
      const esAdmin = editRole === "Admin";
      await api.patch(`/users/${id}`, {
        nombre: editName.split(" ")[0] || "",
        apellido: editName.split(" ").slice(1).join(" ") || "",
        esAdmin,
      });
      const data = await api.get("/users");
      const mapped = data.map((user: any) => ({
        id: user.id,
        name: user.nombre && user.apellido ? `${user.nombre} ${user.apellido}` : user.apellido_nombre || user.nombre || "",
        email: user.email,
        role: user.esAdmin ? "Admin" : "Usuario",
        estado: user.estado || "Activo",
        imageUrl: user.profileImageUrl || null,
        telefono: user.telefono || null,
        historialPagos: user.historialPagos || [],
        ultimoPago: user.historialPagos && user.historialPagos.length > 0 
          ? new Date(user.historialPagos[user.historialPagos.length - 1].dateApproved).toLocaleDateString('es-ES')
          : null,
      }));
      setUsers(mapped);
      setEditingId(null);
    } catch {
      // Error silencioso, no mostrar en consola en producción
    }
  };

  // Filtros y helpers
  const filteredUsers = users
    .filter(user => user.estado !== "Inactivo")
    .filter((user) => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === "all" || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });

  const inactiveUsers = users.filter(user => user.estado === "Inactivo");

  return (
    <main className="bg-black">
  <div className="min-h-screen bg-black pt-8 flex flex-col px-2 sm:px-6 max-w-screen-2xl mx-auto">
      {/* Header */}
  <div className="flex bg-black items-center justify-between w-full mb-8 px-2 sm:px-8">
        <div>
          <h1 className="text-3xl font-bold text-[#fee600] drop-shadow-lg">Gestión de Usuarios</h1>
          <p className="text-gray-300">Administra los miembros del gimnasio</p>
        </div>
      </div>

      {/* Stats Cards */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8 px-2 sm:px-8">
        <div className="bg-black border-[#fee600] border-2 rounded-xl p-6 flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-300">Total Usuarios</p>
          <p className="text-2xl font-bold text-[#fee600] flex items-center gap-2">{users.filter(u => u.estado !== "Inactivo").length} <FaUser className="text-[#fee600]" /></p>
        </div>
        <div className="bg-black border-[#fee600] border-2 rounded-xl p-6 flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-300">Admins</p>
          <p className="text-2xl font-bold text-[#fee600] flex items-center gap-2">{users.filter((u) => u.role === "Admin" && u.estado !== "Inactivo").length} <FaUserShield className="text-[#fee600]" /></p>
        </div>
        <div className="bg-black border-[#fee600] border-2 rounded-xl p-6 flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-300">Usuarios Activos</p>
          <p className="text-2xl font-bold text-[#fee600] flex items-center gap-2">{users.filter(u => u.estado === "Activo").length} <FaUserCheck className="text-[#fee600]" /></p>
        </div>
      </div>

      {/* Filtros */}
  <div className="bg-black border-[#fee600] border-2 w-full mb-8 rounded-xl p-6 px-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#fee600]" />
              <input
                type="text"
                placeholder="Buscar usuarios por nombre o email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 bg-black text-[#fee600] border border-[#fee600] rounded w-full py-2"
              />
            </div>
          </div>
          <select
            className="border border-[#fee600] rounded px-2 py-1 bg-black text-[#fee600] focus:ring-2 focus:ring-[#fee600] text-center text-sm w-full sm:w-48"
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="Usuario">Usuario</option>
            <option value="Admin">Admin</option>
          </select>
          <button
            className="border border-[#fee600] rounded px-2 py-1 font-semibold text-sm w-full sm:w-48 transition-colors cursor-pointer bg-black text-[#fee600] hover:bg-[#fee600] hover:text-black"
            onClick={() => setShowInactiveModal(true)}
          >
            Ver Inactivos
          </button>
      {/* Modal de usuarios inactivos - estilo admin/clases */}
      {showInactiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 border border-[#fee600] rounded-xl p-6 w-full max-w-3xl shadow-xl relative" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            {/* Botón de cerrar */}
            <button
              className="absolute top-4 right-4 text-[#fee600] hover:text-white hover:bg-[#fee600] rounded-full w-8 h-8 flex items-center justify-center font-bold text-xl transition-colors"
              onClick={() => setShowInactiveModal(false)}
            >
              ×
            </button>
            <h2 className="text-xl font-bold text-[#fee600] mb-4 text-center">Usuarios Inactivos</h2>
            {inactiveUsers.length === 0 ? (
              <p className="text-gray-300 text-center">No hay usuarios inactivos.</p>
            ) : (
              <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                <table className="w-full bg-black border border-[#fee600] rounded-xl text-[#fee600] table-fixed shadow-lg">
                  <thead>
                    <tr className="bg-[#fee600]/10">
                      <th className="px-4 py-3 border-b border-[#fee600] text-left text-base font-bold tracking-wide">Nombre</th>
                      <th className="px-4 py-3 border-b border-[#fee600] text-center text-base font-bold tracking-wide">Email</th>
                      <th className="px-4 py-3 border-b border-[#fee600] text-center text-base font-bold tracking-wide">Rol</th>
                      <th className="px-4 py-3 border-b border-[#fee600] text-center text-base font-bold tracking-wide">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inactiveUsers.map(user => (
                      <tr key={user.id} className="hover:bg-[#fee600]/10 transition-colors">
                        <td className="px-4 py-3 border-b border-[#fee600] font-medium text-base">{user.name}</td>
                        <td className="px-4 py-3 border-b border-[#fee600] text-center">{user.email}</td>
                        <td className="px-4 py-3 border-b border-[#fee600] text-center">{user.role}</td>
                        <td className="px-4 py-3 border-b border-[#fee600] text-center">
                          <select
                            className="border border-[#fee600] bg-black text-[#fee600] px-2 py-1 rounded"
                            value={inactiveEdits[user.id] ?? user.estado}
                            onChange={e => handleInactiveEditChange(user.id, e.target.value)}
                          >
                            <option value="Inactivo">Inactivo</option>
                            <option value="Invitado">Invitado</option>
                            <option value="Activo">Activo</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {inactiveUsers.length > 0 && (
              <div className="flex justify-end gap-4 mt-4">
                <button
                  className="bg-gray-700 text-white px-4 py-2 rounded font-bold border border-gray-700 cursor-pointer hover:bg-[#fee600] hover:text-black transition-colors"
                  onClick={() => setShowInactiveModal(false)}
                >
                  Cerrar
                </button>
                <button
                  className="bg-[#fee600] text-black px-4 py-2 rounded font-bold border border-[#fee600] cursor-pointer hover:bg-black hover:text-[#fee600] transition-colors"
                  onClick={async () => {
                    // Solo actualizar usuarios cuyo estado fue modificado y nombre/apellido válidos
                    const usersToUpdate = inactiveUsers.filter(user => {
                      const nuevoEstado = inactiveEdits[user.id];
                      if (!nuevoEstado || nuevoEstado === user.estado) return false;
                      const partes = user.name ? user.name.split(' ') : [];
                      const nombre = partes[0] || '';
                      const apellido = partes.slice(1).join(' ') || '';
                      return nombre.length >= 3 && apellido.length >= 3 && user.email && user.email.length > 0;
                    });
                    // Detectar usuarios inválidos
                    const invalidUsers = inactiveUsers.filter(user => {
                      const nuevoEstado = inactiveEdits[user.id];
                      if (!nuevoEstado || nuevoEstado === user.estado) return false;
                      const partes = user.name ? user.name.split(' ') : [];
                      const nombre = partes[0] || '';
                      const apellido = partes.slice(1).join(' ') || '';
                      return nombre.length < 3 || apellido.length < 3 || !user.email || user.email.length === 0;
                    });
                    if (invalidUsers.length > 0) {
                      toast.error("Nombre, apellido y email deben ser válidos para: " + invalidUsers.map(u => u.name).join(", "));
                      return;
                    }
                    if (usersToUpdate.length === 0) {
                      toast.info("No hay cambios para guardar");
                      setShowInactiveModal(false);
                      return;
                    }
                    const promises = usersToUpdate.map(user => {
                      const partes = user.name ? user.name.split(' ') : [];
                      const nombre = partes[0] || '';
                      const apellido = partes.slice(1).join(' ') || '';
                      return api.patch(`/users/${user.id}`, {
                        nombre,
                        apellido,
                        estado: inactiveEdits[user.id],
                      });
                    });
                    try {
                      await Promise.all(promises);
                      const data = await api.get('/users');
                      const mapped = data.map((user: any) => ({
                        id: user.id,
                        name: user.nombre && user.apellido ? `${user.nombre} ${user.apellido}` : user.apellido_nombre || user.nombre || "",
                        email: user.email,
                        role: user.esAdmin ? "Admin" : "Usuario",
                        estado: user.estado,
                        imageUrl: user.profileImageUrl || null,
                        telefono: user.telefono || null,
                        historialPagos: user.historialPagos || [],
                        ultimoPago: user.historialPagos && user.historialPagos.length > 0 
                          ? new Date(user.historialPagos[user.historialPagos.length - 1].dateApproved).toLocaleDateString('es-ES')
                          : null,
                      }));
                      setUsers(mapped);
                      toast.success("Cambios guardados correctamente");
                      setShowInactiveModal(false);
                    } catch {
                      toast.error("No se pudieron guardar los cambios");
                    }
                  }}
                >
                  Aceptar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-black border-[#fee600] border-2 w-full rounded-xl mb-8">
        <div className="p-2 px-2 sm:p-6 sm:px-8">
          <h2 className="text-[#fee600] text-xl font-bold mb-2">Lista de Usuarios</h2>
          <p className="text-gray-300 mb-4">{filteredUsers.length} usuario{filteredUsers.length !== 1 ? "s" : ""} encontrado{filteredUsers.length !== 1 ? "s" : ""}</p>
          {loading ? (
            <div className="py-8 text-center text-[#fee600]">Cargando usuarios...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-black border border-[#fee600] rounded-xl text-[#fee600] table-fixed shadow-lg">
                <thead>
                  <tr className="bg-[#fee600]/10">
                    <th className="px-2 py-2 sm:px-4 sm:py-3 border-b border-[#fee600] text-left text-xs sm:text-sm font-bold tracking-wide">Nombre</th>
                    <th className="hidden sm:table-cell px-4 py-3 border-b border-[#fee600] text-center text-sm font-bold tracking-wide">Rol</th>
                    <th className="px-1 py-2 sm:px-4 sm:py-3 border-b border-[#fee600] text-center text-xs sm:text-sm font-bold tracking-wide">Estado</th>
                    <th className="px-1 py-2 sm:px-4 sm:py-3 border-b border-[#fee600] text-center text-xs sm:text-sm font-bold tracking-wide">Teléfono</th>
                    <th className="px-1 py-2 sm:px-4 sm:py-3 border-b border-[#fee600] text-center text-xs sm:text-sm font-bold tracking-wide">Último Pago</th>
                    <th className="px-1 py-2 sm:px-4 sm:py-3 border-b border-[#fee600] text-center text-xs sm:text-sm font-bold tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-[#fee600]/10 transition-colors">
                      <td className="px-2 py-2 sm:px-4 sm:py-3 border-b border-[#fee600] font-medium text-xs sm:text-sm">
                        {editingId === user.id ? (
                          <input
                            className="border border-[#fee600] rounded px-2 py-1 w-full bg-black text-[#fee600] focus:ring-2 focus:ring-[#fee600] text-center text-xs"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                          />
                        ) : (
                          <div className="flex items-center gap-1 sm:gap-2">
                            {user.imageUrl ? (
                              <Image src={user.imageUrl} alt={user.name} width={20} height={20} className="hidden sm:block rounded-full object-cover border border-[#fee600]" />
                            ) : (
                              <FaUser className="hidden sm:block text-[#fee600] w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-[#fee600] truncate text-xs sm:text-sm">{user.name}</div>
                              <div className="text-xs text-gray-400 truncate">{user.email}</div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 border-b border-[#fee600] text-center">
                        {editingId === user.id ? (
                          <select
                            className="border border-[#fee600] rounded px-2 py-1 w-full bg-black text-[#fee600] focus:ring-2 focus:ring-[#fee600] text-center text-xs"
                            value={editRole}
                            onChange={e => setEditRole(e.target.value as 'Admin' | 'Usuario')}
                          >
                            <option value="Usuario">Usuario</option>
                            <option value="Admin">Admin</option>
                          </select>
                        ) : (
                          <span className={user.role === "Admin" ? "bg-black text-[#fee600] border border-[#fee600] px-2 py-1 rounded font-bold text-xs" : "bg-[#fee600] text-black px-2 py-1 rounded font-bold text-xs"}>{user.role}</span>
                        )}
                      </td>
                      <td className="px-1 py-2 sm:px-4 sm:py-3 border-b border-[#fee600] text-center">
                        {user.role === "Admin" ? (
                          <span className="inline-block px-1 py-1 sm:px-2 sm:py-1 rounded-full font-semibold bg-black text-[#fee600] border border-[#fee600] whitespace-nowrap" style={{ fontSize: '10px' }}>
                            Admin
                          </span>
                        ) : (
                          <span className="inline-block px-1 py-1 sm:px-2 sm:py-1 rounded-full font-semibold bg-[#fee600] text-black border border-[#fee600] whitespace-nowrap" style={{ fontSize: '10px' }}>
                            {user.estado}
                          </span>
                        )}
                      </td>
                      <td className="px-1 py-2 sm:px-4 sm:py-3 border-b border-[#fee600] text-center">
                        <span className="px-1 py-1 sm:px-2 sm:py-1 rounded-full font-semibold text-black bg-[#fee600] text-xs whitespace-nowrap" style={{ fontSize: '10px' }}>
                          {user.telefono ? user.telefono : '-'}
                        </span>
                      </td>
                      <td className="px-1 py-2 sm:px-4 sm:py-3 border-b border-[#fee600] text-center">
                        {user.role === "Admin" ? (
                          <span className="px-1 py-1 sm:px-2 sm:py-1 rounded-full font-semibold text-[#fee600] bg-black border border-[#fee600] whitespace-nowrap" style={{ fontSize: '10px' }}>
                            Admin
                          </span>
                        ) : (
                          <span className="px-1 py-1 sm:px-2 sm:py-1 rounded-full font-semibold text-black bg-[#fee600] whitespace-nowrap" style={{ fontSize: '10px' }}>
                            {user.ultimoPago ? user.ultimoPago : 'Sin pagos'}
                          </span>
                        )}
                      </td>
                      <td className="px-1 py-2 sm:px-4 sm:py-3 border-b border-[#fee600] text-center">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                          {editingId === user.id ? (
                            <>
                              <button
                                className="bg-[#fee600] text-black font-semibold px-2 py-1 sm:px-4 sm:py-1 rounded hover:bg-black hover:text-[#fee600] border border-[#fee600] transition-colors text-xs sm:text-sm min-w-fit"
                                onClick={() => handleSave(user.id)}
                              >
                                Guardar
                              </button>
                              <button
                                className="bg-gray-400 text-black font-semibold px-2 py-1 sm:px-4 sm:py-1 rounded hover:bg-black hover:text-[#fee600] border border-[#fee600] transition-colors text-xs sm:text-sm min-w-fit"
                                onClick={() => setEditingId(null)}
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Editar eliminado por requerimiento */}
                              {user.role !== "Admin" ? (
                                <button
                                  className="bg-[#fee600] text-black font-semibold px-2 py-1 sm:px-3 sm:py-1 rounded hover:bg-black hover:text-[#fee600] border border-[#fee600] transition-colors text-xs sm:text-sm min-w-fit"
                                  onClick={async () => {
                                    try {
                                      const res = await api.get(`/users/admin/new/${user.id}`);
                                      
                                      // Recargar la lista de usuarios
                                      const data = await api.get("/users");
                                      const mapped = data.map((u: any) => ({
                                        id: u.id,
                                        name: u.nombre && u.apellido ? `${u.nombre} ${u.apellido}` : u.apellido_nombre || u.nombre || "",
                                        email: u.email,
                                        role: u.esAdmin ? "Admin" : "Usuario",
                                        estado: u.estado,
                                        imageUrl: u.profileImageUrl || null,
                                        telefono: u.telefono || null,
                                        historialPagos: u.historialPagos || [],
                                        ultimoPago: u.historialPagos && u.historialPagos.length > 0 
                                          ? new Date(u.historialPagos[u.historialPagos.length - 1].dateApproved).toLocaleDateString('es-ES')
                                          : null,
                                      }));
                                      setUsers(mapped);
                                      
                                      // Mostrar mensaje de éxito (usando la respuesta del servidor o mensaje por defecto)
                                      toast.success(typeof res === "string" ? res : "Usuario convertido a admin correctamente");
                                    } catch {
                                      toast.error("No se pudo convertir a admin");
                                    }
                                  }}
                                >
                                  <span className="sm:hidden">+ Admin</span>
                                  <span className="hidden sm:inline">Hacer Admin</span>
                                </button>
                              ) : (
                                <button
                                  className="bg-gray-400 text-black font-semibold px-2 py-1 sm:px-3 sm:py-1 rounded hover:bg-black hover:text-[#fee600] border border-[#fee600] transition-colors text-xs sm:text-sm min-w-fit"
                                  onClick={async () => {
                                    try {
                                      const res = await api.get(`/users/admin/delete/${user.id}`);
                                      
                                      // Recargar la lista de usuarios
                                      const data = await api.get("/users");
                                      const mapped = data.map((u: any) => ({
                                        id: u.id,
                                        name: u.nombre && u.apellido ? `${u.nombre} ${u.apellido}` : u.apellido_nombre || u.nombre || "",
                                        email: u.email,
                                        role: u.esAdmin ? "Admin" : "Usuario",
                                        estado: u.estado,
                                        imageUrl: u.profileImageUrl || null,
                                        telefono: u.telefono || null,
                                        historialPagos: u.historialPagos || [],
                                        ultimoPago: u.historialPagos && u.historialPagos.length > 0 
                                          ? new Date(u.historialPagos[u.historialPagos.length - 1].dateApproved).toLocaleDateString('es-ES')
                                          : null,
                                      }));
                                      setUsers(mapped);
                                      
                                      // Mostrar mensaje de éxito (usando la respuesta del servidor o mensaje por defecto)
                                      toast.success(typeof res === "string" ? res : "Rol de administrador removido correctamente");
                                    } catch {
                                      toast.error("No se pudo quitar el rol de admin");
                                    }
                                  }}
                                >
                                  <span className="sm:hidden">- Admin</span>
                                  <span className="hidden sm:inline">Quitar Admin</span>
                                </button>
                              )}
                              <button
                                className="bg-[#fee600] text-black font-semibold px-2 py-1 sm:px-3 sm:py-1 rounded hover:bg-black hover:text-[#fee600] border border-[#fee600] transition-colors text-xs sm:text-sm min-w-fit"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
    </main>
  );
}
