# RegistraON 🚀

RegistraON es una plataforma web modular diseñada para la captura de inventarios, estandarización de códigos de barras (EAN) y gamificación en tiempo real para operarios. La aplicación combina un sistema de escaneo rápido con un panel de control dinámico que incentiva la productividad otorgando minutos acumulables a los operarios por cada hallazgo válido registrado.

---

## 🌟 Características Principales

- **Escaneo y Validación en Tiempo Real**: Escaneo rápido de códigos EAN con feedback instantáneo y validación de duplicados mediante un triple-check de seguridad.
- **Manual de Estandarización Integrado**: Panel lateral expandible en el modal de creación de productos que guía al operario bajo las normas de mnemotecnia del negocio.
- **Quality Guard Inteligente (Lista Blanca)**: Sistema de validación reactivo en el frontend y blindado en el backend que exige campos de contenido volumétrico de forma obligatoria, excepto para productos exentos (ej. escobas, cuadernos, platos, etc.).
- **Gamificación**: Ranking de los 5 operarios con mayor puntaje (minutos ganados) y visualización del saldo acumulado individual en tiempo real.
- **Diseño Cibernético/Minimalista**: Interfaz oscura de alto rendimiento con animaciones fluidas (línea láser de escaneo, transiciones de paneles) y optimizada para uso continuo en pantallas de tablets, computadores y dispositivos móviles.

---

## 📁 Estructura del Proyecto

El repositorio está estructurado bajo una arquitectura de contenedores Docker independientes:

```text
App_RegistraON/
├── backend/               # Servidor API FastAPI (Python 3.11)
│   ├── infrastructure/    # Capa de repositorios SQL Server (pyodbc)
│   ├── routers/           # Definición de endpoints y validaciones API
│   ├── schemas.py         # Modelos de validación Pydantic
│   ├── Dockerfile         # Dockerfile de producción para el Backend
│   └── .env.example       # Plantilla de variables de entorno del backend
├── frontend/              # Aplicación Web SPA (React + Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/    # Componentes modulares y reutilizables
│   │   ├── pages/         # Páginas principales (Login, Dashboard)
│   │   └── services/      # Cliente de comunicación API
│   │   index.html
│   ├── Dockerfile         # Construcción multi-etapa con Nginx
│   ├── nginx.conf         # Configuración del proxy inverso Nginx
│   └── .env.example       # Plantilla de variables de entorno del frontend
├── docker-compose.yml     # Orquestación de contenedores del entorno completo
└── .gitignore             # Configuración de exclusión de git (asegura no subir secretos)
```

---

## 🛠️ Requisitos Previos

Para ejecutar la aplicación localmente mediante contenedores necesitas tener instalado:

- [Docker](https://www.docker.com/) (versión 20.10 o superior)
- [Docker Compose](https://docs.docker.com/compose/) (versión 1.29 o superior)

Si deseas ejecutar el desarrollo local sin Docker:
- [Node.js](https://nodejs.org/) (v18 o superior) y npm
- [Python](https://www.python.org/) (v3.10 o superior)
- Controladores ODBC de SQL Server instalados en tu sistema operativo (Microsoft ODBC Driver 17 for SQL Server)

---

## ⚡ Instalación y Lanzamiento Rápido (Docker Compose)

1. **Clonar el Repositorio**:
   ```bash
   git clone -b develop <url-del-repositorio> App_RegistraON
   cd App_RegistraON
   ```

2. **Configurar Variables de Entorno**:
   Crea los archivos `.env` en sus respectivas carpetas tomando como guía los archivos `.env.example`:
   - Copia `backend/.env.example` como `backend/.env` y ajusta las credenciales de SQL Server.
   - Copia `frontend/.env.example` como `frontend/.env` si deseas cambiar el endpoint de la API.

3. **Lanzar la Aplicación**:
   Ejecuta el siguiente comando en la raíz del proyecto:
   ```bash
   docker-compose up --build -d
   ```
   Este comando construirá las imágenes del backend y frontend y las ejecutará en segundo plano.

4. **Acceder a la Plataforma**:
   - **Frontend (Interfaz de Usuario)**: Abre tu navegador web en [http://localhost:8888](http://localhost:8888)
   - **Backend API (Swagger Docs)**: Accede a [http://localhost:8000/docs](http://localhost:8000/docs) para interactuar directamente con la documentación interactiva de la API.

---

## 🛡️ Seguridad y Buenas Prácticas (.env)

> [!WARNING]
> **REGLA DE SEGURIDAD CRÍTICA:** Nunca expongas credenciales reales, contraseñas o archivos `.env` en los commits de Git.
> Asegúrate de que tanto `backend/.env` como `frontend/.env` se encuentren debidamente registrados en el archivo `.gitignore` y que la documentación solo contenga valores ilustrativos (`dummy data`).

---

## 👥 Créditos
Desarrollado y mantenido por el equipo de BI de Tiendas ON.
Autor: **Juan Jose B.**
