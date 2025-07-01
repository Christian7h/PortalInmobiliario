# Portal Inmobiliario - Documentación Técnica

## 🏠 Descripción del Proyecto

Portal web inmobiliario moderno desarrollado con React y TypeScript, que ofrece una experiencia completa para la gestión y visualización de propiedades inmobiliarias. La plataforma incluye funcionalidades avanzadas como tours virtuales, análisis de vecindario, calculadora de hipotecas y sistema de gestión de leads.

## 🚀 Stack Tecnológico

### Frontend
- **React 18.3.1** - Framework de JavaScript para UI
- **TypeScript 5.5.3** - Superset tipado de JavaScript
- **Vite 5.4.2** - Build tool y development server de alta velocidad
- **Tailwind CSS 3.4.1** - Framework de CSS utility-first
- **React Router DOM 6.22.3** - Enrutamiento para aplicaciones React

### State Management & Data Fetching
- **TanStack React Query 5.76.1** - Gestión de estado del servidor y caché
- **Zustand 4.5.2** - Gestión de estado global ligero
- **React Hook Form 7.51.0** - Gestión de formularios con validación

### UI Components & Libraries
- **Lucide React 0.344.0** - Biblioteca de iconos SVG
- **Framer Motion 12.12.1** - Biblioteca de animaciones
- **React Quill 2.0.0** - Editor de texto enriquecido
- **Swiper 11.0.7** - Carrusel de imágenes táctil

### Maps & Visualización
- **Leaflet 1.9.4** - Biblioteca de mapas interactivos
- **React Leaflet 4.2.1** - Componentes React para Leaflet
- **Chart.js 4.4.9** - Biblioteca de gráficos
- **React ChartJS 2 5.3.0** - Wrapper React para Chart.js

### Tours Virtuales & Multimedia
- **Photo Sphere Viewer 5.13.2** - Visor de tours virtuales 360°

### Backend & Base de Datos
- **Supabase 2.39.7** - Backend as a Service (BaaS)
  - PostgreSQL como base de datos
  - Autenticación integrada
  - Storage para archivos
  - Edge Functions para lógica del servidor
  - Real-time subscriptions

### Utilidades
- **Date-fns 4.1.0** - Manipulación de fechas
- **XLSX 0.18.5** - Procesamiento de archivos Excel
- **Node Fetch 2.7.0** - Cliente HTTP para Node.js

### Desarrollo & Calidad de Código
- **ESLint 9.9.1** - Linter para JavaScript/TypeScript
- **TypeScript ESLint 8.3.0** - Reglas ESLint específicas para TypeScript
- **PostCSS 8.4.35** - Procesador de CSS
- **Autoprefixer 10.4.18** - Prefijos automáticos de CSS

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── admin/           # Componentes del panel de administración
│   ├── contact/         # Formularios de contacto
│   ├── layout/          # Layout principal (Header, Footer, Layout)
│   ├── property/        # Componentes relacionados con propiedades
│   └── ui/              # Componentes de interfaz básicos
├── context/             # Contextos de React (Auth, Toast)
├── lib/                 # Utilidades y configuraciones
│   ├── api.ts           # Funciones de API
│   ├── supabase.ts      # Configuración de Supabase
│   ├── emailService.ts  # Servicio de email
│   └── whatsappService.ts # Integración WhatsApp
├── pages/               # Páginas de la aplicación
│   ├── admin/           # Páginas del panel administrativo
│   └── [public pages]   # Páginas públicas
├── types/               # Definiciones de tipos TypeScript
└── main.tsx             # Punto de entrada de la aplicación

