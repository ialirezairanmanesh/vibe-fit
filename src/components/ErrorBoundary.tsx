import React from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error in React Component Tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearCache = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }
    } catch (e) {
      console.warn('Error clearing SW/caches:', e);
    }
    window.location.href = window.location.pathname + '?reset=' + Date.now();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] text-neutral-100 flex items-center justify-center p-4 dir-rtl text-right font-sans">
          <div className="max-w-md w-full bg-neutral-900 border border-red-500/30 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold text-neutral-100">خطا در اجرا یا بارگذاری برنامه</h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                متأسفانه مشکلی در بارگذاری اجزای برنامه یا حافظه موقت رخ داده است.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-neutral-950/80 border border-neutral-800 rounded-xl text-[11px] text-red-300 font-mono overflow-x-auto max-h-28 text-left dir-ltr">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 bg-[#D1FF00] hover:bg-[#b8e600] text-neutral-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition active:scale-98 shadow-lg shadow-[#D1FF00]/10"
              >
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                <span>تلاش مجدد و بروزرسانی صفحه</span>
              </button>

              <button
                onClick={this.handleClearCache}
                className="w-full py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition active:scale-98"
              >
                <Trash2 className="w-4 h-4" />
                <span>پاکسازی کش مرورگر و راه‌اندازی مجدد</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
