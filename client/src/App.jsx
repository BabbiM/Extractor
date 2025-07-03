import React from 'react';
import { Card, Row, Col } from 'antd';
import ExtractForm from './components/ExtractForm';
import 'antd/dist/reset.css';
function App() {
  return (
    <div style={{ 
      padding: '24px',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5'
    }}>
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
    </div>
  );
}

export default App;