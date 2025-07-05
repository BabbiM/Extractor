import React from 'react';
import { Card, Row, Col } from 'antd';
import { ErrorBoundary } from 'react-error-boundary';
import ExtractForm from './components/ExtractForm';
import 'antd/dist/reset.css';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" style={{ padding: '24px', color: '#ff4d4f' }}>
      <h2>Something went wrong:</h2>
      <pre style={{ 
        whiteSpace: 'pre-wrap',
        backgroundColor: '#fff2f0',
        padding: '16px',
        borderRadius: '4px'
      }}>
        {error.message}
      </pre>
      <button 
        onClick={resetErrorBoundary}
        style={{
          marginTop: '16px',
          padding: '8px 16px',
          backgroundColor: '#1890ff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Try Again
      </button>
    </div>
  );
}

function App() {
  return (
    <div style={{ 
      padding: '24px',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5'
    }}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => window.location.reload()}
      >
        <Row justify="center" align="middle">
          <Col xs={24} sm={22} md={20} lg={18} xl={16}>
            <Card
              title="YouTube Comment Collector"
              headStyle={{
                fontSize: '20px',
                fontWeight: 'bold',
                textAlign: 'center'
              }}
              style={{
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <ExtractForm />
            </Card>
          </Col>
        </Row>
      </ErrorBoundary>
    </div>
  );
}

export default App;