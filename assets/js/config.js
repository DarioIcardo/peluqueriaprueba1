/**
 * Configuración de Entorno en el Navegador
 * 
 * INSTRUCCIONES:
 * Rellena las constantes con los datos públicos de tu proyecto en Supabase.
 * NO agregues la clave 'service_role'. Solo usa la clave 'anon' pública.
 */

window.__ENV__ = window.__ENV__ || {};

window.__ENV__ = {
  // URL de tu proyecto Supabase (Project Settings -> API -> Project URL)
  SUPABASE_URL: window.__ENV__.SUPABASE_URL || "https://wfanwyfyzqiqoylfmyyt.supabase.co",

  // Clave pública anónima (Project Settings -> API -> Project API Keys -> anon / public)
  SUPABASE_ANON_KEY: "sb_publishable_edlwj9MbEUloEq0clQ_o2w_v8I-skdO",

  // Identificador de la sede activa
  BUSINESS_SLUG: window.__ENV__.BUSINESS_SLUG || "arxemil-lugo"
};
