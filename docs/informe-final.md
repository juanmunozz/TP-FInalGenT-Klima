# Informe del proyecto — Klima

## Objetivo y alcance
Se desarrolló una plataforma para la empresa Klima con sitio comercial y sistema interno inicial de solicitudes. La aplicación se organiza en frontend React/TypeScript, API Express/TypeScript y PostgreSQL.

## Decisiones técnicas
Se eligió React + Vite para el frontend, Express para centralizar reglas de negocio y PostgreSQL para persistencia relacional. La elección coincide con las tecnologías mostradas como ejemplo en el curso.

## Orden de tareas
Se comenzó por estructura, esquema de datos y reglas de dominio porque solicitudes, estados y agenda dependen de ellas. Luego se implementaron endpoints, autenticación, interfaz y conexión del formulario. El despliegue queda después de ejecutar la batería de pruebas en entorno configurado.

## Pruebas
Se incorporaron tests unitarios para:
- Detección de superposición de intervalos.
- Descuento de costo de visita y prevención de doble descuento.
- Transiciones válidas de estado.

**Importante:** los tests están escritos, pero deben ejecutarse en el entorno del usuario con `npm install` y `npm test`. No se afirma que hayan pasado sin ejecución. Registrar aquí fecha, comando, resultado y capturas/salida real antes de entregar.

## Pruebas manuales sugeridas
1. Enviar solicitud válida desde el sitio.
2. Enviar formulario incompleto y comprobar validación.
3. Iniciar sesión con administrador.
4. Intentar acceso sin token y comprobar 401.
5. Cambiar estado a una transición permitida y otra no permitida.
6. Confirmar dos visitas superpuestas al mismo recurso y comprobar rechazo.
7. Registrar trabajo sin descripción al finalizar y comprobar rechazo.
8. Aplicar descuento de visita y comprobar que no se duplica.

## Publicación
Pendiente. Publicar frontend en Netlify, backend en Render y PostgreSQL en Neon; luego agregar URL real en README.

## Limitaciones conocidas
El panel visual inicial permite iniciar sesión, ver solicitudes y cambiar estados. La API incluye agenda, trabajos e historial, pero aún no tienen pantallas dedicadas en el frontend. El catálogo, duraciones, zonas, horarios y costo de visita deben validarse con Klima. No hay integración de WhatsApp, pagos ni notificaciones automáticas.
