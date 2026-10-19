# Canciones y edición/clonación desde frontend

Contrato revisado en rutas, handlers, services, repositorios y response mappers.
El frontend usa CRUD remoto de canciones y PATCH/clone de plantillas.

- Canciones: GET/POST /api/v1/songs; GET/PUT/DELETE /api/v1/songs/:songId.
- Plantillas: PATCH /api/v1/harmonic-templates/:templateId y
  POST /api/v1/harmonic-templates/:templateId/clone.
- Los listados no implementan q, cursor o limit. La búsqueda actual es cliente.
- Las respuestas tienen envelope status/payload y fechas numéricas con etiquetas.
- DELETE songs usa status 204, payload null, aunque Dispatcher responda HTTP 200.
- Se consulta propiedad en repositorio. sudosu omite roles, no propiedad.
- No hay bloqueo de edición por isDerived. Crear desde canción lo define según
  presencia de sourceSongId; clonar siempre establece true y parentTemplateId.
- El padre de un clon es la plantilla inmediata. Los metadatos de canción y
  secciones se copian; la edición posterior no modifica la original.
- Descripción vacía al clonar hereda la descripción original por el uso de ||.
  PATCH con descripción vacía sí la borra. Tags [] limpia etiquetas en ambos.
- El frontend no envía isDerived, parentTemplateId, userId o fechas al editar.
- La referencia sourceSongId no se valida como FK ni se elimina al borrar canción;
  permanecen el ID y los metadatos de origen guardados en cada plantilla.

Las pruebas nuevas del servicio fijan estas reglas sin acceder a MongoDB.
No se modifica la semántica existente del backend en esta entrega.

## Próximas iteraciones

La propuesta IndexedDB como borradores offline, envío explícito, idempotencia,
conflictos y migración del origen de producción está en
../transposer-editor/docs/offline-song-drafts-proposal.md. Solo está documentada;
no hay autoguardado local ni sincronización automática nueva.
Cookies/refresh, vencimiento y sub continúan en auth-session-roadmap.md.
