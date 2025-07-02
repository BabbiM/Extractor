import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'antd/dist/reset.css';  // Updated import for antd v5+ (recommended)
// or for older versions:
// import 'antd/dist/antd.min.css';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("React Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Check the console.</h1>;
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);