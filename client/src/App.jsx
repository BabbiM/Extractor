import React from "react";
import ExtractForm from "./components/ExtractForm";  // Removed /src from path
import Results from "./components/Results";
import AnalyticsPanel from "./components/AnalyticsPanel";
import 'antd/dist/reset.css';  // Updated import for antd v5+ (recommended)
// or for older versions:
// import 'antd/dist/antd.min.css';

function App() {
  return (
    <div className="app-container" style={{ 
      padding: "2rem", 
      fontFamily: "sans-serif",
      maxWidth: "1200px",
      margin: "0 auto"
    }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>YouTube Comment Extractor</h1>
      
      <ExtractForm />
      
      <div style={{ 
        display: "flex", 
        gap: "2rem", 
        marginTop: "2rem",
        flexWrap: "wrap"
      }}>
        <div style={{ flex: 2, minWidth: "300px" }}>
          <Results />
        </div>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <AnalyticsPanel />
        </div>
      </div>
    </div>
  );
}

export default App;