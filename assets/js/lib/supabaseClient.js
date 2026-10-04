/**
 * Peluquería Arxemil - Cliente Supabase
 * Inicialización limpia y segura del cliente Supabase para el navegador.
 */

// Importación ESM oficial desde CDN (sin requerir empaquetadores como Webpack/Vite)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Valores por defecto seguros para fallback (evita romper la ejecución si config.js no está disponible)
const DEFAULT_SUPABASE_URL = "https://wfanwyfyzqiqoylfmyyt.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_edlwj9MbEUloEq0clQ_o2w_v8I-skdO";

let supabaseInstance = null;

/**
 * Obtiene las credenciales de Supabase buscando en window.__ENV__, variables de entorno globales o un valor por defecto seguro.
 * @returns {{ url: string, key: string }}
 */
export function getSupabaseCredentials() {
  const winEnv = (typeof window !== 'undefined' && window.__ENV__) ? window.__ENV__ : {};
  const procEnv = (typeof process !== 'undefined' && process.env) ? process.env : {};
  const win = (typeof window !== 'undefined') ? window : {};

  let url = winEnv.SUPABASE_URL ||
            procEnv.SUPABASE_URL || procEnv.NEXT_PUBLIC_SUPABASE_URL || procEnv.VITE_SUPABASE_URL ||
            win.SUPABASE_URL || win.NEXT_PUBLIC_SUPABASE_URL || win.VITE_SUPABASE_URL || '';

  let key = winEnv.SUPABASE_ANON_KEY ||
            procEnv.SUPABASE_ANON_KEY || procEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || procEnv.VITE_SUPABASE_ANON_KEY ||
            win.SUPABASE_ANON_KEY || win.NEXT_PUBLIC_SUPABASE_ANON_KEY || win.VITE_SUPABASE_ANON_KEY || '';

  if (!url || url.includes('tu-proyecto')) {
    url = DEFAULT_SUPABASE_URL;
  }

  if (!key || key.includes('tu-clave-anon')) {
    key = DEFAULT_SUPABASE_ANON_KEY;
  }

  return { url, key };
}

/**
 * Comprueba si las variables de entorno públicas de Supabase están configuradas.
 * @returns {boolean}
 */
export function isSupabaseConfigured() {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && !url.includes('tu-proyecto') && !key.includes('tu-clave-anon'));
}

/**
 * Inicializa y devuelve la instancia singleton del cliente Supabase.
 * @returns {import('@supabase/supabase-js').SupabaseClient | null}
 */
export function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const { url: SUPABASE_URL, key: SUPABASE_ANON_KEY } = getSupabaseCredentials();

  if (!isSupabaseConfigured()) {
    console.info(
      '[Supabase] Modo local/mock activo: Las credenciales públicas aún no están configuradas. ' +
      'La aplicación continuará usando mockData.js de forma transparente.'
    );
    return null;
  }

  try {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    console.log('Supabase client initialized successfully');
    return supabaseInstance;
  } catch (error) {
    const origin = (typeof window !== 'undefined' && window.location && window.location.origin)
      ? window.location.origin
      : 'origen desconocido';

    console.error(
      `[Supabase Connection/CORS Error] Fallo al inicializar o conectar con Supabase. ` +
      `Si experimentas problemas de conexión o bloqueo CORS, revisa las URLs permitidas en la consola de Supabase para el origen actual: ${origin}`,
      error
    );
    return null;
  }
}

export const supabase = getSupabaseClient();
