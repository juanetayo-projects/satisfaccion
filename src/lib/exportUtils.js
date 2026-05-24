import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const HEADERS = [
  'ID', 'Fecha', 'Nombre', 'Identificación', 'Teléfono',
  'Sede', 'Entidad de Salud', 'Servicio',
  'P1 Recepción', 'P2 Personal Asistencial', 'P3 Comodidad',
  'P4 Experiencia Global', 'P5 Motivo Insatisfacción',
  'P6 Recomendaría', 'Comentarios',
]

function rowToArray(r) {
  return [
    r.id,
    r.fecha ? format(new Date(r.fecha), 'dd/MM/yyyy HH:mm', { locale: es }) : '',
    r.nombre_completo || '',
    r.numero_identificacion || '',
    r.telefono || '',
    r.sede || '',
    r.entidad_salud || '',
    r.servicio || '',
    r.p1_recepcion || '',
    r.p2_personal_asistencial || '',
    r.p3_comodidad || '',
    r.p4_experiencia_global || '',
    r.p5_motivo_insatisfaccion || '',
    r.p6_recomendaria || '',
    r.comentarios || '',
  ]
}

export function exportToExcel(rows, filename = 'satisfaccion') {
  const wb = XLSX.utils.book_new()
  const data = [HEADERS, ...rows.map(rowToArray)]
  const ws = XLSX.utils.aoa_to_sheet(data)

  // Column widths
  ws['!cols'] = [
    { wch: 6 }, { wch: 18 }, { wch: 28 }, { wch: 16 }, { wch: 14 },
    { wch: 30 }, { wch: 28 }, { wch: 36 },
    { wch: 12 }, { wch: 18 }, { wch: 14 },
    { wch: 16 }, { wch: 52 },
    { wch: 14 }, { wch: 40 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Respuestas')
  XLSX.writeFile(wb, `${filename}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
}

export function exportToCSV(rows, filename = 'satisfaccion') {
  const wb = XLSX.utils.book_new()
  const data = [HEADERS, ...rows.map(rowToArray)]
  const ws = XLSX.utils.aoa_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, 'Respuestas')
  XLSX.writeFile(wb, `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`, { bookType: 'csv' })
}

export function exportToPDF(rows) {
  // PDF via browser print
  const content = document.createElement('div')
  content.innerHTML = `
    <style>
      body { font-family: Arial, sans-serif; font-size: 11px; }
      h2 { color: #1B4F8A; }
      table { border-collapse: collapse; width: 100%; }
      th { background: #1B4F8A; color: white; padding: 6px 8px; text-align: left; }
      td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; }
      tr:nth-child(even) td { background: #f9fafb; }
    </style>
    <h2>Encuesta de Satisfacción - CAC Santa Bárbara</h2>
    <p>Generado: ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })}</p>
    <table>
      <thead><tr>${HEADERS.slice(0, 8).map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>
        ${rows.map(r => {
          const a = rowToArray(r)
          return `<tr>${a.slice(0, 8).map(v => `<td>${v}</td>`).join('')}</tr>`
        }).join('')}
      </tbody>
    </table>
  `
  const w = window.open('', '_blank')
  w.document.body.appendChild(content)
  w.print()
}
