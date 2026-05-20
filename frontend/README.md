# RegistraON - Frontend App 💻

Este es el cliente del proyecto **RegistraON**, una SPA (Single Page Application) modular construida con **React**, **Vite** y **TailwindCSS**. Presenta una interfaz de usuario optimizada para la productividad, con diseño responsive y estética cibernética oscura.

---

## ⚡ Tecnologías Principales

- **Biblioteca Principal**: React (v18+)
- **Herramienta de Construcción**: Vite
- **Estilos**: TailwindCSS para control del layout y estética moderna.
- **Iconografía**: Lucide-React
- **Animaciones**: Tailwind transitions y animaciones custom (como la línea láser de escaneo).

---

## 📁 Arquitectura Modular de Componentes (`src/`)

Para mantener el código limpio y mantenible (Clean Code), la interfaz del panel se modularizó de la siguiente manera:

```text
src/
├── services/
│   └── api.js                # Métodos de fetch integrados con el backend (login, scan, save, config)
├── pages/
│   ├── LoginPage.jsx         # Página de login que maneja ingreso por documento (cédula)
│   └── DashboardPage.jsx     # Orquestador del panel principal y estados reactivos del operario
├── components/
│   ├── Spinner.jsx           # Cargador visual para procesos de espera
│   └── dashboard/
│       ├── Header.jsx        # Barra superior con los logotipos, nombre del operario activo y botón del tutorial
│       ├── ScannerSection.jsx# Área de lectura de código de barras con animación láser activa
│       ├── Sidebar.jsx       # Panel lateral que aloja el Ranking de ganadores y el saldo acumulado
│       ├── RecentActivity.jsx# Grilla con los últimos 5 hallazgos registrados por el operario
│       ├── VideoModal.jsx    # Modal de video instructivo del manual corporativo
│       └── ProductModal.jsx  # Modal dinámico de creación del producto que integra:
│           - Autocompletado optimizado para Producto Base y Marcas (límite de 50 elementos para evitar lag en DOM)
│           - Panel lateral de estandarización expandible dinámicamente
│           - Validación y desactivación reactiva de Contenido y Unidad si aplica la lista de excepciones (Quality Guard)
```

---

## ⚙️ Configuración y Variables de Entorno

El frontend requiere saber dónde está alojado el servidor backend.
Crea un archivo `.env` en este directorio con la siguiente variable tomando como referencia `.env.example`:

```env
VITE_API_URL=http://localhost:8000/api
```

---

## 🚀 Ejecución en Desarrollo (Local)

1. **Instalar Dependencias**:
   ```bash
   npm install
   ```

2. **Ejecutar Servidor Local**:
   ```bash
   npm run dev
   ```
   El frontend estará disponible en `http://localhost:5173`.

---

## 🐳 Construcción para Producción

### Construcción Estática Local:
```bash
npm run build
```
Esto creará la carpeta compilada `/dist` lista para ser servida.

### Producción con Docker:
El `Dockerfile` del frontend realiza una construcción multi-etapa:
1. Compila la aplicación usando una imagen ligera de **Node.js**.
2. Copia los archivos de distribución resultante a una imagen de producción de **Nginx**.
3. Configura el archivo `nginx.conf` como un proxy inverso para redirigir las peticiones del endpoint `/api` directamente al contenedor backend, evitando problemas de CORS en producción.

Para levantar de manera aislada:
```bash
docker build -t registraon-frontend .
```
o corre el orquestador principal mediante `docker-compose` en la raíz.
