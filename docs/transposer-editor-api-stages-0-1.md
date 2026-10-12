# Transposer Editor API - Etapas 0 y 1

Este documento deja cerradas las primeras dos etapas antes de implementar los modulos de canciones, entrenamiento y dashboard.

## Etapa 0 - Reconocimiento tecnico

### Estado actual del backend

- Proyecto Node/TypeScript con scripts `start`, `build`, `prod` y `test`.
- La API ya tiene una arquitectura tipo Clean Architecture adaptada a handlers HTTP.
- La entrada global esta en `src/index.ts`, que ejecuta `BootManager`.
- Las rutas globales se agregan en `src/Routing.ts`.
- Hoy existen dos grupos de rutas: `SystemRouting` y `PublicRouting`.
- No hay modulos existentes para songs, training ni dashboard.
- La carpeta actual no parece tener metadata Git disponible, asi que los cambios deben revisarse desde el filesystem.

### Circuito HTTP real

El circuito vigente es:

```txt
HTTP request
-> Server
-> Dispatcher
-> Router
-> Route
-> Handler
-> Middlify / middlewares
-> UseCase
-> Service
-> Repository
-> MongoRepository
-> ResponseEntity
-> ApiProxyResult
-> HTTP response
```

Archivos relevantes:

- `src/deepcore/application/http/Server.ts`
- `src/deepcore/application/http/Dispatcher.ts`
- `src/deepcore/application/http/Router.ts`
- `src/deepcore/application/http/Route.ts`
- `src/deepcore/application/http/ResponseEntity.ts`
- `src/deepcore/application/http/HttpContracts.ts`

### Rutas

Las rutas se declaran en arreglos `Route[]` dentro de archivos `*Routing.ts`.

Ejemplo actual:

```ts
export const PublicRouting: Route[] = [
  {
    path: '/api/v1/publics/auth',
    method: 'post',
    handler: AuthenticationHandler,
  },
];
```

Luego `src/Routing.ts` combina todos los routings:

```ts
export const Routings = [
  ...SystemRouting,
  ...PublicRouting,
] as const;
```

Decision para los nuevos modulos:

- Crear `SongRouting.ts`, `TrainingRouting.ts` y `DashboardRouting.ts`.
- Registrarlos en `src/Routing.ts`.
- Mantener prefijo versionado `/api/v1`, porque ya existe en auth.

### Handlers

Los handlers actuales:

- reciben `ApiEvent`;
- leen `event.body`, `event.pathParameters` y `event.queryStringParameters`;
- validan presencia/formato basico;
- crean el use case;
- traducen errores conocidos del use case a `ResponseEntity`;
- envuelven el handler con `Middlify`;
- usan `ProvideLoggerMiddleware`.

Referencia principal:

- `src/adapters/handlers/publics/AuthenticationHandler.ts`

Decision para nuevos handlers:

- Mantener un handler por operacion o por operacion compacta cuando sea razonable.
- No acoplar handlers al request crudo de Node.
- Usar `ResponseEntity.ok`, `created`, `noContent`, `badRequest`, `notFound`, `conflict`, `forbidden` y `error`.

### ResponseEntity y status codes

`ResponseEntity` genera un `ApiProxyResult` con:

```ts
{
  statusCode: number;
  headers: ResponseHeader;
  body: {
    status: number;
    payload: any;
  }
}
```

Observacion importante:

- `ResponseEntity` guarda el status real en `ApiProxyResult.statusCode` y en `body.status`.
- Pero `Dispatcher.send` actualmente siempre responde HTTP 200:

```ts
httpResponse.writeHead(HttpStatus.Ok, payload.headers);
```

Contrato vigente para frontend:

- Leer `body.status` como status real de aplicacion.
- Leer `body.payload` como datos o mensaje.

Mejora futura recomendada:

- Cambiar `Dispatcher.send` para usar `payload.statusCode` como status HTTP real.
- Esa mejora conviene hacerla en una etapa separada porque puede afectar clientes existentes.

### Middlify

`Middlify` compone middlewares funcionales alrededor del handler.

Middleware existente:

- `ProvideLoggerMiddleware(handlerCode)`

Decision:

- Todos los handlers nuevos deben usar `Middlify(handler, [ProvideLoggerMiddleware('NombreHandler')])`.
- Cuando exista autenticacion real por token, agregar middleware de autenticacion/autorizacion sin meter esa logica dentro de los handlers.

### Persistencia

La infraestructura soporta MongoDB mediante:

- `DatabaseContext`
- `DatabaseFactory`
- `MongoDBClient`
- `MongoRepository<T>`

`MongoRepository<T>` ya incluye:

- `findById(ObjectId)`
- `findOneByFilter(filter)`
- `findAllByFilter(filter)`
- `findAll()`
- `save(model)`
- `update(model)`
- `deleteById(id)`
- `deleteByFilter(filter)`

