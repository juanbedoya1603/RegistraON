# RegistraON Frontend

Aplicacion de pagina unica (SPA) construida con React 19 y compilada con Vite. Implementa la interfaz de operador para escaneo de codigos de barras, registro de productos y visualizacion de ranking gamificado. Se despliega como un conjunto de archivos estaticos servidos por Nginx Alpine.

## Stack Tecnologico

| Tecnologia               | Version | Funcion                                        |
| ------------------------ | ------- | ---------------------------------------------- |
| React                    | 19.2.5  | Biblioteca de componentes UI con Virtual DOM   |
| React DOM                | 19.2.5  | Renderizador para entornos de navegador        |
| Vite                     | 8.0.9   | Bundler y servidor de desarrollo con HMR       |
| Tailwind CSS             | 3.4.19  | Framework de utilidades CSS                    |
| PostCSS                  | 8.5.10  | Pipeline de transformacion CSS                 |
| Autoprefixer             | 10.5.0  | Insercion automatica de prefijos de proveedor  |
| html5-qrcode             | 2.3.8   | Decodificacion de codigos de barras via camara |
| lucide-react             | 1.8.0   | Biblioteca de iconos SVG                       |
| @vitejs/plugin-basic-ssl | 2.3.0   | Certificado SSL auto-firmado para desarrollo   |
| @vitejs/plugin-react     | 6.0.1   | Soporte JSX y Fast Refresh para React          |

## Patrones de Rendimiento UX

### Buffer de Estabilizacion de Fotogramas (CameraScanner)

El componente `CameraScanner.jsx` implementa un sistema de votacion por consenso para mitigar lecturas falsas causadas por reflejos, movimiento del dispositivo o artefactos opticos de la camara:

1. **Filtro de formato:** Solo se aceptan codigos que coincidan estrictamente con los formatos `EAN_13` y `EAN_8` mediante la configuracion `formatsToSupport` de `html5-qrcode`. Los formatos `UPC_A` y `UPC_E` estan deliberadamente excluidos para evitar lecturas de 12 digitos falsos.

2. **Escudo matematico:** Cada lectura es validada mediante el algoritmo de checksum EAN estandar (multiplicadores alternos 1/3 para EAN-13, 3/1 para EAN-8). Las lecturas que no pasan la validacion son descartadas silenciosamente.

3. **Urna de votacion:** Los codigos validados se almacenan en un buffer circular de 5 posiciones (`MAX_HISTORY = 5`). Un codigo solo se acepta como lectura definitiva cuando acumula 3 votos identicos consecutivos (`REQUIRED_VOTES = 3`). Esto elimina alucinaciones de un solo fotograma.

4. **Control de FPS:** La tasa de escaneo esta configurada en 15 FPS (`fps: 15`), un equilibrio entre la agilidad de deteccion y la carga de CPU. Valores superiores provocan colapsos de rendimiento en Safari/iOS.

### Limites de Consulta del DOM

Las listas de autocompletado (`datalist`) para Producto Base y Marca aplican las siguientes restricciones para mitigar lag de renderizado en dispositivos de baja gama:

- **Activacion por umbral:** El `datalist` solo se monta en el DOM cuando el usuario ha escrito 2 o mas caracteres (`form.product.length >= 2`). Esto evita renderizar la lista completa de productos (potencialmente miles de entradas) al enfocar el campo.
- **Limite de 50 elementos:** Los resultados filtrados se truncan a 50 entradas mediante `.slice(0, 50)` antes de ser renderizados como nodos `<option>`.

### Mitigacion de Pantallas Blancas por Traduccion

El archivo `index.html` incluye el atributo `translate="no"` en la etiqueta `<html>`. Esto impide que los motores de traduccion automatica del navegador (como Google Translate, inyectado automaticamente en Chrome en ciertos dispositivos) modifiquen el DOM de React, lo cual provoca inconsistencias entre el Virtual DOM y el DOM real, resultando en pantallas blancas irrecuperables. El componente `CameraScanner` refuerza esta proteccion con la clase CSS `notranslate`.

### Escalado Responsive de Interfaz

El archivo `index.css` aplica una reduccion global del `font-size` al 80% para pantallas con `min-width: 768px`. Dado que Tailwind CSS utiliza unidades `rem` derivadas del `font-size` de la raiz, esto produce un efecto de escalado proporcional del 80% en toda la interfaz cuando se visualiza desde portatiles o monitores de escritorio, optimizando la densidad de informacion sin afectar la experiencia en dispositivos moviles.

## Arquitectura Jerarquica de Componentes

RegistraON no utiliza un enrutador de cliente (React Router). La navegacion entre vistas se gestiona mediante una variable de estado `view` en el componente raiz `App.jsx`, que alterna condicionalmente entre `LoginPage` y `DashboardPage`.

