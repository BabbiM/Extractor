import React from "react";

const AnalyticsPanel = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="analytics-panel">
      <h2>Channel Analytics</h2>
      <ul>
        <li><strong>Total Videos Scraped:</strong> {stats.total_videos}</li>
        <li><strong>Videos with Comments:</strong> {stats.videos_with_comments}</li>
        <li><strong>Total Comments:</strong> {stats.total_comments}</li>
        <li><strong>Average Comments per Video:</strong> {stats.avg_comments_per_video}</li>
      </ul>
    </div>
  );
};

export default AnalyticsPanel;
