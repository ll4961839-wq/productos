import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;
let lastUrl: string = '';
let lastKey: string = '';

export const getSupabase = (): SupabaseClient | null => {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('supabase_anon_key') : null;

  const supabaseUrl = localUrl || (import.meta as any).env.VITE_SUPABASE_URL;
  const supabaseAnonKey = localKey || (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
    return null;
  }

  if (supabaseInstance && lastUrl === supabaseUrl && lastKey === supabaseAnonKey) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    lastUrl = supabaseUrl;
    lastKey = supabaseAnonKey;
    return supabaseInstance;
  } catch (e) {
    console.warn('⚠️ Error al inicializar Supabase:', e);
    return null;
  }
};

const createDummyQueryBuilder = () => {
  const dummy: any = {
    select: () => dummy,
    insert: () => dummy,
    update: () => dummy,
    delete: () => dummy,
    eq: () => dummy,
    order: () => dummy,
    single: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado' } }),
    then: (resolve: any) => resolve({ data: [], error: { message: 'Supabase no configurado' } }),
  };
  return dummy;
};

// Exportación simplificada para uso directo en componentes
export const supabase = {
  from: (table: string) => {
    const client = getSupabase();
    if (!client) {
      return createDummyQueryBuilder();
    }
    return client.from(table);
  },
  storage: {
    from: (bucket: string) => {
      const client = getSupabase();
      if (!client) {
        return {
          upload: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado' } }),
          getPublicUrl: () => ({ data: { publicUrl: '' } })
        };
      }
      return client.storage.from(bucket);
    }
  },
  auth: {
    getSession: () => {
      const client = getSupabase();
      if (!client) return Promise.resolve({ data: { session: null }, error: null });
      return client.auth.getSession();
    },
    onAuthStateChange: (callback: any) => {
      const client = getSupabase();
      if (!client) return { data: { subscription: { unsubscribe: () => {} } } };
      return client.auth.onAuthStateChange(callback);
    },
  }
} as any;


