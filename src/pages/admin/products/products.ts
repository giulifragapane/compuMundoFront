import { api } from "../../../utils/api";

const endpoint = "/productos";

export async function obtenerProductos() {
  return api.get(endpoint);
}

export async function obtenerProductoPorId(id: number) {
  return api.get(`${endpoint}/${id}`);
}

export async function crearProducto(data: any) {
  return api.post(endpoint, data);
}

export async function actualizarProducto(id: number, data: any) {
  return api.put(`${endpoint}/${id}`, data);
}

export async function eliminarProducto(id: number) {
  return api.put(`${endpoint}/${id}`, { eliminado: true });
}
