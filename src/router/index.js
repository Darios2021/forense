// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

import Login              from '@/views/Login.vue'
import Dashboard          from '@/views/Dashboard.vue'
import SolicitudesTable   from '@/views/SolicitudesTable.vue'
import NuevaSolicitud     from '@/views/NuevaSolicitud.vue'
import SolicitudDetalle   from '@/views/SolicitudDetalle.vue'
import SolicitudView      from '@/views/SolicitudView.vue'
import Reportes           from '@/views/Reportes.vue'          // <-- NUEVO

// Vistas de parametrización (sólo admin/superuser)
import ParametrizacionHome   from '@/parametrizacion/ParametrizacionHome.vue'
import TiposView             from '@/parametrizacion/TiposView.vue'
import TecnicosView          from '@/parametrizacion/TecnicosView.vue'
import DependenciasView      from '@/parametrizacion/DependenciasView.vue'
import UsuariosView          from '@/parametrizacion/UsuariosView.vue'
import MediosView            from '@/parametrizacion/ParamMedios.vue'
import IntervinientesView    from '@/parametrizacion/IntervinientesView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/solicitudes',
    name: 'SolicitudesTable',
    component: SolicitudesTable,
    meta: { requiresAuth: true }
  },
  {
    path: '/nueva',
    name: 'NuevaSolicitud',
    component: NuevaSolicitud,
    meta: { requiresAuth: true }
  },
  {
    path: '/solicitud/:id',
    name: 'SolicitudDetalle',
    component: SolicitudDetalle,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/solicitudes/ver/:id',
    name: 'SolicitudView',
    component: SolicitudView,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/reportes',                               // <-- NUEVO
    name: 'Reportes',                                // <-- NUEVO
    component: Reportes,                             // <-- NUEVO
    meta: { requiresAuth: true }                    // <-- NUEVO
  },

  // Parametrización (sólo admin/superuser)
  {
    path: '/parametrizacion',
    name: 'ParametrizacionHome',
    component: ParametrizacionHome,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/parametrizacion/tipos',
    name: 'TiposView',
    component: TiposView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/parametrizacion/tecnicos',
    name: 'TecnicosView',
    component: TecnicosView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/parametrizacion/dependencias',
    name: 'DependenciasView',
    component: DependenciasView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/parametrizacion/usuarios',
    name: 'UsuariosView',
    component: UsuariosView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/parametrizacion/medios',
    name: 'MediosView',
    component: MediosView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/parametrizacion/intervinientes',
    name: 'IntervinientesView',
    component: IntervinientesView,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard global
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken')
  const role  = (localStorage.getItem('rol') || '').toLowerCase()

  if (to.meta.requiresAuth && !token) {
    console.warn('⛔️ Acceso denegado. Redirigiendo a login.')
    return next('/login')
  }
  if (to.meta.requiresAdmin && !(role === 'admin' || role === 'superuser')) {
    console.warn('⛔️ Requiere permisos de admin. Redirigiendo a dashboard.')
    return next('/dashboard')
  }

  next()
})

export default router
