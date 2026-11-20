# Plan técnico

## Arquitectura
Frontend React/TypeScript/Vite; API Node/TypeScript/Express; PostgreSQL; pruebas Vitest; despliegue recomendado Netlify/Render/Neon.

## Modelo
`admins`, `customers`, `service_types`, `service_requests`, `appointments`, `jobs`. Relaciones y restricciones definidas en `backend/sql/001_init.sql`.

## API
- `GET /api/health`, `GET /api/services`
- `POST /api/requests`
- `POST /api/auth/login`
- `GET /api/admin/requests`
- `PATCH /api/admin/requests/:id/status`
- `GET/POST /api/admin/appointments`
- `POST /api/admin/jobs`
- `GET /api/admin/customers/:id/history`

## Ubicación de reglas
Validación de payload y transiciones en backend; conflictos horarios en servicio de agenda y transacción PostgreSQL; cálculo monetario en dominio; autorización en middleware; UI solo presenta datos.

## Seguridad
Helmet, CORS por `FRONTEND_URL`, rate limit de solicitudes, JWT con vencimiento, bcrypt, Zod, secretos en variables de entorno.

## Pruebas
Unitarias de superposición, transiciones y cálculo. Agregar pruebas de integración con DB de prueba y colección Postman antes de la entrega final.

## Orden y dependencias
1. Modelo de datos y dominio (reglas que condicionan el resto).
2. API y autenticación.
3. Formularios y panel administrativo.
4. Pruebas integrales.
5. Despliegue y documentación pública.
Se prioriza la lógica de agenda porque tiene mayor riesgo y dependencias.
