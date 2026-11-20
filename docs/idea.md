# Idea del proyecto — Klima

Klima será una plataforma web para una empresa de servicios de aire acondicionado. Integra un sitio comercial público y un sistema interno de gestión.

## Problema
Centralizar la presentación de servicios y las solicitudes de clientes, evitando que la coordinación dependa exclusivamente de mensajes y anotaciones dispersas.

## Usuarios
- Visitante: consulta servicios y envía una solicitud.
- Administrador: revisa solicitudes, coordina visitas y registra resultados.
- Cliente: queda asociado a sus solicitudes e historial; el portal autenticado de clientes no integra el MVP.

## Alcance
Inicio, servicios, presentación de la empresa, formulario público, acceso administrativo, solicitudes, agenda, reglas de superposición, registro de trabajos e historial interno.

## Servicios iniciales configurados
Limpieza y sanitización, mantenimiento, instalación, desinstalación y reparación. La disponibilidad y las condiciones comerciales deben confirmarse antes de publicarse.

## Fuera de alcance
Pagos online, envío automático de correos/WhatsApp, aplicación móvil nativa y portal de cliente.

## Éxito
Un visitante envía una solicitud que persiste en PostgreSQL; el administrador la revisa, confirma una visita sin conflictos horarios y registra el resultado.