Decisiones:

- Nuevos repositorios deben vivir en `src/adapters/persistence`.
- Deben extender `MongoRepository<T>`.
- Agregar nuevas particiones en `src/core/commons/constants/Partitions.ts`.
- Usar colecciones: `songs`, `trainingProgress`, `trainingSessions` y opcional futuro `trainingAttempts`.

### Dominio, DTOs, services y use cases

Patron actual:

- Dominio: `src/core/domain`
- DTOs: `src/core/contracts/datatransfers`
- Use cases: `src/core/usecases`
- Services: `src/core/services`
- Repositories: `src/adapters/persistence`

Decisiones:

- Crear modelos de dominio explicitos para `Song`, `TrainingProgress`, `TrainingSession` y estructuras relacionadas.
- Crear DTOs por modulo, agrupando tipos de request/response cuando convenga.
- Crear use cases explicitos por operacion relevante.
- Mantener errores de negocio como constantes estaticas del use case, siguiendo `AuthenticationUseCase.Error`.

### Autenticacion y userId

Hoy `AuthenticationUseCase` valida email/password pero no se observa emision de token ni middleware de usuario autenticado activo.

Decision para primeras implementaciones:

- Preparar todos los modelos con `userId`.
- En handlers, obtener `userId` desde `event.principalUser` cuando exista.
- Mientras no exista middleware de auth, aceptar temporalmente `userId` desde header/body solo para desarrollo o dejar un helper interno centralizado.
- No mezclar esta decision en cada use case: resolverla en handlers o middleware.

Recomendacion:

- Antes de exponer endpoints privados en serio, implementar un middleware de autenticacion que pobla `event.principalUser`.

## Etapa 1 - Contrato REST inicial

### Convenciones generales

Base URL local:

```txt
http://localhost:3000
```

Prefijo API:

```txt
/api/v1
```

Envelope de respuesta vigente:

```json
{
  "status": 200,
  "payload": {}
}
```

Errores conocidos:

```json
{
  "status": 400,
  "payload": "Bad Request"
}
```

Reglas:

- `400`: request invalido o datos faltantes.
- `403`: usuario sin permiso sobre el recurso.
- `404`: recurso inexistente.
- `409`: conflicto de negocio.
- `500`: error inesperado, via `ResponseEntity.error`.

Paginacion propuesta para listados:

```txt
?limit=20&cursor=<id-or-date>
```

Primera implementacion aceptable:

- soportar `limit`;
- devolver arreglo simple;
- agregar `cursor` despues si hace falta.

### Modulo Songs

#### Modelo canonico

```ts
type EnharmonicPreference = 'sharp' | 'flat' | 'auto';

interface Song {
  _id?: ObjectId;
  userId: string;
  title: string;
  artist?: string;
  source: string;
  originalKey?: string;
  lastTargetKey?: string;
  enharmonicPreference: EnharmonicPreference;
  createdAt: number;
  updatedAt: number;
}
```

Regla canonica:

- Persistir `source` y metadata.
- No persistir HTML, markdown, slides, transposiciones ni arquitectura armonica como fuente principal si pueden calcularse desde el core.

#### Endpoints CRUD

```txt
GET    /api/v1/songs
POST   /api/v1/songs
GET    /api/v1/songs/:songId
PUT    /api/v1/songs/:songId
PATCH  /api/v1/songs/:songId
DELETE /api/v1/songs/:songId
```

#### GET /api/v1/songs

Query params:

- `limit?`
- `cursor?`
- `q?`

Response futura:

```json
{
  "items": [],
  "nextCursor": null
}
```

Primera version puede devolver:

```json
[]
```

#### POST /api/v1/songs

Body:

```json
{
  "title": "Autumn Leaves",
  "artist": "Joseph Kosma",
  "source": "...",
  "originalKey": "Gm",
  "lastTargetKey": "Am",
  "enharmonicPreference": "auto"
}
```

Validaciones minimas:

- `title` requerido.
- `source` requerido.
- `enharmonicPreference` debe ser `sharp`, `flat` o `auto` si se envia.

Response `201`:

```json
{
  "id": "mongo-id",
  "title": "Autumn Leaves",
  "artist": "Joseph Kosma",
  "source": "...",
  "originalKey": "Gm",
  "lastTargetKey": "Am",
  "enharmonicPreference": "auto",
  "createdAt": 1760310000000,
  "updatedAt": 1760310000000
}
```

#### GET /api/v1/songs/:songId

Response `200`: misma forma que `POST /api/v1/songs`.

#### PUT /api/v1/songs/:songId

Reemplazo completo editable.

Body requerido:

