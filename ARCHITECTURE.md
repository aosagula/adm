# Agent Directory Manager - Arquitectura del Sistema

## Visión General

Agent Directory Manager (ADM) es una plataforma integral para gestionar el ciclo de vida completo de agentes de inteligencia artificial, desde desarrollo hasta producción, con soporte multi-tenant.

## Stack Tecnológico

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: NestJS (arquitectura modular y escalable)
- **Lenguaje**: TypeScript
- **ORM**: Prisma (type-safe, migrations, multi-database)
- **Autenticación**: Passport.js + JWT + OAuth2/OIDC
- **Validación**: class-validator + class-transformer
- **API Documentation**: Swagger/OpenAPI

### Base de Datos
- **Principal**: PostgreSQL 16 (soporte JSONB, multi-tenant, transaccional)
- **Cache**: Redis (sesiones, rate limiting, colas)
- **Búsqueda**: PostgreSQL Full-Text Search + pg_trgm

### Frontend
- **Framework**: React 18 + TypeScript
- **Estado**: Zustand (ligero y moderno)
- **UI Components**: Material-UI (MUI) v5
- **Gráficas**: Recharts + D3.js
- **Forms**: React Hook Form + Zod
- **Routing**: React Router v6
- **HTTP Client**: Axios + React Query

### DevOps & Infraestructura
- **Containerización**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Monitoreo**: Prometheus + Grafana
- **Logs**: Winston + ELK Stack
- **CI/CD**: GitHub Actions

### Integraciones
- **IA/LLM**: OpenAI API, Anthropic Claude API
- **Messaging**: Slack SDK, Microsoft Teams SDK
- **Observabilidad**: Langfuse SDK
- **Version Control**: GitHub API

## Arquitectura del Sistema

### Patrón Arquitectónico
**Arquitectura en Capas (Layered Architecture) + Microservicios Modulares**

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React SPA)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │Dashboard │ │ Projects │ │ Agents   │ │  Admin   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                         REST API / GraphQL
                              │
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway (NestJS)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Auth Middleware │ Tenant Isolation │ Rate Limiting   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────────────┐    ┌────────────────┐    ┌───────────────┐
│  Auth Module  │    │  Core Modules  │    │ Integration   │
│               │    │                │    │   Module      │
│ - JWT         │    │ - Projects     │    │               │
│ - OAuth2      │    │ - Agents       │    │ - Slack       │
│ - RBAC        │    │ - Templates    │    │ - Teams       │
│ - Permissions │    │ - Prompts      │    │ - GitHub      │
│               │    │ - Tools/APIs   │    │ - Langfuse    │
└───────────────┘    │ - Versioning   │    └───────────────┘
                     │ - Audit        │
                     │ - Tags         │
                     │ - Metrics      │
                     │ - Alerts       │
                     └────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────────────┐    ┌────────────────┐    ┌───────────────┐
