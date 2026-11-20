# Klima — Plataforma comercial y de gestión

Aplicación web para presentar Klima y administrar solicitudes, visitas técnicas y trabajos de aire acondicionado.

## Stack
- Frontend: React, TypeScript y Vite.
- Backend: Node.js, TypeScript, Express.
- Persistencia: PostgreSQL.
- Pruebas: Vitest y Supertest.
- Publicación sugerida por la consigna: Netlify (frontend), Render (API), Neon (PostgreSQL).

## Requisitos
Node.js 20+, npm y Docker (opcional, para PostgreSQL local).

## Puesta en marcha
1. Copiar `.env.example` como `.env` y completar las variables.
2. Ejecutar `docker compose up -d db`.
3. Ejecutar `npm install`.
4. Ejecutar `npm run db:migrate`.
5. Ejecutar `npm run dev`.
6. Abrir http://localhost:5173.

El primer administrador se crea al iniciar el backend con `INITIAL_ADMIN_EMAIL` e `INITIAL_ADMIN_PASSWORD`. Cambiar la contraseña de ejemplo antes de cualquier publicación.

## Pruebas y build
- `npm test`
- `npm run build`

## Rutas principales
- `GET /api/health`
- `GET /api/services`
- `POST /api/requests`
- `POST /api/auth/login`
- `GET /api/admin/requests`
- `PATCH /api/admin/requests/:id/status`
- `POST /api/admin/appointments`
- `GET /api/admin/appointments`
- `POST /api/admin/jobs`
- `GET /api/admin/customers/:id/history`

## Publicación
Frontend: Netlify, comando `npm run build --workspace frontend`, directorio `frontend/dist`.
Backend: Render, comando `npm run build --workspace backend`, inicio `npm run start --workspace backend`.
Base: Neon PostgreSQL. Configurar `DATABASE_URL`, `JWT_SECRET`, `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD` y `FRONTEND_URL` en el entorno del backend; `VITE_API_URL` en el frontend.
Configurar CORS para aceptar únicamente `FRONTEND_URL`. No publicar archivos `.env` ni secretos.

## Estado del enlace público
Aún no publicado. Agregar aquí la URL real de Netlify una vez desplegado; no inventar un enlace.

## Documentación del proceso
Ver `docs/` y `agents/`. El informe de pruebas debe actualizarse con resultados reales de ejecución antes de la entrega.

## Subir el proyecto a GitHub con commits automáticos

1. Creá un repositorio vacío en GitHub llamado `klima` (sin agregar README, licencia ni `.gitignore`).
2. Extraé este ZIP y abrí Git Bash dentro de la carpeta `klima-full`.
3. Ejecutá `bash subir-klima.sh`.
4. El script crea cuatro commits ordenados (documentación, frontend, backend y configuración), te pide la URL del repositorio si todavía no está conectada y te consulta antes de hacer `git push`.

El script configura el nombre y email de Git únicamente para este repositorio si todavía no están definidos. No agrega archivos `.env`, contraseñas ni dependencias instaladas. Si ya existen commits o un remoto, intenta conservarlos.

**Importante:** estos commits organizan el contenido actual por componentes; no representan fechas ni etapas históricas reales de desarrollo. Si la consigna exige evidencias del proceso, agregá commits a medida que realices cambios reales.
