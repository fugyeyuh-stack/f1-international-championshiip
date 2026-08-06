/* =========================================================================
   CONFIGURACIÓN DE FIREBASE
   -------------------------------------------------------------------------
   Para que vos y tus amigos puedan editar la página y ver los cambios
   de todos en tiempo real, seguí estos pasos (gratis, 5 minutos):

   1. Entrá a https://console.firebase.google.com
   2. "Agregar proyecto" → ponele un nombre (ej: f1-championship) → creá.
   3. En el menú lateral: "Compilación" → "Realtime Database" → "Crear
      base de datos" → elegí una ubicación → empezá en "modo de prueba"
      (para que cualquiera con el link pueda leer/escribir; podés
      restringirlo después con reglas de seguridad).
   4. En el menú lateral: ⚙️ "Configuración del proyecto" → bajá hasta
      "Tus apps" → ícono </> (Web) → registrá la app.
   5. Copiá el objeto "firebaseConfig" que te muestra y pegalo abajo,
      reemplazando el que está de ejemplo.
   6. Guardá este archivo, subilo a GitHub junto al resto del sitio y listo:
      la próxima vez que entres a la página va a decir en la consola del
      navegador "Conectado a Firebase — modo colaborativo activo".

   Mientras no completes esto, el sitio funciona igual pero cada persona
   ve solo sus propios cambios (guardados en su navegador).
   ========================================================================= */

window.FIREBASE_CONFIG = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  databaseURL: "https://TU_PROYECTO-default-rtdb.firebaseio.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxx"
};
