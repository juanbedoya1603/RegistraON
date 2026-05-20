# RegistraON API - Backend 🐍

Este es el backend del proyecto **RegistraON**, construido con **FastAPI** en Python. Se comunica directamente con una base de datos Microsoft SQL Server mediante **pyodbc** para almacenar los hallazgos de inventario, validar la integridad de los códigos y gestionar los minutos acumulados por cada operario.

---

## 🛠️ Requisitos Previos

- **Python**: v3.10 o superior
- **SQL Server**: Instancia local o remota de Microsoft SQL Server.
- **Controlador ODBC**: Se requiere tener instalado **Microsoft ODBC Driver 17 for SQL Server** en el sistema donde se ejecute el backend (o configurado en el contenedor).

---

## 📦 Configuración y Variables de Entorno

El backend requiere configurar variables de entorno para establecer la conexión con la base de datos.
Crea un archivo `.env` en este directorio siguiendo la estructura de `.env.example`:

```env
SQL_SERVER=servidor-sql.database.windows.net
SQL_DB=AnalyticsDB
SQL_USER=nombre_usuario
SQL_PASS=contrasena_secreta
```

*Nota: El archivo `.env` está ignorado en `.gitignore` para prevenir fugas de secretos corporativos.*

---

## ⚡ Ejecución en Entorno de Desarrollo (Local)

1. **Crear e inicializar un entorno virtual de Python**:
   ```bash
   python -m venv venv
   # En Windows (PowerShell)
   .\venv\Scripts\Activate.ps1
   # En Linux/macOS
   source venv/bin/activate
   ```

2. **Instalar Dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Arrancar Servidor de Desarrollo**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   El servidor estará disponible en `http://localhost:8000`.

---

## 🗄️ Arquitectura de la Base de Datos (SQL Server)

El backend interactúa con el esquema `rpe` (RegistraON) y el esquema `TryTiendas` (base de datos corporativa de productos).

### Tablas Principales:
- `rpe.Products`: Registro físico de los hallazgos de EANs escaneados y validados. Cada registro exitoso suma 1 minuto (`timeEarned = 1`) al usuario.
- `rpe.UserUsers`: Operarios autorizados para el uso del sistema.
- `rpe.TimeRedemptions`: Registro manual de los minutos redimidos por los operarios.
- `rpe.trackLogin`: Registro auditor de los inicios de sesión por parte del personal.
- `TryTiendas.FixProducts` y `TryTiendas.InvBrands`: Catálogos de base de datos corporativos de referencia.

### 🛡️ Triggers y Blindajes Críticos (Integridad de Datos)
1. **Trigger de Saldo (`trg_CheckBalance`)**:
   Implementado en la tabla `rpe.TimeRedemptions` para evitar saldos negativos. Se ejecuta ante operaciones de inserción y valida que el total ganado acumulado menos el total redimido no sea menor a cero. Si ocurre una violación, lanza un `RAISERROR` y ejecuta un `ROLLBACK TRANSACTION`.
2. **Fecha de Redención Automática (`DF_RedemptionDate`)**:
   Restricción de valor predeterminado `DEFAULT GETDATE()` asignada a la columna `redemptionDate`.
3. **Protección de Ranking**:
   La consulta que calcula el balance de minutos utiliza un bloque lógico `CASE` para que, en caso de cualquier desajuste menor, nunca se rendericen valores negativos a nivel de la interfaz (los muestra como `0`).

---

## 🌐 Endpoints de la API (`/api`)

### 1. Autenticación y Operarios
- **`GET /api/login/{cedula}`**: Comprueba la validez de la cédula del operario y registra la traza de auditoría de inicio de sesión.
- **`GET /api/user-stats/{cedula}`**: Retorna el saldo actual de minutos ganados y los últimos 5 escaneos realizados.

### 2. Escaneo y Guardado (Calidad de Datos)
- **`GET /api/scan/{ean}`**: Ejecuta un triple-check para verificar si el código de barras ya existe en `rpe.Products` o en `TryTiendas.FixProducts` (omitiendo códigos temporales que inicien con `TC`).
- **`POST /api/save`**: Registra un nuevo hallazgo. Convierte automáticamente todos los campos a mayúsculas y aplica las reglas del **Quality Guard**.
  - **Quality Guard**: El Contenido y la Unidad de Medida son obligatorios para guardar, excepto si el producto pertenece a la lista de excepciones (`NO_MEASURE_PRODUCTS`).
- **`GET /api/config/no-measure-products`**: Expone la lista blanca de productos exentos de contenido y unidad (ej. `ESCOBA`, `TRAPEADOR`, etc.).

### 3. Utilidades y Autocompletado (Optimización de DOM)
- **`GET /api/brands`**: Lista las marcas corporativas registradas en el catálogo.
- **`GET /api/base-products`**: Recupera los nombres de producto base únicos (`DISTINCT`) de forma ordenada para alimentar la ayuda de autocompletado en el frontend.
- **`GET /api/ranking`**: Genera el top 5 de operarios con base en minutos netos acumulados.

---

## 🐳 Despliegue con Docker

El archivo `Dockerfile` en esta carpeta configura una imagen optimizada basada en Debian que instala las dependencias de sistema necesarias para compilar `pyodbc` con el driver oficial de SQL Server de Microsoft.
Para construir la imagen de forma aislada:
```bash
docker build -t registraon-backend .
```
o ejecútalo mediante el orquestador principal en la raíz con `docker-compose`.
