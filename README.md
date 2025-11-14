# Agent Directory Manager (ADM)

Plataforma integral para gestionar el ciclo de vida completo de agentes de inteligencia artificial, desde desarrollo hasta producción, con soporte multi-tenant.

## 🚀 Características Principales

### Gestión de Proyectos
- **Ciclo de vida completo**: Desarrollo, QA y Producción
- **Colaboración en equipo**: Múltiples roles (Owner, Editor, Viewer)
- **Plantillas reutilizables**: Stack tecnológico predefinido
- **Integración con GitHub**: Control de versiones del código

### Sistema de Prompts Jerárquico
- **Prompts a nivel organización**: Políticas globales
- **Prompts por sector**: Específicos por área
- **Prompts de agente**: Configuración individual
- **Parámetros dinámicos**: Variables en tiempo de ejecución

### Recursos Externos
- **APIs de terceros**: Gestión centralizada
- **Herramientas especializadas**: Catálogo de tools
- **Componentes MCP**: Integración modular
- **Control de permisos**: Acceso granular

### Control de Versiones
- **Versionado automático**: Historial completo de cambios
- **Comparación de versiones**: Diff visual
- **Restauración**: Rollback a versiones anteriores
- **Auditoría completa**: Quién, qué y cuándo

### Etiquetado Inteligente
- **IA asistida**: Sugerencias automáticas
- **Búsqueda mejorada**: Filtros por tags
- **Categorización**: Organización flexible

### Métricas y Monitoreo
- **Dashboard en tiempo real**: KPIs principales
- **Tracking de costos**: Por agente y global
- **Consumo de tokens**: Optimización de recursos
- **Sistema de alertas**: Notificaciones proactivas

### Integraciones
- **Slack**: Notificaciones y comandos
- **Microsoft Teams**: Colaboración empresarial
- **Langfuse**: Observabilidad de IA
- **GitHub**: Control de versiones

### Seguridad
- **Multi-tenant**: Aislamiento completo
- **RBAC**: Permisos granulares
- **OAuth2/OIDC**: SSO empresarial
- **Auditoría**: Logs completos

## 📋 Requisitos Previos

- **Node.js**: v20 o superior
- **Docker**: v24 o superior
- **Docker Compose**: v2 o superior
- **PostgreSQL**: v16 (incluido en Docker)
- **Redis**: v7 (incluido en Docker)

## 🛠️ Instalación

### Opción 1: Docker (Recomendado)

```bash
# Clonar el repositorio
git clone <repository-url>
cd adm

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus configuraciones
nano .env

# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# API Docs: http://localhost:3001/api/docs
```

### Opción 2: Instalación Local

```bash
# Instalar dependencias
npm run install:all

# Iniciar servicios de base de datos (necesitas Docker)
docker-compose up -d postgres redis

# Configurar base de datos
cd backend
npx prisma migrate dev
npx prisma generate
cd ..

# Iniciar en modo desarrollo
npm run dev
```

## 📚 Documentación

### Arquitectura

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para detalles completos sobre:
- Stack tecnológico
- Modelo de datos
- Módulos del sistema
- Patrones arquitectónicos
- Seguridad y escalabilidad

### API

Swagger UI disponible en: `http://localhost:3001/api/docs`

### Prisma Studio

Interfaz visual para la base de datos:

```bash
npm run prisma:studio
```

## 🏗️ Estructura del Proyecto

```
adm/
├── backend/                 # NestJS API
│   ├── prisma/             # Esquema y migraciones
│   ├── src/
│   │   ├── common/         # Módulos compartidos
│   │   ├── modules/        # Módulos de funcionalidades
│   │   ├── config/         # Configuración
│   │   └── main.ts         # Entry point
│   └── package.json
│
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API clients
│   │   ├── store/          # Zustand stores
│   │   ├── utils/          # Utilidades
│   │   └── types/          # TypeScript types
│   └── package.json
│
├── docker-compose.yml      # Configuración Docker
├── .env.example            # Variables de entorno
├── ARCHITECTURE.md         # Documentación arquitectura
└── README.md               # Este archivo
```

## 🔧 Scripts Disponibles

### Root
```bash
npm run install:all      # Instalar todas las dependencias
npm run dev             # Desarrollo (backend + frontend)
npm run build           # Build producción
npm run test            # Ejecutar tests
npm run docker:dev      # Docker modo desarrollo
npm run docker:prod     # Docker modo producción
```

### Backend
```bash
cd backend
npm run start:dev       # Desarrollo con hot-reload
npm run build           # Build producción
npm run test            # Tests unitarios
npm run test:e2e        # Tests e2e
npm run prisma:migrate  # Crear migración
npm run prisma:studio   # Prisma Studio
```

### Frontend
```bash
cd frontend
npm run dev             # Servidor desarrollo
npm run build           # Build producción
npm run lint            # Linter
npm run test            # Tests con Vitest
```

## 🌍 Variables de Entorno

Ver [.env.example](./.env.example) para todas las variables disponibles.

Variables críticas:
- `DATABASE_URL`: Conexión PostgreSQL
- `JWT_SECRET`: Clave para tokens JWT
- `OPENAI_API_KEY`: Para etiquetado inteligente
- `SLACK_BOT_TOKEN`: Integración Slack
- `TEAMS_APP_ID`: Integración Teams

## 🧪 Testing

```bash
# Backend
cd backend
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run test:cov       # Con cobertura

# Frontend
cd frontend
npm run test           # Vitest
npm run test:ui        # UI mode
npm run test:coverage  # Con cobertura
```

## 📈 Roadmap

### Fase 1: Fundación ✅
- [x] Arquitectura y diseño
- [x] Estructura base del proyecto
- [x] Setup de base de datos
- [ ] Autenticación básica

### Fase 2: Core Features (En progreso)
- [ ] Gestión de proyectos
- [ ] Sistema de prompts jerárquicos
- [ ] Plantillas y stacks
- [ ] Recursos externos

### Fase 3: Funcionalidades Avanzadas
- [ ] Control de versiones
- [ ] Sistema de auditoría
- [ ] Etiquetado inteligente
- [ ] Permisos granulares

### Fase 4: Integraciones
- [ ] Slack/Teams
- [ ] Langfuse
- [ ] GitHub API
- [ ] Webhooks

### Fase 5: Monitoreo y Análisis
- [ ] Dashboards
- [ ] Métricas en tiempo real
- [ ] Sistema de alertas
- [ ] Sandbox de pruebas

### Fase 6: Pulido y Lanzamiento
- [ ] Testing completo
- [ ] Documentación
- [ ] Performance optimization
- [ ] Deployment production-ready

## 🤝 Contribuir

Por favor lee [CONTRIBUTING.md](./CONTRIBUTING.md) para detalles sobre nuestro código de conducta y proceso de pull requests.

## 📝 Licencia

Este proyecto está licenciado bajo MIT License - ver [LICENSE](./LICENSE) para más detalles.

## 👥 Equipo

- **Desarrollo**: ADM Team
- **Arquitectura**: Ver ARCHITECTURE.md

## 📞 Soporte

Para soporte y preguntas:
- 📧 Email: support@adm.com
- 📚 Documentación: Ver `/docs`
- 🐛 Issues: GitHub Issues

## 🙏 Agradecimientos

- NestJS por el excelente framework backend
- React y MUI por las herramientas frontend
- Prisma por el ORM moderno
- OpenAI y Anthropic por las capacidades de IA