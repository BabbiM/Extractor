import React from 'react';
import './CommentsTable.css';

const CommentsTable = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return <p>No comments available.</p>;
  }

  return (
    <div className="comments-table-container">
      <h3>Extracted Comments</h3>
      <table className="comments-table">
        <thead>
          <tr>
            <th>Author</th>
            <th>Comment</th>
            <th>Likes</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((comment, index) => (
            <tr key={index}>
              <td>{comment.author}</td>
              <td>{comment.text}</td>
              <td>{comment.likes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommentsTable;
