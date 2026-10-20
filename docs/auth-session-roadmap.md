# Sesión frontend y tareas pendientes

Actualizado: 19 de octubre de 2026.

## Decisiones implementadas

- Se conecta el login público sin exigir sub ni implementar refresh.
- sub identifica al usuario; es independiente del mecanismo de refresh.
- PolicyMiddleware verifica la firma del JWT y busca el usuario por el email
  firmado, normalizado igual que UserService. Exige cuenta activa y roles de DB.
- Se mantiene principalUser con el documento real para restricciones por propietario.
- El frontend tiene login, cierre de sesión y proveedor Bearer restaurado desde sessionStorage.
- Las solicitudes frontend siguen incluyendo x-api-key; el login no lleva Bearer.
- Recargar conserva la sesión de la pestaña: se persisten token y perfil, nunca la contraseña.
- Login desde un guardado conserva canción y campos. El POST se reintenta de
  forma explícita. No hay reintentos automáticos que puedan duplicar plantillas.
- Logout/cambio de sesión cancela solicitudes pendientes y descarta respuestas
  anteriores. 401 solicita login; 403 conserva la sesión porque puede ser permisos.

## Pendiente para otras iteraciones

1. Adoptar sub con un ID estable y retirar identificación por email. Mientras se
   use email, un cambio lo desvincula del token y no debe reasignarse a otra cuenta
   si hay tokens anteriores vigentes.
2. Definir duración del access token y exp. La verificación JWT sigue validando
   exp si está presente, pero el emisor actual no define vencimiento.
3. Diseñar refresh, revocación y cierre remoto de sesiones. El cierre actual
   elimina la sesión del navegador; no revoca un JWT ya emitido en el servidor.
4. Evaluar cookies y refresh para reemplazar la solución provisional con sessionStorage.
5. Extraer el secreto de firma del código a configuración del servidor y planificar
   su rotación; nunca incluir valores en frontend, documentación o fixtures.
6. Verificar con la cuenta real la nueva restauración al recargar y el cierre
   de sesión persistida. El usuario ya confirmó login, extracción, escritura en
   MongoDB y lectura de plantillas por usuario antes de este ajuste.

## Validación

Las pruebas de middleware cubren firma real con cuentas simuladas, token alterado,
email inválido, roles y cuenta activa. Las pruebas frontend usan HTTP controlado
para login, errores, cancelación, sesión, preservación del borrador y recorrido de
plantillas. No equivalen a probar una cuenta real contra MongoDB.

## Navegación frontend

La URL mantiene view, songId y templateId, con soporte Atrás/Adelante y recarga.
El cancionero usa CRUD remoto y se integraron edición/clonación de plantillas.
La importación del origen de producción y los borradores offline quedan pendientes. Ver
../transposer-editor/docs/navigation.md para parámetros y límites.

## Diseño de borradores offline

Contrato propuesto en [offline-song-sync-contract.md](offline-song-sync-contract.md),
con fases locales y remotas descritas en el
[diseño de frontend](../../transposer-editor/docs/offline-song-drafts-design.md). El siguiente requisito
es exponer id estable en el perfil para particionar borradores; no requiere
adelantar sub, cookies ni refresh. Versiones/idempotencia son prerrequisitos
de sincronización fiable y no están implementadas en el CRUD actual.