```
App.jsx (Raiz)
|-- Estado global: view, cedula, userName, toast
|-- Sistema de Toast (notificaciones flotantes)
|
|-- LoginPage.jsx
|   Formulario de autenticacion por numero de cedula.
|   Valida longitud minima (5 digitos).
|   Invoca GET /api/login/{cedula}.
|
|-- DashboardPage.jsx
    |-- Estado: ean, showModal, history, userTime, dailyCount,
    |   ranking, brandList, productList, noMeasureProducts, form
    |-- Validacion de checksum EAN-13/EAN-12 en cliente
    |-- Generacion del nombre mnemotecnico (fullName)
    |-- Audio feedback (beep.mp3) al escanear
    |
    |-- Header.jsx
    |   Barra superior con logotipo, nombre del operador
    |   y boton de acceso al tutorial en video.
    |
    |-- ScannerSection.jsx
    |   |-- Selector de modo: Teclado/Laser vs. Camara
    |   |-- Input de texto para lectores laser USB
    |   |-- Indicador de limite diario (desactiva input al alcanzar 5/5)
    |   |
    |   |-- CameraScanner.jsx
    |       Visor de camara trasera (facingMode: environment).
    |       Buffer de estabilizacion de 3 votos.
    |       Limpieza silenciosa del recurso de camara en unmount.
    |
    |-- RecentActivity.jsx
    |   Historial de los ultimos 5 productos registrados.
    |   Muestra EAN, nombre completo y bonificacion (+1 MIN).
    |
    |-- Sidebar.jsx
    |   Panel lateral con ranking TOP 5.
    |   Muestra saldo actual del operador.
    |   Boton de cierre de sesion.
    |
    |-- ProductModal.jsx
    |   Formulario de registro con campos:
    |   Producto Base, Marca, Caracteristica, Contenido,
    |   Unidad de Medida, Unidad de Venta.
    |   Previsualizacion en tiempo real del nombre mnemotecnico.
    |   Deteccion de palabras redundantes con alerta visual.
    |   Autocompletado desde catalogos corporativos.
    |   Guia de estandarizacion desplegable.
    |   Quality Guard en cliente (sincronizado con backend).
    |
    |-- VideoModal.jsx
        Reproductor de video tutorial embebido (/tutorial.mp4).
        Reproduccion automatica al abrir.
```

### Capa de Servicios (api.js)

Todas las llamadas HTTP se centralizan en `src/services/api.js`, que expone un objeto `api` con metodos asincronicos basados en `fetch` nativo. La URL base se obtiene de la variable de entorno `VITE_API_URL`, que apunta a `/api` en produccion (resuelto por Nginx) y a `http://localhost:8000/api` en desarrollo.

| Metodo                       | Endpoint                          | Verbo HTTP |
| ---------------------------- | --------------------------------- | ---------- |
| `api.login(cedula)`          | `/api/login/{cedula}`             | GET        |
| `api.scanEan(ean)`           | `/api/scan/{ean}`                 | GET        |
| `api.saveProduct(payload)`   | `/api/save`                       | POST       |
| `api.getRanking()`           | `/api/ranking`                    | GET        |
| `api.getUserStats(cedula)`   | `/api/user-stats/{cedula}`        | GET        |
| `api.getBrands()`            | `/api/brands`                     | GET        |
| `api.getBaseProducts()`      | `/api/base-products`              | GET        |
| `api.getNoMeasureProducts()` | `/api/config/no-measure-products` | GET        |

Todos los metodos deserializan la respuesta JSON y propagan errores con la estructura `{ status, message }` extraida del campo `detail` de FastAPI.

## Compilacion Estatica

Para generar el bundle de produccion:

```bash
npm run build
```

Los archivos resultantes se depositan en el directorio `dist/`. En el Dockerfile multi-etapa, este directorio se copia a `/usr/share/nginx/html` dentro de la imagen final de Nginx Alpine.

La variable de entorno `VITE_API_URL` se establece como `/api` durante el build de Docker, permitiendo que las peticiones HTTP utilicen rutas relativas resueltas por el proxy inverso de Nginx.

## Desarrollo con Hot-Reload

Para iniciar el servidor de desarrollo con Hot Module Replacement (HMR):

```bash
npm install
npm run dev
```

**Configuracion de Vite (`vite.config.js`):**

- **Plugin React:** Habilita Fast Refresh para recarga instantanea de componentes sin perder estado.
- **Plugin Basic SSL:** Genera un certificado SSL auto-firmado para servir la aplicacion sobre HTTPS. Esto es necesario para acceder a la API `getUserMedia` (camara del dispositivo) desde navegadores moviles, que requieren un contexto seguro.
- **Host expuesto:** La opcion `server.host = true` permite que el servidor de desarrollo sea accesible desde otros dispositivos en la misma red local, facilitando pruebas en telefonos y tablets.

**Variable de entorno para desarrollo:**

```bash
# frontend/.env
VITE_API_URL=http://localhost:8000/api
```

El servidor de desarrollo de Vite escucha por defecto en el puerto `5173` con HTTPS habilitado.
