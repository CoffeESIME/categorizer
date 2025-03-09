A continuación se muestra un ejemplo de README.md que documenta la instalación, configuración y uso del proyecto:

---

# Knowledge Base for Categorizer

Este proyecto es una aplicación web desarrollada con [Next.js](https://nextjs.org/) que permite la carga, visualización y procesamiento de archivos para categorización. La aplicación incluye funcionalidades para:

- **Subir archivos**: Permite seleccionar y cargar múltiples archivos.
- **Listar archivos pendientes**: Muestra los archivos cargados que aún no han sido procesados.
- **Procesar archivos**: Utiliza diferentes métodos (LLM, OCR o manual) para extraer metadatos y categorizar los archivos.
- **Visualización**: Interfaz amigable con componentes personalizados, utilizando Tailwind CSS para estilos y Zustand para el manejo del estado.

---

## Tabla de Contenidos

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
  - [Desarrollo](#desarrollo)
  - [Producción](#producción)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Contribución](#contribución)
- [Licencia](#licencia)

---

## Requisitos

- [Node.js](https://nodejs.org/) (v14 o superior)
- [npm](https://www.npmjs.com/) o [Yarn](https://yarnpkg.com/)
- Conexión a la API externa de categorización (se requiere configurar las variables de entorno)

---

## Instalación

1. **Clona el repositorio:**

   ```bash
   git clone https://tu-repositorio-url.git
   cd nombre-del-proyecto
   ```

2. **Instala las dependencias:**

   Utilizando npm:
   ```bash
   npm install
   ```

   O, utilizando Yarn:
   ```bash
   yarn install
   ```

---

## Configuración

El proyecto utiliza variables de entorno para conectarse a la API de categorización y configurar otros parámetros. Crea un archivo `.env.local` en la raíz del proyecto y define al menos las siguientes variables:

```env
# URL base para las llamadas al API de categorizador
NEXT_PUBLIC_CATEGORIZER_URL=https://tu-api-categorizer.com

# URL base para las llamadas al API para procesamiento (LLM, OCR, etc.)
NEXT_PUBLIC_API_URL=https://tu-api-de-procesamiento.com
```

Asegúrate de reemplazar las URLs por las correspondientes a tu entorno.

---

## Uso

### Desarrollo

Para iniciar el servidor de desarrollo y probar la aplicación localmente, ejecuta:

```bash
npm run dev
```

O, si usas Yarn:

```bash
yarn dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

### Producción

1. **Compilar la aplicación:**

   ```bash
   npm run build
   ```

2. **Iniciar el servidor en modo producción:**

   ```bash
   npm run start
   ```

---

## Estructura del Proyecto

El proyecto cuenta con la siguiente organización de directorios y archivos principales:

- **`app/`**: Contiene las páginas y componentes principales.
  - **`layout.tsx`**: Define la estructura global de la aplicación e importa hojas de estilos.
  - **`page.tsx`**: Página principal que muestra opciones de categorización.
  - **`upload-files/`**: Página para la carga de múltiples archivos.
  - **`pending/`**: Página que lista los archivos pendientes de procesamiento.
  - **`processing/`**: Página para procesar archivos (extraer metadatos con LLM y OCR).
- **`components/`**: Componentes reutilizables (botones, listas, formularios, etc.).
- **`store/filestore.ts`**: Maneja el estado de los archivos utilizando Zustand y persiste la información.
- **`lib/`**: Utilidades generales (por ejemplo, funciones para combinar clases CSS).
- **`utils/categorizerAPI.ts`**: Funciones para interactuar con el API del categorizador, incluyendo métodos para subir archivos, obtener archivos, procesar con LLM y OCR, y guardar metadatos.
- **Archivos de configuración**:
  - `next.config.ts`: Configuración de Next.js.
  - `next-env.d.ts`: Definiciones de tipos para Next.js.

---

## Tecnologías Utilizadas

- **Next.js**: Framework para React que facilita el desarrollo de aplicaciones web con SSR y rutas automáticas.
- **React**: Biblioteca para construir interfaces de usuario.
- **Tailwind CSS**: Framework de CSS para estilos rápidos y personalizados.
- **Zustand**: Biblioteca para manejo del estado global.
- **Axios y Fetch API**: Para realizar peticiones HTTP a la API.
- **TypeScript**: Superset de JavaScript que añade tipado estático.

---

## Contribución

Si deseas contribuir al proyecto, sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama para tu feature o fix: `git checkout -b mi-feature`.
3. Realiza tus cambios y haz commits descriptivos.
4. Envía un pull request describiendo detalladamente tus cambios.

---

## Licencia

Este proyecto se distribuye bajo la [Licencia MIT](LICENSE).

---

Este README proporciona las instrucciones básicas para instalar, configurar y utilizar la aplicación. Asegúrate de revisar cada sección y adaptarla a las particularidades de tu entorno y requisitos específicos.