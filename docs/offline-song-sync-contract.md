# Contrato propuesto para envío fiable de borradores

Estado: diseño para una iteración futura; endpoints/campos nuevos no implementados.
Complementa el
[diseño de frontend](../../transposer-editor/docs/offline-song-drafts-design.md).
No requiere adelantar cookies, refresh ni sub.

## Brechas verificadas en el backend actual

- AuthenticationDTO devuelve perfil y token, pero no id estable de usuario.
- Song/SongDTO no tienen version; replace y patch escriben sin comparación de base.
- SongRepository filtra por usuario e ID, pero MongoRepository.update no incluye
  una revisión esperada en el filtro. Un GET antes de PUT no resuelve esa carrera.
- No hay clientMutationId, recibos ni garantías de idempotencia.
- El envelope vigente es status/payload; Dispatcher responde HTTP 200 aunque
  status tenga un error de aplicación. El contrato debe seguir respetándolo.

## Identidad local de borradores

Agregar id: string al perfil que devuelve el login, tomando user._id del servidor.
Frontend lo conserva como metadato del perfil para ownerKey=user:ID. Las sesiones
antiguas requieren volver a entrar antes de crear un borrador asociado a cuenta.
No se usa email como identidad durable. No se acepta userId del body para decidir
propiedad: todas las operaciones usan principalUser y los permisos actuales.

El id de perfil y sub son decisiones independientes. Se mantiene provisionalmente
la validación JWT por email y estado/roles desde DB, según lo acordado.

## Revisión de canciones

Agregar version: number a dominio y DTO de respuesta.

- Nuevas canciones: version=1.
- Documentos heredados sin version: se presentan como version=0.
- Todo PUT/PATCH incrementa la versión en el servidor. El cliente nunca la asigna.
- Con expectedVersion presente, el filtro de escritura incluye _id, userId y la
  versión esperada. Para 0 debe admitir el campo ausente o el número 0 legado.
- La actualización y el incremento ocurren en la misma operación de MongoDB.
- Si no existe el recurso del usuario: 404. Si existe con otra versión: 409 con
  code=song_version_conflict. No hacer un segundo update incondicional.
- Una versión heredada mal formada no se reinterpreta como 0 ni se sobrescribe:
  se informa para reparar esos datos explícitamente.

La respuesta incluye la nueva versión y mantiene id, source, fechas numéricas y
etiquetas actuales. El mapper debe omitir campos opcionales ausentes en registros
heredados, en vez de introducir null incompatible con el contrato de transporte.
updatedAt sigue siendo informativo y no se usa como token de concurrencia.

## Requests propuestos

POST /api/v1/songs, además de los campos editables actuales:

~~~json
{
  "title": "Tema",
  "source": "...",
  "enharmonicPreference": "auto",
  "clientMutationId": "uuid-operacion"
}
~~~

PUT/PATCH /api/v1/songs/:songId, además de los campos editables de cada método:

~~~json
{
  "source": "...",
  "expectedVersion": 3,
  "clientMutationId": "uuid-operacion"
}
~~~

Este ejemplo parcial corresponde a PATCH. PUT conserva title/source requeridos.
Los metadatos de operación se separan del payload editable; no se guardan en source
ni permiten asignar propietario, ID remoto, fechas o versión arbitraria.
La operación cliente conserva método, recurso, expectedVersion y snapshot al reintentar.

## Idempotencia y almacenamiento atómico

Crear songMutationReceipts con índice único en userId/clientMutationId. Cada recibo
almacena identidad de operación, método, recurso, hash canónico del request, status
de éxito y snapshot exacto de respuesta. Hash calculado por servidor; no confiar en
un hash enviado por el cliente. Incluir expectedVersion y campos editables con
orden canónico de claves; conservar source exacto, sin normalizar espacios o letra.

Orden del procesamiento:

1. Autenticar, autorizar y validar request.
2. Buscar recibo de ese usuario y mutationId antes de comprobar expectedVersion.
   Si existe y coincide el hash/método/recurso, devolver su respuesta sin escribir.
   Si la clave se reutilizó con otro request, 409 code=mutation_id_reused.
3. En una transacción MongoDB, volver a comprobar/crear la entrada única, crear la
   canción o actualizarla por versión y guardar el recibo de éxito.
4. Confirmar ambos cambios juntos. Un error no deja un recibo de éxito sin canción
   ni una canción escrita sin recibo. Dos requests concurrentes con la misma clave
   deben converger al mismo resultado, resolviendo la carrera del índice único.