```json
{
  "title": "Autumn Leaves",
  "artist": "Joseph Kosma",
  "source": "...",
  "originalKey": "Gm",
  "lastTargetKey": "Am",
  "enharmonicPreference": "auto"
}
```

#### PATCH /api/v1/songs/:songId

Actualizacion parcial.

Body:

```json
{
  "lastTargetKey": "Dm"
}
```

#### DELETE /api/v1/songs/:songId

Response: `204 No Content`. En el envelope actual, la respuesta queda con `status: 204`.

### Operaciones musicales calculadas

```txt
POST /api/v1/songs/parse
POST /api/v1/songs/transpose
POST /api/v1/songs/render
POST /api/v1/songs/:songId/transpose
POST /api/v1/songs/:songId/export
```

Formatos soportados:

- `txt`
- `md`
- `html`
- `slides`
- `architecture-chords`
- `architecture-degrees`

#### POST /api/v1/songs/parse

Body:

```json
{
  "source": "..."
}
```

Response:

```json
{
  "title": null,
  "detectedKey": "G",
  "sections": [],
  "warnings": []
}
```

#### POST /api/v1/songs/transpose

Body:

```json
{
  "source": "...",
  "fromKey": "G",
  "toKey": "A",
  "enharmonicPreference": "sharp"
}
```

Response:

```json
{
  "source": "...",
  "fromKey": "G",
  "toKey": "A",
  "result": "...",
  "warnings": []
}
```

#### POST /api/v1/songs/render

Body:

```json
{
  "source": "...",
  "format": "html",
  "targetKey": "A",
  "enharmonicPreference": "auto"
}
```

Response:

```json
{
  "format": "html",
  "content": "<article>...</article>",
  "warnings": []
}
```

#### POST /api/v1/songs/:songId/transpose

Usa la cancion persistida como fuente.

Body:

```json
{
  "targetKey": "A",
  "persistLastTargetKey": true,
  "enharmonicPreference": "auto"
}
```

Response:

```json
{
  "songId": "mongo-id",
  "sourceKey": "G",
  "targetKey": "A",
  "result": "...",
  "warnings": []
}
```

#### POST /api/v1/songs/:songId/export

Body:

```json
{
  "format": "md",
  "targetKey": "A",
  "enharmonicPreference": "auto"
}
```

Response:

```json
{
  "songId": "mongo-id",
  "format": "md",
  "filename": "autumn-leaves.md",
  "content": "..."
}
```

### Modulo Training

#### Modelos

```ts
type TrainingModule = 'transposition' | 'intervals' | 'degrees';
type TrainingMode = TrainingModule | 'mix';
type RoundType = 'timed' | 'count';
type TrainingSpelling = 'sharps' | 'flats';

interface ModuleMastery {
  score: number;
  attempts: number;
  correct: number;
  totalMs: number;
}

interface TrainingProgress {
  _id?: ObjectId;
  userId: string;
  xp: number;
  streak: number;
  lastSessionDate?: number;
  bestFluency: number;
  mastery: {
    transposition: ModuleMastery;
    intervals: ModuleMastery;
    degrees: ModuleMastery;
  };
  createdAt: number;
  updatedAt: number;
}

interface TrainingAttemptRecord {
  id?: string;
  module: TrainingModule;
  challenge: unknown;
  prompt: string;
  expected: string;
  answer: string;
  isCorrect: boolean;
  responseTimeMs: number;
  createdAt: number;
}

interface TrainingSession {
  _id?: ObjectId;
  userId: string;
  mode: TrainingMode;
  roundType: RoundType;
  spelling: TrainingSpelling;
  startedAt: number;
  completedAt?: number;
  asked: number;
  correct: number;
  bestStreak: number;
  totalMs: number;
  xp: number;
  summary: {
    accuracy: number;
    avgMs: number;
    correctPerMinute: number;
    fluency: number;
  };
  attempts: TrainingAttemptRecord[];
}
```

#### Progress endpoints

```txt
GET    /api/v1/training/progress
PUT    /api/v1/training/progress
DELETE /api/v1/training/progress
```

`GET` debe crear/devolver progreso inicial si no existe.

Progress inicial:

```json
{
  "xp": 0,
  "streak": 0,
  "lastSessionDate": null,
  "bestFluency": 0,
  "mastery": {
    "transposition": { "score": 0, "attempts": 0, "correct": 0, "totalMs": 0 },
    "intervals": { "score": 0, "attempts": 0, "correct": 0, "totalMs": 0 },
    "degrees": { "score": 0, "attempts": 0, "correct": 0, "totalMs": 0 }
  }
}
```

#### Session endpoints

```txt
POST /api/v1/training/sessions
GET  /api/v1/training/sessions
GET  /api/v1/training/sessions/:sessionId
POST /api/v1/training/sessions/:sessionId/attempts
POST /api/v1/training/sessions/:sessionId/complete
```

