# Sistema de Gestión Hotelera - Frontend

Sistema web de gestión hotelera que permite administrar reservas, check-in/check-out, facturación de estadías y servicios adicionales.

##  Inicio Rápido

### Requisitos

- Node.js 20.19+ o 22.12+ (lo exige Vite 8; el CI usa Node 22)
- npm

### Instalación

```bash
# Clonar el repositorio
git clone [repository-url]
cd TP-3k01-Gasparetti-Godoy-Torres-Frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con la URL de la API
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# El servidor estará disponible en http://localhost:5173/
```

### Build

```bash
# Construir para producción
npm run build

# Preview de la build de producción
npm run preview
```

### Linting

```bash
# Ejecutar ESLint
npm run lint
```

### Tests

```bash
npm test          # tests unitarios/de componentes (Vitest + Testing Library)
npm run test:watch
npm run test:e2e   # tests end-to-end en un navegador real (Playwright)
```

Los tests end-to-end levantan el propio servidor de desarrollo (`npm run dev`) automáticamente;
no requieren que el backend esté corriendo, porque cubren flujos que no dependen de una API real
(validación de formularios, ruteo, redirecciones de rutas protegidas).

## 📁 Estructura del Proyecto

```
├── .github/
│   ├── workflows/ci.yml   # CI: lint, tests, build, auditoría y e2e
│   └── dependabot.yml     # Actualización periódica de dependencias
├── docs/                  # Documentación interna
├── e2e/                   # Tests end-to-end (Playwright)
├── public/                # Archivos estáticos
├── src/
│   ├── assets/            # Logos e imágenes del hero
│   ├── components/        # ProtectedRoute, ErrorBoundary, HeroCarousel, BookingBar,
│   │                      # DateInput, SelectorUbicacion, GaleriaImagenes, CategoriasShowcase
│   ├── context/           # AuthContext + useAuth: sesión, usuario logueado y rol
│   ├── hooks/
│   │   └── useQuery.js    # Pedidos a la API con estado de carga/error y recarga
│   ├── layouts/
│   │   └── MainLayout.jsx # Layout principal con navegación (según sesión y rol)
│   ├── models/            # Modelos de dominio (Reserva, Habitacion, Huesped...) y roles
│   ├── pages/             # Una página por ruta (ver "Rutas de la Aplicación")
│   ├── services/
│   │   ├── api.js         # Cliente HTTP base (fetch, token de sesión, manejo de errores)
│   │   └── recursos.js    # Un servicio por recurso de la API, devuelve modelos
│   ├── styles/            # Estilos Sass (ver "Estilos")
│   ├── test/              # Setup de tests unitarios
│   ├── utils/             # Utilidades (descarga de archivos, p. ej. el PDF del check-out)
│   ├── App.jsx            # Definición de rutas
│   └── main.jsx
├── index.html
├── vite.config.js         # Config de Vite y de Vitest
├── playwright.config.js
├── eslint.config.js
└── package.json
```

## 🔐 Autenticación y roles

Hay tres roles, resueltos por el backend (definidos en `src/models/tipos.js`):

- **Huésped** (cualquier usuario logueado): puede buscar y reservar habitaciones, agregar
  servicios a su reserva y ver/cancelar sus propias reservas en "Mis Reservas".
- **Empleado** (staff): accede además al panel de gestión (reservas, habitaciones, huéspedes,
  check-in/out, servicios, cupos, precios, provincias y ciudades) y puede editar categorías.
- **Admin**: todo lo anterior, más la gestión de empleados y usuarios.

Las rutas se protegen en `App.jsx` con `<ProtectedRoute roles={ROLES_STAFF} />` (empleado o
admin) y `<ProtectedRoute roles={ROLES_ADMIN} />` (sólo admin).

