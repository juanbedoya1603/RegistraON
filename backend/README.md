# RegistraON Backend

Servicio API RESTful construido con FastAPI que implementa la logica de negocio del sistema de registro de productos. Opera como servidor ASGI mediante Uvicorn y se conecta a SQL Server a traves del controlador ODBC 17 de Microsoft.

## Arquitectura Interna

El backend sigue una arquitectura limpia por capas con separacion estricta de responsabilidades:

```
Peticion HTTP
    |
    v
+-- Routers (scanner.py) --+        Capa de presentacion.
|   Recibe la peticion,     |        Valida parametros de ruta,
|   delega al servicio,     |        inyecta conexion de BD
|   retorna respuesta JSON. |        via Depends(get_db).
+---------------------------+
    |
    v
+-- Services (product_service.py) --+   Capa de dominio.
|   Aplica reglas de negocio:       |   Limite diario, Quality Guard,
|   normalizacion a mayusculas,     |   validacion cruzada de EAN.
|   lista NO_MEASURE_PRODUCTS.      |
+-----------------------------------+
    |
    v
+-- Repositories (product_repository.py) --+   Capa de infraestructura.
|   Ejecuta consultas SQL puras            |   Transacciones, calculos
|   contra SQL Server via pyodbc.          |   de ranking, conteos.
+------------------------------------------+
    |
    v
+-- Database (database.py) --+   Fabrica de conexiones.
|   Generador Python que     |   Patron yield/finally
|   gestiona el ciclo de     |   para cierre garantizado.
|   vida de la conexion.     |
+-----------------------------+

+-- Schemas (schemas.py) --+   Contratos de datos.
|   Modelos Pydantic que   |   Validacion automatica
|   definen la forma de    |   de payloads entrantes
|   entrada y salida.      |   y respuestas tipadas.
+---------------------------+
```

## Requisitos del Entorno de Ejecucion

| Componente     | Version   | Proposito                                          |
| -------------- | --------- | -------------------------------------------------- |
| Python         | 3.11+     | Runtime del servidor                               |
| FastAPI        | 0.136.0   | Framework HTTP asincronico                         |
| Uvicorn        | 0.45.0    | Servidor ASGI de produccion                        |
| Pydantic       | 2.13.3    | Validacion de esquemas de datos                    |
| pyodbc         | 5.3.0     | Controlador de base de datos                       |
| ODBC Driver 17 | Microsoft | Protocolo de comunicacion con SQL Server           |
| python-dotenv  | 1.2.2     | Carga de variables de entorno desde archivo `.env` |

### Dockerfile

La imagen de produccion se construye a partir de `python:3.11-slim` (Debian 12). El proceso de build:

1. Instala dependencias del sistema operativo (`curl`, `gnupg2`, `unixodbc-dev`).
2. Registra el repositorio de paquetes de Microsoft y su clave GPG.
3. Instala `msodbcsql17` con aceptacion automatica del EULA.
4. Instala las dependencias de Python desde `requirements.txt`.
5. Copia el codigo fuente y arranca Uvicorn en el puerto `8000`.

## Topologia de la Base de Datos

El backend opera sobre dos esquemas dentro de la misma instancia de SQL Server:

### Esquema Operativo: `rpe`

Contiene las tablas propias de RegistraON. Todas las operaciones de escritura se realizan exclusivamente sobre este esquema.

