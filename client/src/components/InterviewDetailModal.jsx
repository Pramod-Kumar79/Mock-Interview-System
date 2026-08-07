import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../css/InterviewDetailModal.css";
import { downloadInterviewReport } from "./utils/pdfReport";

function scoreColor(score) {
  if (score === null || score === undefined) return "#888";
  if (score >= 75) return "#2ecc71";
  if (score >= 50) return "#EDC215";
  return "#e74c3c";
}

function InterviewDetailModal({ interview, onClose, candidateName }) {
  if (!interview) return null;

  const categoryEntries = interview.categoryScores
    ? Object.entries(interview.categoryScores)
    : [];

  return (
    <div className="idm-overlay" onClick={onClose}>
      <div className="idm-card" onClick={(e) => e.stopPropagation()}>
        <button className="idm-close" onClick={onClose}>
          &times;
        </button>

        <div className="idm-header">
          <div>
            <h2>{interview.jobRole}</h2>
            <p className="idm-meta">
              {interview.expLevel ? `${interview.expLevel} • ` : ""}
              {interview.createdAt
                ? new Date(interview.createdAt).toLocaleString()
                : ""}
            </p>
          </div>
          <div
            className="idm-score"
            style={{ borderColor: scoreColor(interview.score) }}
          >
            <span style={{ color: scoreColor(interview.score) }}>
              {interview.score !== null && interview.score !== undefined
                ? interview.score
                : "--"}
            </span>
            <small>/ 100</small>
          </div>
        </div>

        <div className="idm-stats">
          <div className="idm-stat">
            <span className="idm-stat-label">Suspicious Activity</span>
            <span className="idm-stat-value">
              {interview.suspiciousCount} time(s)
            </span>
          </div>
          <button
            className="idm-download-btn"
            onClick={() => downloadInterviewReport(interview, candidateName)}
          >
            Download PDF Report
          </button>
        </div>

        {categoryEntries.length > 0 && (
          <div className="idm-section">
            <h3>Category Breakdown</h3>
            <div className="idm-categories">
              {categoryEntries.map(([name, val]) => (
                <div className="idm-category-row" key={name}>
                  <span className="idm-category-name">{name}</span>
                  <div className="idm-category-bar-track">
                    <div
                      className="idm-category-bar-fill"
                      style={{ width: `${val}%`, background: scoreColor(val) }}
                    />
                  </div>
                  <span className="idm-category-value">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {interview.review && (
          <div className="idm-section">
            <h3>AI Feedback</h3>
            <div className="idm-review">
              <Markdown remarkPlugins={[remarkGfm]}>
                {interview.review}
              </Markdown>
            </div>
          </div>
        )}

        {interview.questions && interview.questions.length > 0 && (
          <div className="idm-section">
            <h3>Questions &amp; Answers</h3>
            {interview.questions.map((q, idx) => (
              <div className="idm-qa" key={idx}>
                <p className="idm-question">
                  Q{idx + 1}. {q}
                </p>
                <p className="idm-answer">
                  {interview.answers && interview.answers[idx] ? (
                    interview.answers[idx]
                  ) : (
                    <em>No answer recorded</em>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewDetailModal;