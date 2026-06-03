import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // 1. Verificar autenticación del solicitante
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'No autorizado' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey     = Deno.env.get('SUPABASE_ANON_KEY')!

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user: caller } } = await callerClient.auth.getUser()
    if (!caller) return json({ error: 'Sesión inválida' }, 401)

    const { data: callerProfile } = await callerClient
      .from('profiles').select('rol').eq('id', caller.id).single()
    if (callerProfile?.rol !== 'administrador') {
      return json({ error: 'Solo los administradores pueden crear usuarios' }, 403)
    }

    // 2. Leer datos
    const { email, nombre, rol } = await req.json()
    if (!email?.includes('@')) return json({ error: 'Correo electrónico inválido' }, 400)
    const rolFinal = ['administrador', 'encuestador'].includes(rol) ? rol : 'encuestador'

    const adminClient = createClient(supabaseUrl, serviceKey)

    // 3. Verificar si el usuario ya existe en auth
    const { data: existingList } = await adminClient.auth.admin.listUsers()
    const existingAuth = existingList?.users?.find(
      u => u.email?.toLowerCase() === email.toLowerCase()
    )

    let userId: string

    if (existingAuth) {
      // Usuario ya existe en auth → solo crear/actualizar perfil y enviar reset de contraseña
      userId = existingAuth.id

      // Enviar email de reset para que pueda ingresar
      await adminClient.auth.admin.generateLink({
        type: 'recovery',
        email: email.toLowerCase(),
        options: {
          redirectTo: 'https://juanetayo-projects.github.io/satisfaccion/#/login',
        },
      })
    } else {
      // Usuario nuevo → invitar por correo
      const { data: invited, error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(
        email.toLowerCase(),
        {
          data: { nombre, rol: rolFinal },
          redirectTo: 'https://juanetayo-projects.github.io/satisfaccion/#/login',
        }
      )
      if (inviteErr) return json({ error: inviteErr.message }, 400)
      userId = invited.user!.id
    }

    // 4. Crear o actualizar perfil
    const { error: profileErr } = await adminClient
      .from('profiles')
      .upsert({
        id:     userId,
        email:  email.toLowerCase(),
        nombre: nombre || '',
        rol:    rolFinal,
        activo: true,
      }, { onConflict: 'id' })

    if (profileErr) {
      console.error('Error perfil:', profileErr.message)
      return json({ error: 'Usuario creado pero hubo un error guardando el perfil: ' + profileErr.message }, 500)
    }

    const msg = existingAuth
      ? `El usuario ${email} ya existía. Se actualizó su perfil y se envió un correo para restablecer la contraseña.`
      : `Invitación enviada a ${email}. El usuario recibirá un correo para crear su contraseña.`

    return json({ success: true, message: msg, userId })

  } catch (err) {
    console.error('Error invite-user:', err)
    return json({ error: err.message || 'Error interno' }, 500)
  }
})