| Tabla                 | Descripcion                                | Campos Clave                                                                                                                                                  |
| --------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rpe.Products`        | Registro inmutable de productos escaneados | `barCode`, `fullName`, `numDocument`, `timeEarned`, `nmProduct`, `nmBrand`, `nmCharacteristic`, `nmContentValue`, `nmContentUnit`, `nmSalesUnit`, `createdAt` |
| `rpe.UserUsers`       | Catalogo de operadores autorizados         | `numDocument`, `name`                                                                                                                                         |
| `rpe.trackLogin`      | Auditoria de intentos de autenticacion     | `numDocument`                                                                                                                                                 |
| `rpe.TimeRedemptions` | Registro de canjes de minutos acumulados   | `numDocument`, `minutesRedeemed`                                                                                                                              |

### Esquema Maestro Corporativo: `TryTiendas`

Esquema de solo lectura que contiene datos maestros gestionados por sistemas externos al proyecto.

| Tabla                    | Descripcion                              | Uso en RegistraON                                                             |
| ------------------------ | ---------------------------------------- | ----------------------------------------------------------------------------- |
| `TryTiendas.FixProducts` | Catalogo maestro de productos existentes | Doble-Check de EAN. Excluye registros temporales con `barCode NOT LIKE 'TC%'` |
| `TryTiendas.InvBrands`   | Catalogo maestro de marcas comerciales   | Autocompletado del campo Marca en el frontend                                 |

### Regla de Exclusion de Registros Temporales

La consulta de Doble-Check en `TryTiendas.FixProducts` aplica la clausula `WHERE barCode = ? AND barCode NOT LIKE 'TC%'`. Esto excluye deliberadamente los codigos con prefijo `TC` (Temporales Corporativos), que representan asignaciones provisionales internas y no deben bloquear el registro de un EAN legitimo.

### Calculo del Ranking Gamificado

El saldo de minutos de cada operador se calcula mediante la formula:

```
saldo = SUM(rpe.Products.timeEarned) - SUM(rpe.TimeRedemptions.minutesRedeemed)
```

Si el resultado es negativo, se fuerza a `0` mediante una expresion `CASE WHEN ... < 0 THEN 0 ELSE ... END`. El ranking muestra los 5 operadores con mayor saldo, ordenados de forma descendente.

## Contratos de Datos de los Endpoints

Todos los endpoints estan montados bajo el prefijo `/api` mediante `app.include_router(scanner.router, prefix="/api")`.

### GET /api/login/{cedula}

Autentica a un operador por su numero de documento.

**Parametros de ruta:**

| Parametro | Tipo     | Descripcion                      |
| --------- | -------- | -------------------------------- |
| `cedula`  | `string` | Numero de documento del operador |

**Respuesta exitosa (200):**

```json
{
  "status": "success",
  "user": {
    "name": "NOMBRE DEL OPERADOR"
  }
}
```

**Errores:**

| Codigo | Condicion                                 |
| ------ | ----------------------------------------- |
| 404    | El documento no existe en `rpe.UserUsers` |

**Efecto secundario:** Inserta un registro en `rpe.trackLogin` para auditoria.

---

### GET /api/scan/{ean}

Valida que un codigo EAN este disponible para registro.

**Parametros de ruta:**

| Parametro | Tipo     | Restriccion         |
| --------- | -------- | ------------------- |
| `ean`     | `string` | Regex: `^\d{5,14}$` |

**Respuesta exitosa (200):**

```json
{
  "status": "success",
  "message": "EAN libre"
}
```

**Respuesta de bloqueo (200):**

```json
{
  "status": "error",
  "message": "BLOQUEO: El código ya existe en RegistraON como 'PRODUCTO X'."
}
```

**Errores:**

| Codigo | Condicion                                                 |
| ------ | --------------------------------------------------------- |
| 400    | Formato de EAN invalido (no cumple regex de 5-14 digitos) |

**Mecanismo de Doble-Check:**

1. Consulta `rpe.Products` por `barCode`.
2. Consulta `TryTiendas.FixProducts` por `barCode` excluyendo prefijos `TC%`.
3. Si alguna consulta retorna un resultado, se bloquea el registro.

---

### POST /api/save

Registra un nuevo producto en el sistema.

**Cuerpo de la peticion (JSON):**

```json
{
  "ean": "7701234567890",
  "fullName": "ARROZ DIANA INTEGRAL X 500 GR UND",
  "numDocument": "1234567890",
  "nmProduct": "ARROZ",
  "nmBrand": "DIANA",
  "nmCharacteristic": "INTEGRAL",
  "nmContentValue": "500",
  "nmContentUnit": "GR",
  "nmSalesUnit": "UND"
}
```

**Esquema Pydantic (`ProductSaveRequest`):**

| Campo              | Tipo  | Obligatorio |
| ------------------ | ----- | ----------- |
| `ean`              | `str` | Si          |
| `fullName`         | `str` | Si          |
| `numDocument`      | `str` | Si          |
| `nmProduct`        | `str` | Si          |
| `nmBrand`          | `str` | Si          |
| `nmCharacteristic` | `str` | Si          |
| `nmContentValue`   | `str` | Si          |
| `nmContentUnit`    | `str` | Si          |
| `nmSalesUnit`      | `str` | Si          |

**Respuesta exitosa (200):**

```json
{
  "status": "success",
  "message": "Producto registrado exitosamente en RegistraON"
}
```

**Errores:**

| Codigo | Condicion                                                                    |
| ------ | ---------------------------------------------------------------------------- |
| 400    | Quality Guard: Contenido y Unidad obligatorios para productos no exceptuados |
| 400    | Doble-Check: EAN ya existe en `rpe.Products` o `TryTiendas.FixProducts`      |
| 403    | Limite diario alcanzado (5 productos por operador por dia)                   |

**Pipeline de procesamiento:**

1. Verificar limite diario del operador.
2. Convertir todos los campos a mayusculas.
3. Evaluar Quality Guard contra lista `NO_MEASURE_PRODUCTS`.
4. Ejecutar Doble-Check de EAN.
5. Insertar en `rpe.Products` con `timeEarned = 1`.

---

### GET /api/user-stats/{cedula}

Retorna el saldo acumulado, el conteo diario y la actividad reciente de un operador.

**Parametros de ruta:**

| Parametro | Tipo     | Descripcion                      |
| --------- | -------- | -------------------------------- |
| `cedula`  | `string` | Numero de documento del operador |

**Respuesta exitosa (200):**

```json
{
  "saldo": 12,
  "dailyCount": 3,
  "history": [
    {
      "ean": "7701234567890",
      "fullName": "ARROZ DIANA INTEGRAL X 500 GR UND",
      "time": "+1 MIN"
    }
  ]
}
```

El campo `history` contiene los ultimos 5 registros ordenados por `createdAt` descendente.

---

### GET /api/ranking

Retorna el top 5 de operadores con mayor saldo de minutos.

**Respuesta exitosa (200):**

```json
[
  { "name": "OPERADOR UNO", "minutes": 25 },
  { "name": "OPERADOR DOS", "minutes": 18 }
]
```

---

### GET /api/brands

Retorna la lista completa de marcas del catalogo corporativo.

**Respuesta exitosa (200):**

```json
{
  "status": "success",
  "brands": ["ALPINA", "DIANA", "NESTLE"]
}
```

Fuente: `TryTiendas.InvBrands`, ordenadas alfabeticamente por `brName`.

---

### GET /api/base-products

Retorna la lista de nombres base de productos del catalogo corporativo.

**Respuesta exitosa (200):**

```json
{
  "status": "success",
  "products": ["ACEITE", "ARROZ", "AZUCAR"]
}
```

Fuente: Valores distintos de `nmProduct` en `TryTiendas.FixProducts`, ordenados alfabeticamente.

---

### GET /api/config/no-measure-products

Retorna la lista de excepciones del Quality Guard.

**Respuesta exitosa (200):**

```json
{
  "status": "success",
  "products": ["ESCOBA", "TRAPEADOR", "RECOGEDOR"]
}
```

Esta lista se define como constante en `product_service.py` y no requiere consulta a base de datos.

## Configuracion CORS

El middleware de CORS esta configurado con los siguientes origenes permitidos:

```
http://localhost:5173
http://127.0.0.1:5173
https://localhost:5173
https://172.20.32.1:5173
https://172.23.16.1:5173
```

Se permiten todos los metodos HTTP y todos los encabezados. Las credenciales estan habilitadas.

## Variables de Entorno

| Variable     | Descripcion                          | Ejemplo                       |
| ------------ | ------------------------------------ | ----------------------------- |
| `SQL_SERVER` | Host o IP de la instancia SQL Server | `server.database.windows.net` |
| `SQL_DB`     | Nombre de la base de datos           | `registraon_db`               |
| `SQL_USER`   | Usuario de autenticacion SQL         | `admin_user`                  |
| `SQL_PASS`   | Contrasena de autenticacion SQL      | `********`                    |
