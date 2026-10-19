# Autorización por roles declarados en handlers

El middleware recibe una lista obligatoria de códigos de rol:

```ts
ProvidePolicyMiddleware(['user'])
```

RoleCode se define en src/core/domain/Role.ts. Inicialmente reconoce user y
sudosu. El usuario guarda roles como un array de códigos en MongoDB:

```json
{
  "_id": "mongodb-object-id",
  "status": "active",
  "roles": ["user"]
}
```

No hay colecciones de Role, Policy o Action, ni consultas a PolicyRepository.
Los roles admitidos viven en el código de cada handler; los roles asignados
viven en el usuario. Todos los handlers protegidos actuales de canciones y
plantillas declaran ['user']. El endpoint público de login conserva su acceso
público. La API key de aplicación sigue siendo un requisito independiente.

## Evaluación

1. Exigir un header Bearer con un token válido, verificado por Security.
2. Exigir un email string válido dentro del JWT cuya firma fue verificada.
3. Consultar UserRepository.findOneByFilter con ese email normalizado (trim y minúsculas).
4. Exigir cuenta existente con status active.
5. Permitir sudosu o cualquier rol del usuario que esté en allowedRoles.
6. Inyectar principalUser y ejecutar el handler.

allowedRoles se captura por closure con una copia del array; no se inyecta
como configuración en Event. Los roles de tokens, body o propiedades del Event
no conceden acceso: siempre se lee el usuario de MongoDB en cada solicitud.

Una lista vacía permite únicamente sudosu. El superusuario omite solo la
comparación de roles; no omite JWT, existencia de cuenta o estado activo.
No hay bypass de las consultas por propietario: el acceso administrativo a
recursos de otros usuarios no se implementa con este cambio.

Se conserva el envelope 403 Forbidden para rechazos del middleware. Los errores
del handler se propagan para no convertir errores de negocio o infraestructura
del handler en rechazos de autorización. No se registran tokens ni datos de usuario.

## Datos existentes y evolución

Los usuarios nuevos comienzan sin roles y no obtienen privilegios implícitos.
Los documentos antiguos deben recibir roles explícitos mediante una operación
administrativa sobre la cuenta correspondiente; no se modifican usuarios ni
colecciones automáticamente. Objetos heredados como { id, name, code } y códigos
mayúsculos como SUPER_USER no se reinterpretan ni elevan privilegios.

Para admitir operador en el futuro, añadir su código a RoleCode, asignarlo al
usuario y declararlo en los handlers permitidos. Un usuario con varios roles
obtiene acceso cuando coincide al menos uno. No hay jerarquía ni herencia.

El JWT actual del login identifica al usuario por email. No se exige ni se usa
sub en esta iteración, y no se acepta identidad desde body o query. Un token sin
email firmado no identifica una cuenta, aunque tenga sub o uid. Adoptar sub con
un ID estable y diseñar vencimiento/refresh son tareas futuras independientes.
No se asigna el rol sudosu automáticamente.

Mientras se use email como identidad, cambiarlo invalida el vínculo del token con
la cuenta. No debe reasignarse ese email a otro usuario mientras pueda existir
un token válido anterior; resolver esta limitación al migrar a IDs estables.

## Comprobaciones

La suite verifica usuarios con varios roles, roles desconocidos o mal formados,
superusuario activo e inactivo, arrays vacíos, encabezados mal formados, tokens
inválidos/expirados, emails firmados inválidos, usuarios inexistentes, actualización de
roles en DB, inyección de identidad y propagación de errores del handler.
Todas las pruebas usan repositorios y validación JWT controlados en tests;
no modifican registros reales ni generan sesiones de producción.

Resultado de la revisión inicial: 36 pruebas aprobadas en dos suites y compilación TypeScript correcta.
Se actualizaron los doce handlers protegidos de canciones y plantillas.

El código especial de superusuario ahora es sudosu. El código anterior superuser
ya no activa el bypass; actualizar explícitamente las cuentas que lo utilizasen.
No se modifican usuarios de MongoDB automáticamente.

El login devuelve token y el middleware admite su formato actual sin sub.
La sesión frontend ahora se restaura desde sessionStorage al recargar; ver
[auth-session-roadmap.md](auth-session-roadmap.md). Redis permanece desactivado
según el ajuste previo. Las pruebas controladas no demuestran persistencia real.
