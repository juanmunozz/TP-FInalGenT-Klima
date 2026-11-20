# Spec funcional — Klima

## Objetivo
Aplicación web que capta solicitudes comerciales y permite administrar solicitudes, agenda y trabajos.

## Roles
- Visitante: consulta y solicita.
- Administrador: gestiona todo el módulo interno.
- Cliente: entidad asociada a solicitudes; no inicia sesión en el MVP.

## Alcance
Sitio público, formulario, autenticación administrativa, solicitudes, agenda, resultados e historial.

## Reglas de negocio
- **RN1:** El formulario exige nombre (2–100), teléfono (6–40), zona (2–100), servicio y descripción (10–2000). Email es opcional, pero si se informa debe ser válido.
- **RN2:** Una solicitud nueva se crea como `PENDIENTE`.
- **RN3:** Estados válidos: `PENDIENTE`, `CONTACTADO`, `ACEPTADO`, `CANCELADO`; solo se permiten transiciones definidas en backend.
- **RN4:** Cada solicitud registra creación y actualización.
- **RN5:** Una visita incluye solicitud, recurso, inicio y duración positiva.
- **RN6:** No se confirman dos visitas superpuestas para el mismo recurso.
- **RN7:** La duración se sugiere según el tipo de servicio; el administrador puede ajustarla.
- **RN8:** No se confirman visitas pasadas.
- **RN9:** Solo el administrador confirma una visita; enviar solicitud no reserva automáticamente.
- **RN10:** Visitas completadas/canceladas no bloquean agenda.
- **RN11:** La visita registra resultado: trabajo realizado, requiere presupuesto, requiere repuesto, cliente no acepta o no realizado.
- **RN12:** Para finalizar un trabajo se requiere descripción de al menos cinco caracteres y fecha de finalización.
- **RN13:** Si el cliente acepta la reparación, el costo de visita se descuenta del importe una sola vez.
- **RN14:** Los importes se almacenan como enteros en ARS.
- **RN15:** Solo administradores autenticados acceden a endpoints de gestión.
- **RN16:** Contraseñas almacenadas con bcrypt; no texto plano.
- **RN17:** Validación en frontend y backend; backend es fuente de verdad.
- **RN18:** Secretos y cadena de conexión solo por variables de entorno.

## Historias de usuario y aceptación
### HU1 — Ver servicios
Dado que soy visitante, cuando abro la web, entonces puedo consultar empresa, servicios y proceso de atención. RN17.
### HU2 — Enviar solicitud
Dado que completo datos válidos, cuando envío, entonces se crea una solicitud pendiente. Si faltan datos, no se crea. RN1, RN2, RN4, RN17.
### HU3 — Acceso administrativo
Dado que soy administrador con credenciales válidas, cuando inicio sesión, entonces recibo acceso; credenciales incorrectas se rechazan. RN15, RN16.
### HU4 — Gestionar solicitud
Dado que existe una solicitud, cuando el administrador cambia su estado a una transición permitida, entonces se actualiza; una transición no permitida se rechaza. RN3, RN4.
### HU5 — Programar visita
Dado que hay una solicitud activa y un horario libre, cuando el administrador confirma la visita, entonces se registra; si está en el pasado o se superpone, se rechaza. RN5–RN10.
### HU6 — Registrar resultado
Dado que existe una visita, cuando el administrador registra resultado, entonces se guarda; no puede finalizar sin descripción. RN11, RN12.
### HU7 — Descontar costo de visita
Dado que se acepta la reparación, cuando se calcula el importe, entonces el costo de visita se descuenta una sola vez; si no se acepta, no se descuenta. RN13, RN14.
### HU8 — Consultar historial
Dado que el administrador consulta un cliente, cuando abre su historial, entonces ve solicitudes, visitas y trabajos ordenados por fecha. RN4, RN11, RN12.

## Casos borde
- Dos administradores intentan reservar el mismo horario: se serializa por recurso mediante advisory lock en PostgreSQL.
- Solicitudes con mismo teléfono: se conservan, no se fusionan automáticamente.
- Cancelar/completar visita libera disponibilidad.
- Descuento aplicado previamente: el backend rechaza volver a descontar.
- Datos con espacios: se normalizan con trim.
- Backend caído: frontend informa error sin simular éxito.
- Solicitud cancelada: no se agenda.

## Pendientes
No hay reglas funcionales sin numerar. Permanecen decisiones comerciales por confirmar en `preguntas-abiertas.md`; no publicar valores inventados.