#### POST /api/v1/training/sessions

Body:

```json
{
  "mode": "transposition",
  "roundType": "count",
  "spelling": "sharps"
}
```

Response `201`:

```json
{
  "id": "mongo-id",
  "mode": "transposition",
  "roundType": "count",
  "spelling": "sharps",
  "startedAt": 1760310000000,
  "asked": 0,
  "correct": 0,
  "bestStreak": 0,
  "totalMs": 0,
  "xp": 0,
  "attempts": []
}
```

#### POST /api/v1/training/sessions/:sessionId/attempts

Body:

```json
{
  "module": "transposition",
  "challenge": {},
  "prompt": "Transpose C to D",
  "expected": "D",
  "answer": "D",
  "isCorrect": true,
  "responseTimeMs": 1200
}
```

Response:

```json
{
  "sessionId": "mongo-id",
  "attempt": {
    "id": "generated-id",
    "module": "transposition",
    "isCorrect": true,
    "responseTimeMs": 1200,
    "createdAt": 1760310000000
  },
  "sessionSummary": {
    "asked": 1,
    "correct": 1,
    "accuracy": 1,
    "avgMs": 1200,
    "correctPerMinute": 50,
    "fluency": 50
  }
}
```

#### POST /api/v1/training/sessions/:sessionId/complete

Body:

```json
{
  "completedAt": 1760310000000
}
```

Response:

```json
{
  "session": {},
  "progress": {}
}
```

Al completar:

- actualizar `TrainingSession.completedAt`;
- recalcular `summary`;
- sumar `xp`;
- actualizar `TrainingProgress`;
- actualizar `bestFluency`;
- actualizar `streak`;
- actualizar `mastery` por modulo.

#### Analytics endpoints

```txt
GET /api/v1/training/stats
GET /api/v1/training/weak-modules
```

`stats` response:

```json
{
  "sessions": 10,
  "attempts": 120,
  "accuracy": 0.82,
  "avgMs": 1430,
  "correctPerMinute": 41.9,
  "fluency": 68,
  "xp": 2400,
  "streak": 5
}
```

`weak-modules` response:

```json
[
  {
    "module": "intervals",
    "score": 42,
    "accuracy": 0.58,
    "avgMs": 2100
  }
]
```

### Attempts separados

Endpoints originalmente sugeridos:

```txt
GET  /api/v1/training/attempts
POST /api/v1/training/attempts
GET  /api/v1/training/attempts/:attemptId
```

Decision para primera implementacion:

- No crear coleccion separada todavia.
- Guardar attempts embebidos en `trainingSessions`.
- Evaluar `trainingAttempts` separado solo si analytics o volumen lo justifican.

### Modulo Dashboard

Endpoint:

```txt
GET /api/v1/dashboard/summary
```

Response:

```json
{
  "songs": {
    "count": 12,
    "recent": {
      "id": "mongo-id",
      "title": "Autumn Leaves",
      "artist": "Joseph Kosma",
      "updatedAt": 1760310000000
    }
  },
  "training": {
    "xp": 2400,
    "level": 4,
    "streak": 5,
    "accuracy": 0.82,
    "bestFluency": 74,
    "weakModules": [
      {
        "module": "intervals",
        "score": 42
      }
    ]
  }
}
```

Nivel calculado propuesto:

```txt
level = floor(sqrt(xp / 100)) + 1
```

Esta formula es simple, monotona y puede cambiarse luego sin migrar datos porque no se persiste.

## Orden recomendado de implementacion despues de esta etapa

1. Agregar particiones, dominio y DTOs base.
2. Implementar `SongRepository`, `SongService` y CRUD de songs.
3. Agregar `SongRouting` a `src/Routing.ts`.
4. Crear tests unitarios de handlers/use cases de songs.
5. Implementar operaciones musicales calculadas.
6. Implementar `TrainingProgress`.
7. Implementar `TrainingSession`.
8. Implementar stats, weak modules y dashboard.

## Riesgos y decisiones abiertas

- Autenticacion privada: falta middleware que garantice `event.principalUser`.
- Status HTTP real: `Dispatcher` responde HTTP 200 aunque `body.status` tenga otro codigo.
- `MongoRepository.update` usa `_id` tal como llega; los services deberan convertir string a `ObjectId` antes de actualizar.
- `Dispatcher.parseBody` no resuelve `{}` cuando un POST llega sin body JSON; los nuevos POST deben enviar body valido o conviene corregirlo aparte.
- CORS preflight hoy declara `POST, GET, OPTIONS`; habra que incluir `PUT`, `PATCH` y `DELETE` antes de usar CRUD desde frontend.
- Falta decidir si se reutiliza core musical del frontend o si se porta a un paquete compartido.
