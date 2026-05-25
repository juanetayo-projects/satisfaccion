import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verificar que el solicitante está autenticado y es administrador
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Cliente con la clave anónima para verificar el token del solicitante
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey     = Deno.env.get('SUPABASE_ANON_KEY')!

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user: caller }, error: authErr } = await callerClient.auth.getUser()
    if (authErr || !caller) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verificar que el solicitante es administrador
    const { data: callerProfile } = await callerClient
      .from('profiles')
      .select('rol')
      .eq('id', caller.id)
      .single()

    if (callerProfile?.rol !== 'administrador') {
      return new Response(JSON.stringify({ error: 'Solo los administradores pueden crear usuarios' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Leer datos del nuevo usuario
    const { email, nombre, rol } = await req.json()

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Correo electrónico inválido' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const rolValido = ['administrador', 'encuestador'].includes(rol) ? rol : 'encuestador'

    // 3. Usar la clave de servicio para invitar al usuario (seguro en el servidor)
    const adminClient = createClient(supabaseUrl, serviceKey)

    const { data: invited, error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { nombre, rol: rolValido },
      redirectTo: `https://juanetayo-projects.github.io/satisfaccion/#/login`,
    })

    if (inviteErr) {
      // Si el usuario ya existe, intentar obtener su ID
      if (inviteErr.message.includes('already been registered') || inviteErr.code === 'email_exists') {
        return new Response(JSON.stringify({
          error: 'Este correo ya está registrado en el sistema de autenticación.',
        }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      throw inviteErr
    }

    // 4. Crear el perfil (el trigger debería crearlo, pero lo aseguramos aquí)
    if (invited?.user?.id) {
      const { error: profileErr } = await adminClient
        .from('profiles')
        .upsert({
          id:     invited.user.id,
          email:  email.toLowerCase(),
          nombre: nombre || '',
          rol:    rolValido,
          activo: true,
        }, { onConflict: 'id' })

      if (profileErr) {
        console.error('Error creando perfil:', profileErr.message)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Invitación enviada a ${email}. El usuario recibirá un correo para establecer su contraseña.`,
      userId: invited?.user?.id,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Error en invite-user:', err)
    return new Response(JSON.stringify({ error: err.message || 'Error interno del servidor' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
