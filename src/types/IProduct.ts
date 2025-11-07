import type { IOrderItem } from "./IOrders";

export interface IProduct {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  stock: number;
  categoriaId: number;
  categoriaNombre: string;
  disponible: boolean;
  detallePedido?: IOrderItem[]; // opcional
}

