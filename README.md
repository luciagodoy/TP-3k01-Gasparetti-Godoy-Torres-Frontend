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

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/        # Componentes reutilizables
│   ├── pages/            # Páginas principales
│   │   ├── Dashboard.jsx  # Página principal
│   │   ├── Reservas.jsx   # Gestión de reservas
│   │   ├── Habitaciones.jsx
│   │   ├── Huespedes.jsx
│   │   ├── Servicios.jsx
│   │   ├── CheckIn.jsx
│   │   ├── Empleados.jsx
│   │   └── NotFound.jsx
│   ├── layouts/
│   │   └── MainLayout.jsx # Layout principal con navegación
│   ├── services/
│   │   └── api.js        # Servicio de API
│   ├── styles/           # Estilos CSS
│   ├── hooks/            # Custom React hooks
│   ├── App.jsx
│   └── main.jsx
├── public/               # Archivos estáticos
├── index.html
├── vite.config.js
├── eslint.config.js
├── package.json
└── README.md
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env.local` basado en `.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
```

## 📦 Dependencias

- **React 18+** - Librería UI
- **React Router DOM** - Routing
- **Vite** - Build tool
- **ESLint** - Code linting

## 🔗 Rutas de la Aplicación

| Ruta            | Página       | Descripción                      |
| --------------- | ------------ | -------------------------------- |
| `/`             | Dashboard    | Página principal                 |
| `/reservas`     | Reservas     | Gestión de reservas              |
| `/habitaciones` | Habitaciones | Gestión de habitaciones          |
| `/huespedes`    | Huéspedes    | Gestión de huéspedes             |
| `/servicios`    | Servicios    | Gestión de servicios adicionales |
| `/checkin`      | Check-in/out | Procesar entrada y salida        |
| `/empleados`    | Empleados    | Gestión de empleados             |

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
