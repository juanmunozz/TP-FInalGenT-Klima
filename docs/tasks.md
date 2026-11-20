# Tasks

| ID | Tarea | Agente | RN/HU | Dependencia | Criterio de terminado | Estado |
|---|---|---|---|---|---|---|
| T01 | Crear estructura y configuración | Arquitecto | Todas | — | Workspaces configurados | Hecha |
| T02 | Crear esquema y migración SQL | Backend | RN1–18 | T01 | Tablas y relaciones definidas | Hecha |
| T03 | Implementar reglas de dominio | Backend | RN3,6,13 | T01 | Unit tests escritos | Hecha |
| T04 | Implementar API pública de servicios/solicitudes | Backend | RN1,2,4 | T02,T03 | Endpoint y validación implementados | Hecha |
| T05 | Implementar login y protección | Backend | RN15,16 | T02 | JWT/bcrypt/middleware implementados | Hecha |
| T06 | Implementar agenda | Backend | RN5–10 | T02,T03 | Validación y lock por recurso | Hecha |
| T07 | Implementar trabajos e historial | Backend | RN11–14 | T06 | Endpoints implementados | Hecha |
| T08 | Construir web pública responsive | Frontend | HU1 | T01 | Secciones y navegación implementadas | Hecha |
| T09 | Conectar formulario a API | Frontend | HU2 | T04,T08 | Envía solicitud real | Hecha |
| T10 | Construir panel inicial | Frontend | HU3,HU4 | T05,T04 | Login y lista/estado implementados | Hecha |
| T11 | Ejecutar pruebas automatizadas e integrales | Tester | Todas | T03–T10 | Tests ejecutados en entorno limpio | Pendiente de ejecución |
| T12 | Desplegar frontend, API y DB | DevOps | RN18 | T11 | URLs públicas verificadas | Pendiente |
| T13 | Informe final y README con URL pública | Revisor | Todas | T11,T12 | Informe con evidencias reales | Pendiente |
