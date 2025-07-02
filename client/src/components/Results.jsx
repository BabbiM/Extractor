import React from 'react';

const Results = ({ results }) => {
  if (!results) return null;

  const { analytics, csvLink } = results;

  return (
    <div>
      <h2>Extraction Summary</h2>
      <ul>
        {Object.entries(analytics).map(([key, value]) => (
          <li key={key}><strong>{key}:</strong> {value}</li>
        ))}
      </ul>
      <a href={csvLink} download>
        Download CSV
      </a>
    </div>
  );
};

export default Results;