│  PostgreSQL   │    │     Redis      │    │  File Storage │
│               │    │                │    │               │
│ - Multi-tenant│    │ - Sessions     │    │ - Configs     │
│ - Versioning  │    │ - Cache        │    │ - Templates   │
│ - Audit Logs  │    │ - Job Queue    │    │ - Exports     │
└───────────────┘    └────────────────┘    └───────────────┘
```

## Modelo de Datos

### Entidades Principales

#### 1. Multi-Tenancy
- **Organization**: Organización/Empresa (tenant)
- **OrganizationSettings**: Configuración por tenant

#### 2. Usuarios y Autenticación
- **User**: Usuarios del sistema
- **Role**: Roles (Admin, Owner, Collaborator, Reader)
- **Permission**: Permisos granulares
- **RolePermission**: Relación roles-permisos
- **UserRole**: Roles asignados a usuarios por organización

#### 3. Proyectos y Agentes
- **Project**: Proyecto de agente (desarrollo, QA, producción)
- **ProjectMember**: Miembros del proyecto con roles
- **Agent**: Instancia de agente dentro de un proyecto
- **AgentStatus**: Estados del agente (Enum)

#### 4. Configuración Jerárquica
- **OrganizationPrompt**: Prompts a nivel organización
- **SectorPrompt**: Prompts a nivel sector/área
- **AgentPrompt**: Prompts específicos del agente
- **PromptParameter**: Parámetros dinámicos {{param}}

#### 5. Stack Tecnológico
- **Template**: Plantillas de agentes
- **Technology**: Tecnologías (lenguajes, frameworks)
- **TechnologyVersion**: Versiones de tecnologías
- **Platform**: Plataformas de infraestructura
- **Stack**: Stack tecnológico de un proyecto

#### 6. Recursos Externos
- **ExternalAPI**: APIs de terceros
- **Tool**: Herramientas especializadas
- **MCPComponent**: Componentes MCP
- **ResourcePermission**: Permisos de acceso a recursos

#### 7. Control de Versiones
- **ConfigurationVersion**: Versiones de configuraciones
- **VersionDiff**: Diferencias entre versiones

#### 8. Auditoría
- **AuditLog**: Registro de auditoría
- **AuditEvent**: Tipos de eventos auditables

#### 9. Etiquetado
- **Tag**: Etiquetas del sistema
- **ProjectTag**: Relación proyecto-etiquetas
- **TagSuggestion**: Sugerencias de IA

#### 10. Métricas y Monitoreo
- **AgentMetric**: Métricas de uso de agentes
- **CostTracking**: Seguimiento de costos
- **Alert**: Alertas configuradas
- **AlertRule**: Reglas de alerta
- **AlertHistory**: Historial de alertas disparadas

#### 11. Integraciones
- **SlackIntegration**: Configuración Slack
- **TeamsIntegration**: Configuración Teams
- **WebhookConfig**: Configuración de webhooks
- **Notification**: Notificaciones enviadas

#### 12. Sandbox/Testing
- **TestSession**: Sesiones de prueba
- **TestLog**: Logs de pruebas interactivas

## Módulos del Sistema

### 1. Auth Module
- Autenticación JWT
- OAuth2/OIDC integration
- Multi-tenant user management
- RBAC (Role-Based Access Control)
- Permisos granulares

### 2. Projects Module
- CRUD de proyectos
- Gestión de estados (desarrollo, QA, producción)
- Asignación de responsables y miembros
- Vinculación con repositorios

### 3. Agents Module
- Configuración de agentes
- Prompts jerárquicos
- Versionado de configuraciones
- Parámetros dinámicos

### 4. Templates Module
- CRUD de plantillas
- Stack tecnológico predefinido
- Docker compose base
- Visibilidad pública/privada

### 5. Resources Module
- Gestión de APIs externas
- Registro de herramientas
- Componentes MCP
- Sistema de permisos

### 6. Versioning Module
- Control de versiones de configuraciones
- Comparación de versiones (diff)
- Restauración de versiones
- Historial completo

### 7. Audit Module
- Registro de todas las acciones
- Eventos de autenticación
- Cambios en entidades
- Exportación de logs
- Filtros y búsqueda

### 8. Tags Module
- CRUD de etiquetas
- Etiquetado automático con IA
- Sugerencias inteligentes
- Búsqueda por etiquetas

### 9. Metrics Module
- Recolección de métricas
- Integración con Langfuse
- Tracking de uso y costos
- Cálculos de tokens consumidos

### 10. Alerts Module
- Motor de reglas de alerta
- Evaluación periódica
- Notificaciones multi-canal
- Historial de alertas

### 11. Integrations Module
- Slack SDK integration
- Teams SDK integration
- Webhooks
- GitHub API

### 12. Dashboards Module
- Métricas en tiempo real
- Gráficas y visualizaciones
- KPIs principales
- Filtros por período

### 13. Sandbox Module
- Entorno de pruebas aislado
- Chat interactivo
- Logs de depuración
- Emulación de producción

## Seguridad

### Multi-Tenant Isolation
- Row-Level Security (RLS) en PostgreSQL
- Tenant ID en todas las consultas
- Middleware de validación de tenant
- Aislamiento de datos completo

### Autenticación
- JWT con refresh tokens
- OAuth2/OIDC para SSO
- MFA opcional
- Session management con Redis

### Autorización
- RBAC con permisos granulares
- Políticas por recurso
- Validación en cada endpoint
- Herencia de permisos

### Datos Sensibles
- Encriptación de credenciales (AES-256)
- Secrets management
- No logging de información sensible
- Sanitización de inputs

## Escalabilidad

### Horizontal Scaling
- Stateless API servers
- Load balancing con Nginx
- Redis para sesiones compartidas
- Conexión pool a PostgreSQL

### Performance
- Caching estratégico (Redis)
- Índices optimizados en DB
- Paginación en todas las listas
- Lazy loading en frontend
- Query optimization

### Async Processing
- Job queue con Bull (Redis)
- Background tasks para:
  - Generación de etiquetas IA
  - Cálculo de métricas
  - Evaluación de alertas
  - Envío de notificaciones

## Monitoreo y Observabilidad

### Logging
- Structured logging (Winston)
- Niveles: error, warn, info, debug
- Correlación de requests (correlation ID)
- Rotación de logs

### Métricas
- Prometheus metrics
- Grafana dashboards
- Custom business metrics
- Performance monitoring

### Alerting
- System health alerts
- Business rule alerts
- Error rate monitoring
- Resource usage tracking

## Despliegue

### Desarrollo
```bash
docker-compose up
```

### Producción
- Docker images optimizadas
- Multi-stage builds
- Health checks
- Graceful shutdown
- Auto-restart policies

### Entornos
- **Development**: Docker Compose local
- **Staging**: Kubernetes cluster
- **Production**: Kubernetes + Auto-scaling

## Convenciones de Código

### Backend (NestJS)
- Nombres en PascalCase para clases
- camelCase para métodos y variables
- Interfaces con prefijo `I`
- DTOs con sufijo `Dto`
- Entities sin sufijos
- Services con sufijo `Service`

### Frontend (React)
- Componentes en PascalCase
- Hooks con prefijo `use`
- Tipos con sufijo `Type`
- Props con sufijo `Props`
- Archivos de componentes: `.tsx`
- Archivos de utilidades: `.ts`

### Database
- Tablas en snake_case
- Singular para nombres de tabla
- Foreign keys: `{tabla_referenciada}_id`
- Índices: `idx_{tabla}_{columna(s)}`
- Constraints: `{tipo}_{tabla}_{columna}`

## Testing

### Unitarios
- Jest para backend
- React Testing Library para frontend
- Cobertura mínima: 80%

### Integración
- Supertest para API endpoints
- Testcontainers para PostgreSQL/Redis
- E2E con Playwright

## Roadmap de Implementación

### Fase 1: Fundación (Semanas 1-2)
- ✅ Arquitectura y diseño
- Estructura base del proyecto
- Setup de base de datos
- Autenticación básica

### Fase 2: Core Features (Semanas 3-5)
- Gestión de proyectos
- Sistema de prompts jerárquicos
- Plantillas y stacks
- Recursos externos

### Fase 3: Funcionalidades Avanzadas (Semanas 6-8)
- Control de versiones
- Sistema de auditoría
- Etiquetado inteligente
- Permisos granulares

### Fase 4: Integraciones (Semanas 9-10)
- Slack/Teams
- Langfuse
- GitHub API
- Webhooks

### Fase 5: Monitoreo y Análisis (Semanas 11-12)
- Dashboards
- Métricas en tiempo real
- Sistema de alertas
- Sandbox de pruebas

### Fase 6: Pulido y Lanzamiento (Semanas 13-14)
- Testing completo
- Documentación
- Performance optimization
- Deployment production-ready
