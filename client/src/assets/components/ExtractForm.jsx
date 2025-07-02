import React, { useState } from "react";
import axios from "axios";

const ExtractForm = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [maxComments, setMaxComments] = useState(10);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setComments([]);

    try {
      const response = await axios.get("http://localhost:8000/extract_video", {
        params: {
          video_url: videoUrl,
          max_comments: maxComments
        },
      });

      if (response.data.error) {
        setError(response.data.error);
      } else {
        setComments(response.data.comments);
      }
    } catch (err) {
      setError("Server error: Could not fetch comments.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <h2>Extract YouTube Comments</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Video URL:</label>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=XXXX"
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Max Comments:</label>
          <input
            type="number"
            value={maxComments}
            onChange={(e) => setMaxComments(e.target.value)}
            min="1"
            max="100"
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <button type="submit" style={{ padding: "0.75rem 1.5rem" }}>
          Extract Comments
        </button>
        <button onClick={downloadCSV}>Download Comments as CSV</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {comments.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Comments</h3>
          <ul>
            {comments.map((c, index) => (
              <li key={index}>{c.text}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExtractForm;
