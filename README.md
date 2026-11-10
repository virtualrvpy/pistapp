# Pista

App personal para registrar entrenamientos de pista, consultar equivalencias y guardar marcas personales.

## Desarrollo local

1. Instalar Node.js 22 o superior.
2. Copiar `.env.example` a `.env.local` y completar `VITE_SUPABASE_PUBLISHABLE_KEY` con la publishable key del proyecto.
3. Ejecutar `npm ci` y `npm run dev`.

La URL de Supabase ya está configurada para este proyecto. Nunca colocar una service role key o secret key en el cliente.

## Despliegue

GitHub Actions compila y publica en GitHub Pages al actualizar `main`. En **Settings → Pages → Build and deployment**, seleccionar **GitHub Actions**.

La URL pública es https://virtualrvpy.github.io/pistapp/.

## Supabase

El proyecto usa autenticación por enlace mágico y las tablas `trainings` y `personal_bests`, protegidas por RLS. Para autenticar en el sitio, agregar `https://virtualrvpy.github.io/pistapp/` en **Authentication → URL Configuration → Redirect URLs**.