El primer usuario admin lo crea el backend automáticamente al arrancar (ver el README del
backend, sección "Cuenta admin inicial").

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env.local` basado en `.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
```

## 📦 Dependencias

- **React 19** - Librería UI
- **React Router DOM 7** - Routing
- **Vite 8** - Build tool
- **Sass** - Preprocesador CSS
- **ESLint** - Code linting
- **Vitest + Testing Library** - Tests unitarios/de componentes
- **Playwright** - Tests end-to-end

## 🔗 Rutas de la Aplicación

| Ruta                 | Página             | Acceso  | Descripción                                   |
| -------------------- | ------------------ | ------- | --------------------------------------------- |
| `/`                  | Dashboard          | Público | Página principal                              |
| `/buscar`            | BuscarHabitaciones | Público | Búsqueda de habitaciones                      |
| `/categorias`        | Categorías         | Público | Categorías de habitación (staff puede editar) |
| `/login`             | Login              | Público | Iniciar sesión                                |
| `/registro`          | Registro           | Público | Alta de cuenta de huésped                     |
| `/reservar`          | Reservar           | Huésped | Reservar + agregar servicios                  |
| `/mis-reservas`      | MisReservas        | Huésped | Ver/cancelar reservas propias                 |
| `/reservas`          | Reservas           | Staff   | Gestión de todas las reservas                 |
| `/habitaciones`      | Habitaciones       | Staff   | Gestión de habitaciones                       |
| `/huespedes`         | Huéspedes          | Staff   | Gestión de huéspedes                          |
| `/checkin`           | Check-in/out       | Staff   | Procesar entrada y salida                     |
| `/servicios`         | Servicios          | Staff   | Gestión de servicios adicionales              |
| `/cupos`             | Cupos              | Staff   | Cupos disponibles por servicio                |
| `/precios-servicio`  | PrecioServicios    | Staff   | Precios de los servicios                      |
| `/reserva-servicios` | ReservaServicios   | Staff   | Consumos de servicio por reserva              |
| `/provincias`        | Provincias         | Staff   | Gestión de provincias                         |
| `/ciudades`          | Ciudades           | Staff   | Gestión de ciudades                           |
| `/empleados`         | Empleados          | Admin   | Gestión de empleados                          |
| `/usuarios`          | Usuarios           | Admin   | Gestión de usuarios                           |

"Huésped" significa cualquier usuario logueado; "Staff" es empleado o admin.

Las páginas que requieren sesión se cargan con `lazy()`, así no engordan el paquete inicial
que descarga un visitante anónimo. Cada ruta está envuelta en un `ErrorBoundary`: si una
página falla al renderizar, se muestra un mensaje de error en lugar de dejar la app en blanco.

## 🎨 Estilos

El proyecto usa Sass (`.scss`) con un enfoque mobile-first, y estilos por sección en `src/styles/`:

- `_tokens.scss` - Breakpoints (los colores, radios y sombras son custom properties de CSS en `global.scss`)
- `_mixins.scss` - Mixin `desde(md)` para media queries mobile-first
- `global.scss` - Estilos globales y variables de CSS
- `layout.scss` - Navegación y layout principal
- `dashboard.scss` - Dashboard y hero
- `pages.scss` - Páginas generales (formularios, tablas, botones)
- `rooms.scss` - Filtros, grilla y tarjetas de habitaciones
- `booking-bar.scss` - Barra de reserva rápida
- `datepicker.scss` - Selector de fechas

## 📝 Integración con API

Las páginas no llaman a `fetch` directamente. Hay dos capas:

- `src/services/api.js`: cliente HTTP base (`get`, `post`, `put`, `delete`) que agrega el token
  de sesión. Si el backend no responde, lanza un error de red visible en lugar de devolver
  datos falsos.
- `src/services/recursos.js`: un servicio por recurso (`reservaService`, `habitacionService`,
  `huespedService`, `categoriaService`...) con los métodos `listar`, `obtener`, `crear`,
  `actualizar` y `eliminar`, que devuelven instancias de los modelos de `src/models/` en vez
  de JSON crudo.

Ejemplo de uso:

```javascript
import { habitacionService } from './services/recursos';

const habitaciones = await habitacionService.listar();
const habitacion = await habitacionService.obtener(1);
```

Para cargar datos dentro de un componente se usa el hook `useQuery`, que maneja el estado de
carga y error, y expone `refetch` para recargar después de un cambio:

```javascript
import useQuery from './hooks/useQuery';
import { habitacionService } from './services/recursos';

const { data, loading, error, refetch } = useQuery('/habitaciones', () => habitacionService.listar());
```

## ⚙️ Integración continua

Cada push y pull request a `main` corre en GitHub Actions (`.github/workflows/ci.yml`):

1. **Lint, tests y build**: `npm run lint`, `npm test` y `npm run build`.
2. **Auditoría de dependencias**: `npm audit --audit-level=high`, en paralelo.
3. **Tests end-to-end**: Playwright con Chromium, después de que pase el paso 1.

Dependabot abre un PR semanal que agrupa las actualizaciones menores y de parche de npm, y PRs
separados para las versiones major. Las GitHub Actions del workflow se actualizan una vez por mes.

## 📚 Recursos

- [React Docs](https://react.dev)
- [React Router Docs](https://reactrouter.com)
- [Vite Docs](https://vite.dev)
- [Sass Docs](https://sass-lang.com/documentation)
