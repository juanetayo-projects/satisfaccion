export default function LoadingSpinner({ fullScreen = false, message = 'Cargando...' }) {
  const inner = (
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <span className="text-sm text-gray-500">{message}</span>
    </div>
  )
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {inner}
      </div>
    )
  }
  return <div className="flex items-center justify-center py-16">{inner}</div>
}
