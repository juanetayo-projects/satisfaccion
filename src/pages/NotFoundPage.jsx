import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <div className="text-8xl font-extrabold text-primary-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-700 mb-2">Página no encontrada</h1>
        <p className="text-gray-400 mb-8">La página que busca no existe.</p>
        <Link to="/" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
