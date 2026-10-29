import { Component, type ErrorInfo, type ReactNode } from 'react';
import { pruneStorageCaches } from '../lib/storage';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[G-koo ErrorBoundary caught fatal error]:', error, errorInfo);
    this.setState({ errorInfo });

    // If storage quota error, immediately prune bloated temporary question caches
    if (error?.message && error.message.toLowerCase().includes('quota')) {
      pruneStorageCaches();
    }

    try {
      (window as any).__lastReactError = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: Date.now(),
      };
    } catch {}
  }

  private handleReload = () => {
    pruneStorageCaches();
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#FCF9F7] dark:bg-[#0F121E] text-center select-none">
          <div className="w-20 h-20 mb-4 rounded-3xl bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-800 flex items-center justify-center text-4xl shadow-lg animate-bounce">
            ⚠️
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">
            {this.props.fallbackTitle || 'कुछ गड़बड़ हो गई (Something went wrong)'}
          </h2>

          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium max-w-md mb-4 leading-relaxed">
            ऐप में एक अप्रत्याशित समस्या आई है। कृपया दोबारा प्रयास करें या मुख्य पृष्ठ पर जाएँ।
          </p>

          {this.state.error && (
            <div className="w-full max-w-md bg-black/5 dark:bg-white/5 border border-rose-300 dark:border-rose-800/60 rounded-2xl p-3 mb-6 text-left overflow-x-auto text-xs text-rose-600 dark:text-rose-400 font-mono">
              <strong>Error:</strong> {this.state.error.message || String(this.state.error)}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <button
              onClick={this.handleReload}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#FF5F6D] text-white font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer"
            >
              दोबारा लोड करें (Retry)
            </button>
            <button
              onClick={this.handleGoHome}
              className="flex-1 py-3 px-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              होम पेज (Home)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
