# RegistraON

Sistema distribuido de registro de productos por codigo de barras con incentivos gamificados. Permite a operadores de tienda escanear articulos no catalogados, construir su nombre estandarizado mediante un formulario mnemotecnico y acumular minutos canjeables por cada hallazgo registrado.

## Arquitectura del Sistema

RegistraON opera bajo un modelo cliente-servidor de dos capas, desplegado como un conjunto de contenedores Docker orquestados por Docker Compose.

```
                            Puerto 8888
                                |
                      +---------v----------+
                      |   Nginx (Alpine)   |
                      |   Proxy Inverso    |
                      +---+------------+---+
                          |            |
              Estáticos   |            |   /api/*
              (React SPA) |            |   (Reverse Proxy)
                          v            v
                +----------+    +-----------+
                | Frontend |    |  Backend  |
                | (dist/)  |    | (Uvicorn) |
                | HTML/JS  |    | Puerto    |
                |          |    | 8000      |
                +----------+    +-----+-----+
                                      |
                                      | pyodbc
                                      | ODBC Driver 17
                                      v
                              +-------+--------+
                              |  SQL Server    |
                              |  Esquema: rpe  |
                              |  + TryTiendas  |
                              +----------------+
```

**Flujo de red:** El navegador del operador se conecta al puerto `8888`. Nginx sirve los archivos estaticos compilados de React para cualquier ruta que no comience con `/api/`. Las peticiones que coinciden con el prefijo `/api/` son reenviadas internamente al contenedor `backend` en el puerto `8000`, donde Uvicorn ejecuta la aplicacion FastAPI. El backend se conecta a SQL Server mediante el controlador ODBC 17 de Microsoft a traves de `pyodbc`.

## Reglas de Negocio del Core

El sistema implementa cinco invariantes que no pueden ser desactivadas ni omitidas por configuracion:

### 1. Inmutabilidad Append-Only

La tabla `rpe.Products` es estrictamente aditiva. No existen endpoints de actualizacion (`PUT`, `PATCH`) ni de eliminacion (`DELETE`) en la API. Un registro insertado es permanente e inalterable.

### 2. Escudo Matematico del EAN

Antes de aceptar un codigo, el sistema ejecuta un Doble-Check de seguridad:

- **Chequeo primario:** Consulta `rpe.Products` para verificar que el `barCode` no existe.
- **Chequeo secundario:** Consulta `TryTiendas.FixProducts` para verificar que el `barCode` no existe en el catalogo maestro corporativo. Los registros temporales con prefijo `TC%` son explicitamente excluidos de esta validacion mediante la clausula `barCode NOT LIKE 'TC%'`.

Adicionalmente, el frontend aplica validacion de digito verificador EAN-13/EAN-8 mediante el algoritmo de checksum estandar (multiplicadores alternos 1 y 3) antes de enviar la peticion al backend.

### 3. Limite Diario de Rendimiento

Cada operador puede registrar un maximo de **5 productos por dia calendario**. El conteo se calcula ajustando la zona horaria del servidor UTC a la hora local de Colombia (`DATEADD(hour, -5, ...)`). Al alcanzar el limite, el endpoint `POST /api/save` responde con HTTP 403.

### 4. Quality Guard de Volumetrias

El campo `nmContentValue` (contenido numerico) y `nmContentUnit` (unidad de medida) son obligatorios para todo producto, **excepto** aquellos cuyo nombre base aparezca en la lista de excepciones `NO_MEASURE_PRODUCTS`. Esta lista contiene mas de 300 palabras clave agrupadas en 12 categorias (Aseo y Hogar, Bazar y Cocina, Cuidado Personal, Papeleria, Ferreteria, Textiles, Bebe, Fiestas, Vehiculos, Mascotas, Electronica, Jardineria, Organizacion). La validacion se ejecuta tanto en el frontend como en el backend.

### 5. Algoritmo Mnemotecnico de Strings en Mayusculas

Todos los campos de texto del payload (`nmProduct`, `nmBrand`, `nmCharacteristic`, `nmContentValue`, `nmContentUnit`, `nmSalesUnit`) son convertidos a mayusculas mediante `.upper()` en la capa de servicios del backend antes de la insercion. El nombre completo (`fullName`) se construye concatenando los campos en un orden determinista:

