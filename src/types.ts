export interface Producto {
  Identificación: string | number;
  Nombre: string;
  Categoría: string;
  Existencias: number | string;
  resaltado: boolean;
  // Campos para imágenes (compatibilidad con versiones previas e instrucciones nuevas)
  Imagen?: string;
  imagen_url?: string;
  Precio?: number | string;
  Descripción?: string;
}

export type Categoria = 'Todos' | string;
