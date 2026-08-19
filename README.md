# Sistema de Gestión Hotelera - Frontend

Sistema web de gestión hotelera que permite administrar reservas, check-in/check-out, facturación de estadías y servicios adicionales.

## 🚀 Inicio Rápido

### Requisitos

- Node.js 16+
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone [repository-url]
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con la URL de tu API
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
frontend/
├── src/
│   ├── components/        # Componentes reutilizables (ProtectedRoute, etc.)
│   ├── context/           # AuthContext: sesión, usuario logueado, perfil de huésped
│   ├── pages/              # Páginas
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx / Registro.jsx        # autenticación y alta de huésped
│   │   ├── BuscarHabitaciones.jsx          # búsqueda pública de habitaciones
│   │   ├── Reservar.jsx / MisReservas.jsx  # reserva y autogestión del huésped logueado
│   │   ├── Reservas.jsx / Habitaciones.jsx / Huespedes.jsx / Categorias.jsx / CheckIn.jsx  # panel admin
│   │   └── NotFound.jsx
│   ├── layouts/
│   │   └── MainLayout.jsx # Layout principal con navegación (según sesión y rol)
│   ├── services/
│   │   └── api.js        # Servicio de API (con fallback a datos mock si el backend no responde)
│   ├── styles/           # Estilos CSS
│   ├── test/              # Setup de tests unitarios
│   ├── App.jsx
│   └── main.jsx
├── e2e/                   # Tests end-to-end (Playwright)
├── public/               # Archivos estáticos
├── index.html
├── vite.config.js
├── playwright.config.js
├── eslint.config.js
├── package.json
└── README.md
```

## 🔐 Autenticación y roles

Hay dos niveles de acceso, resueltos por el backend:

- **Huésped** (cualquier usuario logueado): puede buscar y reservar habitaciones, agregar
  servicios a su reserva y ver/cancelar sus propias reservas en "Mis Reservas".
- **Admin**: accede además al panel de gestión (Reservas, Habitaciones, Huéspedes, Categorías,
  Check-in/out), protegido con `<ProtectedRoute roles={['admin']} />` en `App.jsx`.

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
- **Vite** - Build tool
- **ESLint** - Code linting
- **Vitest + Testing Library** - Tests unitarios/de componentes
- **Playwright** - Tests end-to-end

## 🔗 Rutas de la Aplicación

| Ruta            | Página             | Acceso  | Descripción                    |
| ---------------- | ------------------ | ------- | ------------------------------- |
| `/`              | Dashboard          | Público | Página principal                |
| `/buscar`        | BuscarHabitaciones | Público | Búsqueda de habitaciones        |
| `/login`         | Login              | Público | Iniciar sesión                  |
| `/registro`      | Registro           | Público | Alta de cuenta de huésped       |
| `/reservar`      | Reservar           | Huésped | Reservar + agregar servicios    |
| `/mis-reservas`  | MisReservas        | Huésped | Ver/cancelar reservas propias   |
| `/reservas`      | Reservas           | Admin   | Gestión de todas las reservas   |
| `/habitaciones`  | Habitaciones       | Admin   | Gestión de habitaciones         |
| `/huespedes`     | Huéspedes          | Admin   | Gestión de huéspedes            |
| `/categorias`    | Categorías         | Admin   | Categorías de habitación        |
| `/checkin`       | Check-in/out       | Admin   | Procesar entrada y salida       |

## 🎨 Estilos

El proyecto utiliza CSS modular con estilos por sección:

- `layout.css` - Navegación y layout principal
- `dashboard.css` - Dashboard
- `pages.css` - Páginas generales (formularios, tablas, botones)
- `global.css` - Estilos globales

## 📝 Integración con API

El servicio API (`src/services/api.js`) proporciona métodos para:

- GET `/endpoint`
- POST `/endpoint`
- PUT `/endpoint`
- DELETE `/endpoint`

Ejemplo de uso:

```javascript
import api from './services/api';

// GET
const data = await api.get('/reservas');

// POST
const newReserva = await api.post('/reservas', { ...data });

// PUT
const updated = await api.put('/reservas/1', { ...data });

// DELETE
await api.delete('/reservas/1');
```

## 📚 Recursos

- [React Docs](https://react.dev)
- [React Router Docs](https://reactrouter.com)
- [Vite Docs](https://vite.dev)
