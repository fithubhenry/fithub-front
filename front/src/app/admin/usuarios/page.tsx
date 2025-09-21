"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { FaUser, FaUserShield, FaUserCheck } from "react-icons/fa";
import api from "@/services/api";
// ...existing code...
import { Plus, Search, Edit, Trash2, UserCheck } from "lucide-react";
import { toast } from "react-toastify";

export default function UsuariosAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
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
        }));
        setUsers(mapped);
        setError(null);
      } catch {
        setError("Error al cargar usuarios");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);
  const handleDeleteUser = async (id: string) => {
    try {
      const res = await api.delete(`/users/${id}`);
      // Si el backend responde con éxito (puedes ajustar según tu API)
      if (res && (res.success || res.status === 200 || res === true)) {
        const data = await api.get("/users");
        const mapped = data.map((user: any) => ({
          id: user.id,
          name: user.nombre && user.apellido ? `${user.nombre} ${user.apellido}` : user.apellido_nombre || user.nombre || "",
          email: user.email,
          role: user.esAdmin ? "Admin" : "Usuario",
          estado: user.estado,
          imageUrl: user.profileImageUrl || null,
          telefono: user.telefono || null,
        }));
        setUsers(mapped);
        toast.success("Usuario eliminado correctamente");
      } else {
        toast.error("No se pudo eliminar el usuario");
      }
    } catch (err) {
      toast.error("Error al eliminar usuario");
    }
  };

  const handleEdit = (user: any) => {
    setEditingId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
  };

  const handleSave = async (id: string) => {
    try {
      const esAdmin = editRole === "Admin";
      await api.patch(`/users/${id}`, {
        nombre: editName.split(" ")[0] || "",
        apellido: editName.split(" ").slice(1).join(" ") || "",
        email: editEmail,
        esAdmin,
      });
      const data = await api.get("/users");
      const mapped = data.map((user: any) => ({
        id: user.id,
        name: user.nombre && user.apellido ? `${user.nombre} ${user.apellido}` : user.apellido_nombre || user.nombre || "",
        email: user.email,
        role: user.esAdmin ? "Admin" : "Usuario",
        estado: user.estado || "Activo",
      }));
      setUsers(mapped);
      setEditingId(null);
    } catch {
      setError("Error al guardar los cambios");
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

  return (
    <main className="bg-black">
  <div className="min-h-screen bg-black pt-8 flex flex-col px-6 max-w-screen-2xl mx-auto">
      {/* Header */}
  <div className="flex bg-black items-center justify-between w-full mb-8 px-8">
        <div>
          <h1 className="text-3xl font-bold text-[#fee600] drop-shadow-lg">Gestión de Usuarios</h1>
          <p className="text-gray-300">Administra los miembros del gimnasio</p>
        </div>
      </div>

      {/* Stats Cards */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8 px-8">
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
        <div className="flex flex-col sm:flex-row gap-4">
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
          {/* El filtro de estado se elimina para no mostrar los inactivos */}
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-black border-[#fee600] border-2 w-full rounded-xl mb-8">
        <div className="p-6 px-8">
          <h2 className="text-[#fee600] text-xl font-bold mb-2">Lista de Usuarios</h2>
          <p className="text-gray-300 mb-4">{filteredUsers.length} usuario{filteredUsers.length !== 1 ? "s" : ""} encontrado{filteredUsers.length !== 1 ? "s" : ""}</p>
          {loading ? (
            <div className="py-8 text-center text-[#fee600]">Cargando usuarios...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-black border border-[#fee600] rounded-xl text-[#fee600] table-fixed shadow-lg">
                <thead>
                  <tr className="bg-[#fee600]/10">
                    <th className="px-4 py-3 border-b border-[#fee600] text-left text-base font-bold tracking-wide">Nombre</th>
                    <th className="px-4 py-3 border-b border-[#fee600] text-center text-base font-bold tracking-wide">Rol</th>
                    <th className="px-4 py-3 border-b border-[#fee600] text-center text-base font-bold tracking-wide">Estado</th>
                    <th className="px-4 py-3 border-b border-[#fee600] text-center text-base font-bold tracking-wide">Teléfono</th>
                    <th className="px-4 py-3 border-b border-[#fee600] text-center text-base font-bold tracking-wide">Pagos</th>
                    <th className="px-4 py-3 border-b border-[#fee600] text-center text-base font-bold tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-[#fee600]/10 transition-colors">
                      <td className="px-4 py-3 border-b border-[#fee600] font-medium text-base">
                        {editingId === user.id ? (
                          <input
                            className="border border-[#fee600] rounded px-2 py-1 w-full bg-black text-[#fee600] focus:ring-2 focus:ring-[#fee600] text-center text-sm"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            {user.imageUrl ? (
                              <Image src={user.imageUrl} alt={user.name} width={28} height={28} className="rounded-full object-cover border border-[#fee600]" />
                            ) : (
                              <FaUser className="text-[#fee600] w-7 h-7" />
                            )}
                            <div>
                              <span className="font-bold text-[#fee600] align-middle">{user.name}</span>
                              <div className="text-xs text-gray-400 mt-1">{user.email}</div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 border-b border-[#fee600] text-center">
                        {editingId === user.id ? (
                          <select
                            className="border border-[#fee600] rounded px-2 py-1 w-full bg-black text-[#fee600] focus:ring-2 focus:ring-[#fee600] text-center text-sm"
                            value={editRole}
                            onChange={e => setEditRole(e.target.value as 'Admin' | 'Usuario')}
                          >
                            <option value="Usuario">Usuario</option>
                            <option value="Admin">Admin</option>
                          </select>
                        ) : (
                          <span className={user.role === "Admin" ? "bg-[#fee600] text-black px-2 py-1 rounded font-bold" : "bg-black text-[#fee600] border border-[#fee600] px-2 py-1 rounded font-bold"}>{user.role}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 border-b border-[#fee600] text-center">
                        <span
                          className="inline-block px-4 py-1 rounded-full font-semibold text-sm bg-[#fee600] text-black border border-[#fee600] min-w-0"
                          style={{ maxWidth: '140px', textAlign: 'center', whiteSpace: 'nowrap' }}
                        >
                          {user.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b border-[#fee600] text-center">
                        <span className="px-3 py-1 rounded-full font-semibold text-black bg-[#fee600] text-xs">
                          {user.telefono ? user.telefono : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b border-[#fee600] text-center">
                        <span className="px-3 py-1 rounded-full font-semibold text-black bg-[#fee600] text-xs">
                          {user.pagos ? user.pagos : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b border-[#fee600] text-center">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {editingId === user.id ? (
                            <>
                              <button
                                className="bg-[#fee600] text-black font-semibold px-4 py-1 rounded hover:bg-black hover:text-[#fee600] border border-[#fee600] transition-colors text-sm"
                                onClick={() => handleSave(user.id)}
                              >
                                Guardar
                              </button>
                              <button
                                className="bg-gray-400 text-black font-semibold px-4 py-1 rounded hover:bg-black hover:text-[#fee600] border border-[#fee600] transition-colors text-sm"
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
                                  className="bg-[#fee600] text-black font-semibold px-3 py-1 rounded hover:bg-black hover:text-[#fee600] border border-[#fee600] transition-colors text-sm min-w-fit"
                                  onClick={async () => {
                                    try {
                                      const res = await api.get(`/users/admin/new/${user.id}`);
                                      const data = await api.get("/users");
                                      const mapped = data.map((u: any) => ({
                                        id: u.id,
                                        name: u.nombre && u.apellido ? `${u.nombre} ${u.apellido}` : u.apellido_nombre || u.nombre || "",
                                        email: u.email,
                                        role: u.esAdmin ? "Admin" : "Usuario",
                                        estado: u.estado,
                                        imageUrl: u.profileImageUrl || null,
                                        telefono: u.telefono || null,
                                      }));
                                      setUsers(mapped);
                                      toast.success(typeof res === "string" ? res : "Usuario convertido a admin");
                                    } catch {
                                      toast.error("No se pudo convertir a admin");
                                    }
                                  }}
                                >
                                  Hacer Admin
                                </button>
                              ) : (
                                <button
                                  className="bg-gray-400 text-black font-semibold px-3 py-1 rounded hover:bg-black hover:text-[#fee600] border border-[#fee600] transition-colors text-sm min-w-fit"
                                  onClick={async () => {
                                    try {
                                      const res = await api.get(`/users/admin/delete/${user.id}`);
                                      const data = await api.get("/users");
                                      const mapped = data.map((u: any) => ({
                                        id: u.id,
                                        name: u.nombre && u.apellido ? `${u.nombre} ${u.apellido}` : u.apellido_nombre || u.nombre || "",
                                        email: u.email,
                                        role: u.esAdmin ? "Admin" : "Usuario",
                                        estado: u.estado,
                                        imageUrl: u.profileImageUrl || null,
                                        telefono: u.telefono || null,
                                      }));
                                      setUsers(mapped);
                                      toast.success(typeof res === "string" ? res : "Usuario ahora es usuario normal");
                                    } catch {
                                      toast.error("No se pudo quitar el rol de admin");
                                    }
                                  }}
                                >
                                  Quitar Admin
                                </button>
                              )}
                              <button
                                className="bg-[#fee600] text-black font-semibold px-3 py-1 rounded hover:bg-black hover:text-[#fee600] border border-[#fee600] transition-colors text-sm min-w-fit"
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