5. Un conflicto de versión no deja un éxito en el journal. El usuario debe resolver
   el conflicto y preparar una operación nueva para el contenido/base elegidos.

Decisión técnica: utilizar transacciones para canción y recibo; no implementar
una secuencia de dos escrituras independientes como garantía de idempotencia.
Antes de esta fase se debe verificar que el MongoDB configurado admite
transacciones (replica set o cluster compatible) y que el adapter propaga session.
La topología real no fue auditada en esta tarea. Si es standalone, esta fase no
se habilita hasta preparar esa infraestructura o revisar explícitamente la
estrategia atómica; la recuperación local funciona sin depender de ello.

No añadir TTL a los recibos en la primera versión: borrar una clave que un cliente
incierto puede reintentar permite duplicados. Eliminar una canción tampoco elimina
su recibo ni autoriza a recrearla al repetir un POST ya aplicado. Retención,
compactación y eliminación de cuenta requieren una política posterior explícita.
No registrar tokens, contraseñas ni source en logs de operaciones.

## Recuperación de un resultado incierto

Proponer GET /api/v1/song-mutations/:clientMutationId, autorizado por propietario.

- 200: recibo de éxito con clientMutationId, resourceId, appliedVersion,
  originalStatus y song (snapshot de respuesta original).
- 404: no hay recibo visible de esa cuenta; no demuestra que un request no esté
  aún en curso. El cliente conserva la operación y puede reintentar explícitamente
  la misma clave/snapshot con el contrato idempotente activo.
- 401/403: bloquear reconciliación hasta resolver sesión/permisos, sin borrar borrador.

La respuesta original puede ser anterior a otra edición o eliminación. Después
de recuperar un recibo, consultar la canción actual: una versión posterior abre
comparación/conflicto, y un 404 conserva el borrador como recurso remoto eliminado.
El recibo prueba aplicación de la operación; no prueba que esa versión siga siendo
la actual. Nunca recuperar por título, artista o comparación heurística del source.

## Despliegue compatible

1. Añadir id al perfil y version a respuestas. Mantener funcionando el CRUD actual.
2. Introducir CAS, recibos e idempotencia para requests que incluyan los nuevos
   campos. Todo escritor legado también incrementa version, aunque aún no la compare.
3. Desplegar el frontend que envía expectedVersion/clientMutationId, tanto al
   Guardar remoto normal como al enviar un borrador, y permite reconciliación.
   Probar primero con el nuevo contrato; no anunciar todavía garantía global.
4. Tras actualizar clientes, exigir los metadatos para escrituras sincronizadas.
   Una versión vieja devuelve 400 con code=sync_metadata_required y pide actualizar.
   Habilitar el envío fiable de borradores cuando se complete esta transición.
   Mientras existan escrituras legadas sin expectedVersion no hay garantía completa
   contra sobrescritura por esos clientes; no anunciar el despliegue como terminado.
5. No cambiar el envelope HTTP ni migrar cookies/refresh en este despliegue.

Antes de exigir metadatos, fijar alcance de compatibilidad del Guardar remoto
actual y las pestañas de producción abiertas; no romperlas silenciosamente.
Los endpoints auxiliares siguen el CORS y autenticación actuales; no requieren
un header de aplicación nuevo para idempotencia porque la clave va en el body.

## Pruebas requeridas antes de habilitar envío de borradores

- POST duplicado, secuencial y concurrente: un recurso, mismo recibo/respuesta.
- Misma clave con payload distinto o recurso distinto: 409 sin otra escritura.
- Dos PUT con expectedVersion igual: un ganador y un conflicto.
- Cambios con misma marca de tiempo: la versión sigue detectando concurrencia.
- Fallo entre escritura de canción y recibo: rollback conjunto; sin éxito parcial.
- Commit completado y respuesta cortada: replay y consulta recuperan el recibo.
- Edición/eliminación posterior: recibo no resucita ni sobrescribe el recurso.
- Documento legado sin versión y request de cliente antiguo durante transición.
- Cuenta distinta, inactiva o sin permisos: no puede leer recibos ni canciones ajenos.
- Frontend con nuevas ediciones durante el request y con logout antes del ACK.

Estas pruebas deben incluir MongoDB real compatible con transacciones; los mocks
no demuestran atomicidad ni índices únicos. Este documento no afirma que ya se
hayan ejecutado ni que los campos/rutas propuestos existan actualmente.
