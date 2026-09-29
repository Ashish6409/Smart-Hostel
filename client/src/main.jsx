import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("SmartHostel Frontend Runtime Error:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('smart_hostel_token');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-6 text-slate-100 font-sans">
          <div className="max-w-md w-full bg-[#111726] border border-red-500/30 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center font-bold text-xl">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-white">Something went wrong</h2>
            <p className="text-xs text-slate-400">
              An unexpected display error occurred while rendering the page.
            </p>
            <div className="p-3 bg-slate-950/80 rounded-xl text-left border border-white/[0.06] overflow-x-auto text-[11px] font-mono text-rose-300">
              {this.state.error?.message || String(this.state.error)}
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Reset Session
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
