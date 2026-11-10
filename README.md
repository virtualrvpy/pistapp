# Pista

Web app personal para registrar entrenamientos de pista, calcular equivalencias y guardar PBs.

## Iniciar

1. Instalar Node.js 20 o superior.
2. Ejecutar `npm install` y luego `npm run dev`.
3. Abrir la dirección que indique la terminal desde el teléfono, en la misma red.

Los datos se guardan de forma local en el dispositivo para que la primera versión funcione inmediatamente. La próxima integración sustituirá este almacenamiento por Supabase (autenticación y sincronización entre dispositivos).

## Publicar

Para GitHub Pages: crear el repositorio llamado `pista`, subir estos archivos y, en **Settings > Pages**, elegir **GitHub Actions** como fuente. El workflow incluido hará la publicación. Antes de publicar, configurar el nombre del repositorio en `vite.config.ts` si no se llama `pista`.

## Supabase

1. Crear un proyecto en Supabase y activar el acceso por enlace mágico en Authentication.
2. Ejecutar [`supabase/schema.sql`](supabase/schema.sql) en el SQL Editor.
3. La interfaz ya funciona con almacenamiento local; el esquema protege cada dato por usuario cuando se conecte Supabase. Nunca guardar claves de servicio en el frontend.

