import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

const SAVE_GAME_KEY = 'cosmicMinerIdleSave_v4';

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }
  
  handleReset = () => {
    try {
      localStorage.removeItem(SAVE_GAME_KEY);
      window.location.reload();
    } catch (e) {
      console.error("Failed to clear local storage", e);
      window.location.reload();
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white text-center p-4">
            <h1 className="text-4xl font-bold text-red-500 mb-4">Oops! Something went wrong.</h1>
            <p className="text-lg mb-6">A critical error occurred in the cosmic fabric of the game.</p>
            <div className="space-x-4">
                <button 
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded transition-colors duration-200"
                >
                    Refresh Page
                </button>
                <button 
                    onClick={this.handleReset}
                    className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-6 rounded transition-colors duration-200"
                >
                    Reset Game & Refresh
                </button>
            </div>
            <p className="text-sm text-gray-400 mt-6">Resetting the game will clear your saved progress. This is a last resort if refreshing doesn't work.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;