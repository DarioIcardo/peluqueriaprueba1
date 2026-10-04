/**
 * Configuración de Entorno en el Navegador (Template)
 * 
 * INSTRUCCIONES:
 * 1. Copia este archivo con el nombre 'config.js' en la misma carpeta ('assets/js/config.js').
 * 2. Rellena las constantes con los datos públicos de tu proyecto en Supabase.
 * 3. NO agregues la clave 'service_role'. Solo usa la clave 'anon' pública.
 */

window.__ENV__ = {
  // URL de tu proyecto Supabase (Project Settings -> API -> Project URL)
  SUPABASE_URL: "https://tu-proyecto.supabase.co",

  // Clave pública anónima (Project Settings -> API -> Project API Keys -> anon / public)
  SUPABASE_ANON_KEY: "tu-clave-anon-publica-aqui",

  // Identificador de la sede activa
  BUSINESS_SLUG: "arxemil-lugo"
};