supabase/
├── functions/           # Edge Functions
├── migrations/          # Migraciones de base de datos
└── [config files]      # Archivos de configuración
```

## 🛠 Funcionalidades Principales

### Para Usuarios Finales
- **Búsqueda Avanzada**: Filtros por tipo, precio, ubicación, características
- **Vista de Propiedades**: Galería de imágenes, información detallada
- **Tours Virtuales**: Integración con Matterport, Kuula, YouTube
- **Mapas Interactivos**: Ubicación exacta de propiedades
- **Análisis de Vecindario**: Demografía, servicios cercanos, estadísticas
- **Calculadora de Hipotecas**: Simulación de créditos en CLP y UF
- **Comparación de Propiedades**: Análisis comparativo
- **Sistema de Contacto**: Formularios, WhatsApp, email
- **Compartir en RRSS**: Facebook, WhatsApp

### Para Administradores
- **Dashboard Completo**: Métricas y estadísticas
- **Gestión de Propiedades**: CRUD completo con imágenes
- **Gestión de Leads**: Seguimiento de clientes potenciales
- **Perfil de Empresa**: Configuración de datos corporativos
- **Equipo de Trabajo**: Gestión de miembros del equipo
- **Notificaciones**: Sistema de alertas automáticas

## 🔧 Características Técnicas

### Arquitectura
- **Arquitectura de Componentes**: Basada en React functional components
- **Tipos Seguros**: TypeScript en todo el código base
- **Estado Reactivo**: React Query para estado del servidor
- **Responsive Design**: Mobile-first con Tailwind CSS
- **SEO Optimizado**: Meta tags dinámicos y URLs amigables

### Base de Datos (PostgreSQL/Supabase)
```sql
-- Tablas principales
├── properties              # Propiedades inmobiliarias
├── property_images         # Imágenes de propiedades
├── company_profile         # Perfil de la empresa
├── team_members           # Miembros del equipo
├── leads                  # Clientes potenciales
└── lead_activities        # Actividades de seguimiento
```

### Funciones Serverless (Edge Functions)
- **Notificaciones automáticas** de nuevos leads
- **Respuestas automáticas** por email
- **Integración con SendGrid** para emails transaccionales

### Análisis de Propiedades
- **Campos de análisis avanzado**:
  - Tour virtual URL
  - Año de construcción
  - Espacios de estacionamiento
  - Gastos comunes
  - Certificación energética
- **Análisis de vecindario**:
  - Servicios cercanos (colegios, comercios, transporte)
  - Demografía del área
  - Índices de seguridad y calidad de vida
  - Estadísticas del mercado inmobiliario

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- Cuenta de SendGrid (opcional)

### Variables de Entorno
```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# SendGrid (opcional)
SENDGRID_API_KEY=your_sendgrid_api_key
```

### Comandos de Desarrollo
```bash
# Instalación de dependencias
npm install

# Desarrollo local
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

### Configuración de Base de Datos
```bash
# Ejecutar migraciones
supabase db push

# Configurar políticas de seguridad
supabase db reset
```

## 📊 Métricas de Desarrollo

### Performance
- **Lighthouse Score**: 90+ en todas las categorías
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: Optimizado con code splitting

### Calidad de Código
- **TypeScript Coverage**: 100%
- **ESLint Rules**: Configuración estricta
- **Component Reusability**: Alta modularidad
- **Error Handling**: Manejo robusto de errores

## 🔐 Seguridad

- **Autenticación**: JWT tokens via Supabase Auth
- **Autorización**: Row Level Security (RLS) en PostgreSQL
- **Validación**: Client-side y server-side validation
- **CORS**: Configuración restrictiva
- **Environment Variables**: Separación de credenciales

## 🌐 Deployment

### Opciones de Despliegue
- **Vercel** (Recomendado)
- **Netlify**
- **AWS Amplify**
- **Supabase Hosting**

### CI/CD
- Integración con GitHub Actions
- Tests automatizados
- Deploy automático en push a main

## 📱 Compatibilidad

- **Navegadores**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Dispositivos**: Desktop, Tablet, Mobile
- **PWA Ready**: Service Worker implementado

## 🤝 Contribución

### Estándares de Código
- Conventional Commits
- Prettier para formateo
- Husky para pre-commit hooks
- Semantic versioning

### Flujo de Trabajo
1. Fork del repositorio
2. Crear feature branch
3. Commit con conventional format
4. Pull request con revisión
5. Merge a main branch

## 📞 Soporte Técnico

- **Documentación**: README.md y JSDoc en funciones críticas
- **Troubleshooting**: Guías específicas en `/supabase/README_*.md`
- **Logs**: Sistema de logging integrado
- **Monitoring**: Métricas de Supabase Dashboard

---

**Última actualización**: Julio 2025  
**Versión**: 0.1.0  
**Licencia**: Privada

---

*Este proyecto representa una solución completa para el sector inmobiliario, implementando las mejores prácticas de desarrollo web moderno y proporcionando una experiencia de usuario excepcional tanto para clientes finales como para administradores.*
