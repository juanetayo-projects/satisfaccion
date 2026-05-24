import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSurveyData(filters = {}) {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const [page, setPage]       = useState(1)
  const pageSize = 20

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('satisfaccion_respuestas')
        .select('*', { count: 'exact' })
        .order('fecha', { ascending: false })

      if (filters.sede)     query = query.eq('sede', filters.sede)
      if (filters.servicio) query = query.eq('servicio', filters.servicio)
      if (filters.entidad)  query = query.eq('entidad_salud', filters.entidad)
      if (filters.desde)    query = query.gte('fecha', filters.desde)
      if (filters.hasta)    query = query.lte('fecha', filters.hasta + 'T23:59:59')
      if (filters.search) {
        query = query.or(
          `nombre_completo.ilike.%${filters.search}%,numero_identificacion.ilike.%${filters.search}%`
        )
      }

      query = query.range((page - 1) * pageSize, page * pageSize - 1)

      const { data: rows, count, error: err } = await query
      if (err) throw err
      setData(rows || [])
      setTotal(count || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => { fetch() }, [fetch])

  return { data, total, loading, error, page, setPage, pageSize, refetch: fetch }
}

export function useSurveyStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('satisfaccion_respuestas')
        .select('p1_recepcion, p2_personal_asistencial, p3_comodidad, p4_experiencia_global, p6_recomendaria, sede, servicio, fecha')

      if (error || !data) { setLoading(false); return }

      const total = data.length
      const completed = data.filter(r => r.p4_experiencia_global).length

      const avg = (field) => {
        const vals = data.filter(r => r[field]).map(r => r[field])
        return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0
      }

      const countBy = (field) => data.reduce((acc, r) => {
        const v = r[field] || 'Sin dato'
        acc[v] = (acc[v] || 0) + 1
        return acc
      }, {})

      const recomienda = data.filter(r => r.p6_recomendaria === 'Si').length
      const pctRecomienda = total ? Math.round((recomienda / total) * 100) : 0

      // Monthly trend (last 6 months)
      const monthly = {}
      data.forEach(r => {
        if (!r.fecha) return
        const key = r.fecha.slice(0, 7)
        monthly[key] = (monthly[key] || 0) + 1
      })
      const trend = Object.entries(monthly)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, count]) => ({ month, count }))

      setStats({
        total,
        completed,
        avgRecepcion: avg('p1_recepcion'),
        avgPersonal: avg('p2_personal_asistencial'),
        avgComodidad: avg('p3_comodidad'),
        pctRecomienda,
        experienciaGlobal: countBy('p4_experiencia_global'),
        porSede: countBy('sede'),
        porServicio: countBy('servicio'),
        trend,
      })
      setLoading(false)
    }
    load()
  }, [])

  return { stats, loading }
}
