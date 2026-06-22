import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Inicialización protegida del cliente de Supabase.
 * Evita fallos en tiempo de construcción y centraliza la lógica de conexión.
 */
export const getSupabase = (): SupabaseClient => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
  const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Si faltan las credenciales, devolvemos un proxy que avisa en consola en lugar de romper la app
    console.warn('⚠️ Supabase URL o Anon Key no configuradas en .env');
    return null as any;
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
};

// Exportación simplificada para uso directo en componentes
export const supabase = {
  from: (table: string) => getSupabase()?.from(table),
  storage: {
    from: (bucket: string) => getSupabase()?.storage.from(bucket)
  },
  auth: {
    getSession: () => getSupabase()?.auth.getSession(),
    onAuthStateChange: (callback: any) => getSupabase()?.auth.onAuthStateChange(callback),
  }
} as any;
