import React, { useContext, useEffect, useState } from "react";
import "../css/HistoryPage.css";
import axios from "axios";
import { toast } from "react-toastify";
import { toastErrorStyle } from "../components/utils/toastStyle";
import { GlobalContext } from "../components/utils/GlobalState";
import { authHeaders } from "../components/utils/api";
import Navbar from "../components/Navbar";
import InterviewDetailModal from "../components/InterviewDetailModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function scoreColor(score) {
  if (score === null || score === undefined) return "#888";
  if (score >= 75) return "#2ecc71";
  if (score >= 50) return "#EDC215";
  return "#e74c3c";
}

function HistoryPage() {
  const { gUser, gToken } = useContext(GlobalContext);
  const serverURL = process.env.REACT_APP_SERVER_URL;
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [loadingDetailId, setLoadingDetailId] = useState(null);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${serverURL}/api/interview/history`,
        authHeaders(gToken),
      );
      setInterviews(response.data.interviews);
    } catch (error) {
      toast.error(
        error.response ? error.response.data.errorMsg : error.message || error,
        { ...toastErrorStyle(), autoClose: 2000 },
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openDetail = async (id) => {
    try {
      setLoadingDetailId(id);
      const response = await axios.get(
        `${serverURL}/api/interview/history/${id}`,
        authHeaders(gToken),
      );
      setSelected(response.data.interview);
    } catch (error) {
      toast.error(
        error.response ? error.response.data.errorMsg : error.message || error,
        { ...toastErrorStyle(), autoClose: 2000 },
      );
    } finally {
      setLoadingDetailId(null);
    }
  };

  const avgScore = interviews.length
    ? Math.round(
        interviews
          .filter((i) => i.score !== null && i.score !== undefined)
          .reduce((sum, i, _, arr) => sum + i.score / arr.length, 0),
      )
    : null;

  // Oldest -> newest, for a left-to-right progress trend line
  const trendData = [...interviews]
    .filter((i) => i.score !== null && i.score !== undefined)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((i, idx) => ({
      attempt: `#${idx + 1}`,
      score: i.score,
      role: i.jobRole,
      date: i.createdAt ? new Date(i.createdAt).toLocaleDateString() : "",
    }));

  return (
    <div className="history-page">
      <Navbar />

      <div className="history-content">
        <div className="history-heading">
          <div>
            <h1>My Interview History</h1>
            <p>Hi {gUser?.name}, here's how you've performed so far.</p>
          </div>
          <button className="history-new-btn" onClick={() => navigate("/")}>
            + New Interview
          </button>
        </div>

        <div className="history-summary-cards">
          <div className="history-summary-card">
            <span className="hs-label">Total Interviews</span>
            <span className="hs-value">{interviews.length}</span>
          </div>
          <div className="history-summary-card">
            <span className="hs-label">Average Score</span>
            <span className="hs-value" style={{ color: scoreColor(avgScore) }}>
              {avgScore !== null ? avgScore : "--"}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="history-loading">
            <FontAwesomeIcon icon={faSpinner} spin /> Loading history...
          </div>
        ) : interviews.length === 0 ? (
          <div className="history-empty">
            <p>You haven't taken any mock interviews yet.</p>
            <button className="history-new-btn" onClick={() => navigate("/")}>
              Take your first interview
            </button>
          </div>
        ) : (
          <>
            {trendData.length > 1 && (
              <div className="history-chart-card">
                <h3>Score Progress</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart
                    data={trendData}
                    margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="attempt" stroke="#999" fontSize={12} />
                    <YAxis domain={[0, 100]} stroke="#999" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "#1c1c1c",
                        border: "1px solid #2a2a2a",
                        borderRadius: 8,
                      }}
                      labelStyle={{ color: "#EDC215" }}
                      formatter={(value) => [`${value}`, "Score"]}
                      labelFormatter={(label, payload) =>
                        payload && payload[0]
                          ? `${payload[0].payload.role} (${payload[0].payload.date})`
                          : label
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#EDC215"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#EDC215" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Job Role</th>
                    <th>Experience</th>
                    <th>Score</th>
                    <th>Suspicious Activity</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((interview) => (
                    <tr key={interview.id}>
                      <td>{interview.jobRole}</td>
                      <td className="capitalize">
                        {interview.expLevel || "-"}
                      </td>
                      <td>
                        <span
                          className="score-pill"
                          style={{
                            borderColor: scoreColor(interview.score),
                            color: scoreColor(interview.score),
                          }}
                        >
                          {interview.score !== null &&
                          interview.score !== undefined
                            ? interview.score
                            : "--"}
                        </span>
                      </td>
                      <td>{interview.suspiciousCount}</td>
                      <td>
                        {interview.createdAt
                          ? new Date(interview.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={() => openDetail(interview.id)}
                          disabled={loadingDetailId === interview.id}
                        >
                          {loadingDetailId === interview.id ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                          ) : (
                            "View"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <InterviewDetailModal
        interview={selected}
        onClose={() => setSelected(null)}
        candidateName={gUser?.name}
      />
    </div>
  );
}

export default HistoryPage;