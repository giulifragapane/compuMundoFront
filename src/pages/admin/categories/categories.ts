import { api } from "../../../utils/api";

const endpoint = "/categorias";

export async function obtenerCategorias() {
  return api.get(endpoint);
}

export async function obtenerCategoriaPorId(id: number) {
  return api.get(`${endpoint}/${id}`);
}

export async function crearCategoria(data: any) {
  return api.post(endpoint, data);
}

export async function actualizarCategoria(id: number, data: any) {
  return api.put(`${endpoint}/${id}`, data);
}

export async function eliminarCategoria(id: number) {
  return api.put(`${endpoint}/${id}`, { eliminado: true });
}
