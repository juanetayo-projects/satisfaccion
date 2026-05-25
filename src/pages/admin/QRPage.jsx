import { useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, Copy, CheckCircle, ExternalLink, QrCode } from 'lucide-react'

const SURVEY_URL = 'https://juanetayo-projects.github.io/satisfaccion/#/encuesta'

const SIZES = [
  { label: 'Pequeño (200px)', value: 200, desc: 'WhatsApp / redes sociales' },
  { label: 'Mediano (300px)', value: 300, desc: 'Folletos e impresiones pequeñas' },
  { label: 'Grande (500px)',  value: 500, desc: 'Afiches y carteles' },
]

export default function QRPage() {
  const canvasRef   = useRef(null)
  const [size, setSize]       = useState(300)
  const [copied, setCopied]   = useState(false)
  const [fgColor, setFgColor] = useState('#1B4F8A')

  function downloadPNG() {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const url  = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `QR-Encuesta-CACsantabarbara-${size}px.png`
    link.href = url
    link.click()
  }

  function copyURL() {
    navigator.clipboard.writeText(SURVEY_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
          <QrCode size={24} className="text-primary-600" /> Código QR — Encuesta
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Comparta o imprima el QR para que los pacientes accedan a la encuesta fácilmente
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* QR Preview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex flex-col items-center gap-4">
          <div
            ref={canvasRef}
            className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100"
          >
            <QRCodeCanvas
              value={SURVEY_URL}
              size={240}
              bgColor="#ffffff"
              fgColor={fgColor}
              level="H"
              includeMargin={false}
              imageSettings={{
                src: '/satisfaccion/logo.png',
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>
          <p className="text-xs text-gray-400 text-center">
            Vista previa — el logo de la clínica aparece en el centro
          </p>
          <button
            onClick={downloadPNG}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            <Download size={18} /> Descargar PNG ({size}px)
          </button>
        </div>

        {/* Opciones */}
        <div className="space-y-4">

          {/* Tamaño */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-3">Tamaño de descarga</h2>
            <div className="space-y-2">
              {SIZES.map(s => (
                <label key={s.value} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="size"
                    value={s.value}
                    checked={size === s.value}
                    onChange={() => setSize(s.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <div className="text-sm font-semibold text-gray-700">{s.label}</div>
                    <div className="text-xs text-gray-400">{s.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-3">Color del QR</h2>
            <div className="flex gap-3 flex-wrap">
              {[
                { color: '#1B4F8A', label: 'Azul corporativo' },
                { color: '#000000', label: 'Negro estándar' },
                { color: '#1a6b3a', label: 'Verde' },
              ].map(c => (
                <button
                  key={c.color}
                  onClick={() => setFgColor(c.color)}
                  title={c.label}
                  className={`w-9 h-9 rounded-full border-4 transition-all ${fgColor === c.color ? 'border-primary-400 scale-110' : 'border-gray-200'}`}
                  style={{ background: c.color }}
                />
              ))}
            </div>
          </div>

          {/* URL */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-3">Enlace de la encuesta</h2>
            <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-xs font-mono text-gray-600 break-all mb-3">
              {SURVEY_URL}
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyURL}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                  ${copied
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-700'
                  }`}
              >
                {copied ? <><CheckCircle size={15} /> Copiado</> : <><Copy size={15} /> Copiar enlace</>}
              </button>
              <a
                href={SURVEY_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white border-2 border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-700 transition-all"
              >
                <ExternalLink size={15} /> Abrir
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Instrucciones de uso */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-blue-800 mb-3">💡 Sugerencias de uso</h2>
        <ul className="text-xs text-blue-700 space-y-1.5">
          <li>• <strong>Afiches en sala de espera:</strong> imprima en tamaño grande (500px) para mayor visibilidad.</li>
          <li>• <strong>Tarjetas de atención:</strong> use el tamaño mediano (300px) en material impreso pequeño.</li>
          <li>• <strong>WhatsApp / correo:</strong> comparta el enlace directamente o el QR en tamaño pequeño (200px).</li>
          <li>• <strong>Pantallas digitales:</strong> use el enlace directo o el QR grande como salvapantallas.</li>
        </ul>
      </div>

    </div>
  )
}
