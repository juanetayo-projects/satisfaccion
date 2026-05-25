import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#fff1f2', minHeight: '100vh' }}>
          <h2 style={{ color: '#dc2626' }}>Error al cargar la aplicación</h2>
          <pre style={{ background: '#fee2e2', padding: '1rem', borderRadius: '8px', overflow: 'auto', fontSize: '13px' }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Variables de entorno cargadas:<br />
            VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ definida' : '❌ vacía'}<br />
            VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ definida' : '❌ vacía'}
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
