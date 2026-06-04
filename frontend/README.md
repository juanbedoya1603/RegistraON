# RegistraON - Capa Frontend

Aplicación de Página Única (SPA) corporativa orientada a la eficiencia operativa, escaneo de inventario y visualización de progreso gamificado.

## Stack Tecnológico

- Core: `React 19`, `Vite`
- Estilización: `Tailwind CSS` (`PostCSS`)
- Componentes e Íconos: `Lucide-React`
- Escáner: `html5-qrcode` (Cámara de hardware)

## Patrones de Interfaz y UX

La interfaz prioriza la velocidad de captura en ambientes industriales:

- Soporte Dual de Escaneo: Entrada prioritaria mediante lectores láser (teclado) con opción secundaria de activación de cámara móvil (con algoritmo de estabilización y votación de fotogramas).
- Autocompletado Optimizado: Las listas desplegables (Marcas, Producto Base) están limitadas computacionalmente a 50 resultados para evitar degradación del Virtual DOM en dispositivos de bajos recursos.
- Prevención de Errores: Desactivación reactiva de botones y campos durante validaciones asíncronas. Prevención de interferencias del navegador (bloqueo de traducción automática vía metadatos y clases).

## Estructura de Componentes

La aplicación mantiene un enrutamiento por estado (SPA pura sin React Router) para minimizar la carga:

- `components/dashboard/CameraScanner.jsx`: Lógica de hardware y buffer anti-reflejos.
- `components/dashboard/ProductModal.jsx`: Formulario dinámico y motor mnemotécnico en tiempo real.
- `components/dashboard/ScannerSection.jsx`: Gestor de inputs (láser vs cámara).
- `components/dashboard/Sidebar.jsx`: Panel de estado y gamificación.
- `pages/DashboardPage.jsx`: Orquestador principal de flujos.
- `pages/LoginPage.jsx`: Controlador de acceso.
- `services/api.js`: Cliente HTTP centralizado (Fetch API).

## Compilación y Despliegue

El entorno de producción se construye en múltiples etapas mediante Docker, delegando el enrutamiento y proxy de la API a Nginx para mitigar bloqueos de CORS.

Para compilar estáticos localmente:

```bash
npm install
npm run dev
```

O para compilar el bundle de producción:

```bash
npm run build
```
