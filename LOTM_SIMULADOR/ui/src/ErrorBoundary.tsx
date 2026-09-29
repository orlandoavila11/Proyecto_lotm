import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('Critical UI Boundary Catch:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090807', color: '#e5ded2', padding: '20px' }}>
          <div className="parchment-sheet" style={{ maxWidth: '600px', padding: '30px', textAlign: 'center' }}>
            <h2 style={{ color: '#851c22', marginBottom: '10px', fontFamily: 'Cinzel' }}>Disonancia Astral Detectada</h2>
            <p style={{ color: '#555', marginBottom: '15px' }}>Se ha producido una perturbación en el flujo del Velo Ocultista:</p>
            <pre style={{ background: '#191714', color: '#ef4444', padding: '10px', borderRadius: '4px', textAlign: 'left', fontSize: '0.8rem', overflowX: 'auto', marginBottom: '20px' }}>
              {this.state.error?.message || String(this.state.error)}
            </pre>
            <button onClick={() => window.location.reload()} className="crimson-btn" style={{ padding: '8px 20px', cursor: 'pointer' }}>
              Reanudar la Conexión con Backlund
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