```
PRODUCTO MARCA CARACTERISTICA X CONTENIDO UNIDAD UNIDAD_VENTA
```

## Estructura del Repositorio

```
App_RegistraON/
|
|-- docker-compose.yml          # Orquestador de servicios (backend + frontend)
|-- .dockerignore                # Exclusiones para contexto de build
|-- .gitignore                   # Exclusiones de control de versiones
|
|-- backend/                     # Servicio API (FastAPI + Uvicorn)
|   |-- main.py                  # Punto de entrada ASGI, configuracion CORS
|   |-- database.py              # Fabrica de conexiones pyodbc (generador)
|   |-- schemas.py               # Modelos Pydantic de validacion de contratos
|   |-- Dockerfile               # Imagen multi-paso (Python 3.11-slim + ODBC 17)
|   |-- requirements.txt         # Dependencias congeladas de Python
|   |-- .env.example             # Plantilla de variables de entorno
|   |-- routers/
|   |   |-- scanner.py           # Definicion de endpoints HTTP
|   |-- services/
|   |   |-- product_service.py   # Logica de negocio y lista NO_MEASURE_PRODUCTS
|   |-- infrastructure/
|       |-- repositories/
|           |-- product_repository.py  # Consultas SQL y acceso a datos
|
|-- frontend/                    # Aplicacion SPA (React 19 + Vite)
    |-- index.html               # Shell HTML con atributo translate="no"
    |-- vite.config.js           # Configuracion de Vite con plugin SSL y React
    |-- tailwind.config.js       # Animaciones personalizadas (scan, fade-in)
    |-- postcss.config.js        # Pipeline PostCSS (Tailwind + Autoprefixer)
    |-- package.json             # Dependencias npm y scripts
    |-- Dockerfile               # Build multi-etapa (Node 20 -> Nginx Alpine)
    |-- nginx.conf               # Reverse proxy y servidor de estaticos
    |-- .env.example             # Variable VITE_API_URL
    |-- src/
        |-- main.jsx             # Montaje de React en StrictMode
        |-- App.jsx              # Controlador raiz de vistas y sistema de Toast
        |-- index.css            # Directivas Tailwind y escalado responsive (80%)
        |-- services/
        |   |-- api.js           # Capa de abstraccion HTTP (fetch nativo)
        |-- pages/
        |   |-- LoginPage.jsx    # Pantalla de autenticacion por cedula
        |   |-- DashboardPage.jsx # Pantalla principal de escaneo y registro
        |-- components/
            |-- Spinner.jsx      # Indicador de carga reutilizable
            |-- dashboard/
                |-- Header.jsx         # Barra superior con identidad y tutorial
                |-- ScannerSection.jsx # Selector dual de modo (teclado/camara)
                |-- CameraScanner.jsx  # Visor de camara con buffer de estabilizacion
                |-- ProductModal.jsx   # Formulario de registro con guia integrada
                |-- RecentActivity.jsx # Listado de ultimos 5 registros
                |-- Sidebar.jsx        # Panel lateral con ranking y saldo
                |-- VideoModal.jsx     # Reproductor de tutorial embebido
```

## Despliegue Local

### Requisitos Previos

- Docker Engine 20.10 o superior.
- Docker Compose v2.
- Acceso de red a la instancia de SQL Server configurada.

### Procedimiento

1. Clonar el repositorio:

```bash
git clone <url-del-repositorio>
cd App_RegistraON
```

2. Configurar las variables de entorno del backend:

```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env` con las credenciales de SQL Server:

```
SQL_SERVER=<host_o_ip>
SQL_DB=<nombre_base_datos>
SQL_USER=<usuario>
SQL_PASS=<contrasena>
```

3. Construir y levantar los contenedores:

```bash
docker compose up --build
```

4. Acceder a la aplicacion:

```
http://localhost:8888
```

El contenedor `registraon_frontend` sirve la SPA en el puerto `8888` y actua como proxy inverso para las peticiones `/api/` hacia el contenedor `registraon_backend`.

### Modo de Desarrollo (sin Docker)

Para desarrollo local sin contenedores:

**Backend:**

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

El servidor de desarrollo de Vite se levanta con HTTPS habilitado mediante el plugin `@vitejs/plugin-basic-ssl` y escucha en todas las interfaces de red (`host: true`) para permitir pruebas desde dispositivos moviles en la misma red local.
