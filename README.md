# Encuesta de Satisfacción — CAC Santa Bárbara

Plataforma SaaS para gestionar encuestas de satisfacción del usuario.

## 🔗 URLs

| App | URL |
|-----|-----|
| **Encuesta pública** | `https://juanetayo-projects.github.io/satisfaccion/#/encuesta` |
| **Consola admin** | `https://juanetayo-projects.github.io/satisfaccion/#/admin` |

---

## ⚙️ Configuración inicial (una sola vez)

### 1. Supabase — Base de datos

1. Ir a [supabase.com](https://supabase.com) → su proyecto
2. Abrir **SQL Editor** → pegar y ejecutar el contenido de [`supabase/schema.sql`](./supabase/schema.sql)
3. Esto crea las tablas, políticas RLS, triggers y vistas

### 2. Supabase — Primer usuario administrador

En SQL Editor, después de crear el primer usuario desde **Authentication → Users → Invite User**:

```sql
-- Reemplazar con el UUID real del usuario creado
UPDATE public.profiles
SET rol = 'administrador', nombre = 'Juan Carlos Etayo'
WHERE email = 'juan.etayo@cacsantabarbara.co';
```

### 3. GitHub — Secrets para el deploy

En el repositorio → **Settings → Secrets and variables → Actions → New secret**:

| Secret | Valor |
|--------|-------|
| `VITE_SUPABASE_URL` | URL de su proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anon pública de Supabase |

### 4. GitHub Pages

En el repositorio → **Settings → Pages**:
- Source: **GitHub Actions**

El deploy se activa automáticamente al hacer push a `main`.

---

## 🏗️ Estructura del proyecto

```
src/
├── App.jsx                    # Rutas principales
├── hooks/
│   ├── useAuth.jsx            # Autenticación Supabase
│   └── useSurveyData.js       # Datos de encuestas + estadísticas
├── lib/
│   ├── constants.js           # Listas (sedes, servicios, entidades…)
│   ├── supabase.js            # Cliente Supabase
│   └── exportUtils.js         # Excel / CSV / PDF
├── components/
│   ├── ui/                    # StarRating, MetricCard, Modales
│   └── layout/                # Sidebar, AdminLayout
└── pages/
    ├── encuesta/              # Formulario público
    └── admin/                 # Dashboard, Registros, Análisis, Usuarios
```

## 🛠️ Desarrollo local

```bash
# 1. Clonar
git clone https://github.com/juanetayo-projects/satisfaccion.git
cd satisfaccion

# 2. Instalar
npm install

# 3. Variables de entorno
cp .env.example .env
# Editar .env con sus credenciales Supabase

# 4. Ejecutar
npm run dev
```

## 🚀 Deploy

```bash
git add .
git commit -m "descripción del cambio"
git push
# GitHub Actions construye y despliega automáticamente
```
