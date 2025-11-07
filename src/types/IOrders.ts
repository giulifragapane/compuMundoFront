export interface IOrderItem {
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export type OrderStatus = 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO' | 'TERMINADO';

export interface IOrder {
  id: number;
  usuarioId: number;
  fecha: string;
  total: number;
  estado: OrderStatus;
  items: IOrderItem[];
}
