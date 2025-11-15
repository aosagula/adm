# 🚀 Guía de Inicio Rápido - Agent Directory Manager

Esta guía te llevará desde cero hasta tener la aplicación funcionando en menos de 5 minutos.

## 📋 Prerrequisitos

- **Docker** y **Docker Compose** instalados
- **Git** instalado
- **Node.js 20+** (solo para desarrollo local sin Docker)

## ⚡ Inicio Rápido con Docker

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd adm
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

⚠️ **IMPORTANTE**: Cambia el `JWT_SECRET` en producción:

```env
JWT_SECRET=tu-super-secreto-jwt-cambiar-en-produccion
```

### 3. Iniciar todos los servicios

```bash
docker-compose up -d
```

Esto iniciará:
- ✅ PostgreSQL en puerto 5432
- ✅ Redis en puerto 6379
- ✅ Backend API en puerto 3001
- ✅ Frontend en puerto 3000

### 4. Inicializar la base de datos

```bash
# Entrar al contenedor del backend
docker-compose exec backend sh

# Ejecutar migraciones
npx prisma migrate dev --name init

# Ejecutar seed (crear datos iniciales)
npx prisma db seed

# Salir del contenedor
exit
```

### 5. Acceder a la aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **API Docs (Swagger)**: http://localhost:3001/api/docs
- **Prisma Studio**: http://localhost:5555

```bash
# Para abrir Prisma Studio (opcional)
docker-compose exec backend npx prisma studio
```

## 👤 Credenciales de Prueba

El seed crea dos usuarios de prueba:

### Administrador
```
Email: admin@adm.com
Password: admin123
Permisos: TODOS
```

### Usuario Normal
```
Email: user@adm.com
Password: user123
Permisos: Básicos (leer/crear/actualizar proyectos)
```

## 🧪 Probar la API

### Usando la interfaz Swagger

1. Ir a http://localhost:3001/api/docs
2. Click en "Authorize" (candado verde arriba a la derecha)
3. Hacer login para obtener el token:
   - POST `/api/auth/login`
   - Body: `{ "email": "admin@adm.com", "password": "admin123" }`
4. Copiar el `accessToken` de la respuesta
5. En el diálogo "Authorize", pegar el token
6. Ahora puedes probar todos los endpoints

### Usando cURL

#### 1. Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@adm.com",
    "password": "admin123"
  }'
```

Respuesta:
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@adm.com",
    "firstName": "Admin",
    "lastName": "User",
    ...
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. Crear un proyecto (usando el token)

```bash
TOKEN="tu-access-token-aqui"

curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Mi Primer Proyecto",
    "slug": "mi-primer-proyecto",
    "description": "Proyecto de prueba",
    "status": "DEVELOPMENT"
  }'
```

#### 3. Listar proyectos

```bash
curl -X GET http://localhost:3001/api/projects \
  -H "Authorization: Bearer $TOKEN"
```

#### 4. Ver perfil actual

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Refrescar token
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Perfil actual

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Ver usuario
- `PATCH /api/users/:id` - Actualizar usuario
- `POST /api/users/:id/roles` - Asignar rol
- `DELETE /api/users/:id/roles/:roleId` - Remover rol

### Proyectos
- `GET /api/projects` - Listar proyectos
- `POST /api/projects` - Crear proyecto
- `GET /api/projects/:id` - Ver proyecto
- `PATCH /api/projects/:id` - Actualizar proyecto
- `PATCH /api/projects/:id/status` - Cambiar estado
- `DELETE /api/projects/:id` - Archivar proyecto
- `POST /api/projects/:id/members` - Agregar miembro
- `DELETE /api/projects/:id/members/:memberId` - Remover miembro

### Organizaciones
- `GET /api/organizations` - Listar organizaciones
- `GET /api/organizations/:id` - Ver organización

### Auditoría
- `GET /api/audit` - Ver logs de auditoría
- `GET /api/audit/:id` - Ver detalle de log
- `GET /api/audit/export` - Exportar logs

### Versionado
- `GET /api/versioning/project/:projectId` - Historial de versiones
- `GET /api/versioning/:versionId` - Ver versión
- `GET /api/versioning/compare/:v1/:v2` - Comparar versiones
- `POST /api/versioning/restore/:versionId` - Restaurar versión

## 🔍 Ver Logs

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs solo del backend
docker-compose logs -f backend

# Ver logs solo del frontend
docker-compose logs -f frontend

# Ver logs de la base de datos
docker-compose logs -f postgres
```

## 🛑 Detener la aplicación

```bash
# Detener servicios (mantiene datos)
docker-compose down

# Detener y eliminar volúmenes (borra datos)
docker-compose down -v

# Reiniciar servicios
docker-compose restart
```

## 🔄 Actualizar dependencias

```bash
# Backend
docker-compose exec backend npm install

# Frontend
docker-compose exec frontend npm install
```

## 🐛 Solución de Problemas

### El backend no inicia

1. Verificar que PostgreSQL está corriendo:
```bash
docker-compose ps postgres
```

2. Ver logs del backend:
```bash
docker-compose logs backend
```

3. Recrear el contenedor:
```bash
docker-compose up -d --force-recreate backend
```

### Error "relation does not exist"

Significa que las migraciones no se ejecutaron. Ejecutar:

```bash
docker-compose exec backend npx prisma migrate dev --name init
docker-compose exec backend npx prisma db seed
```

### Puerto ya en uso

Si algún puerto está ocupado, modificar en `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "3002:3001"  # Cambiar 3001 a 3002 externamente
```

### Limpiar y empezar de cero

```bash
# Detener y eliminar todo
docker-compose down -v

# Eliminar imágenes
docker-compose rm -f

# Rebuild y restart
docker-compose up -d --build
```

## 💡 Consejos

### Hot Reload

El código se recarga automáticamente cuando haces cambios:
- **Backend**: Nest.js en modo watch
- **Frontend**: Vite HMR

### Prisma Studio

Para explorar la base de datos visualmente:

```bash
docker-compose exec backend npx prisma studio
```

Abre http://localhost:5555

### Ejecutar comandos dentro del contenedor

```bash
# Backend
docker-compose exec backend sh
> npx prisma migrate dev
> npm run test
> exit

# Frontend
docker-compose exec frontend sh
> npm run build
> npm run lint
> exit
```

## 📝 Siguientes Pasos

1. ✅ Login con credenciales de prueba
2. ✅ Crear tu primer proyecto
3. ✅ Explorar la API en Swagger
4. ✅ Ver logs de auditoría
5. ✅ Experimentar con el versionado

## 📚 Documentación Adicional

- [README.md](./README.md) - Documentación completa
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura del sistema
- [API Docs](http://localhost:3001/api/docs) - Documentación interactiva de la API

## 🆘 Ayuda

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs`
2. Verifica que todos los servicios están corriendo: `docker-compose ps`
3. Revisa las [issues en GitHub](https://github.com/aosagula/adm/issues)
4. Consulta la documentación completa en [README.md](./README.md)

---

¡Listo! 🎉 Ahora tienes Agent Directory Manager funcionando localmente.
