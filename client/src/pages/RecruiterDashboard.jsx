import React, { useContext, useEffect, useState } from "react";
import "../css/HistoryPage.css";
import "../css/RecruiterPage.css";
import axios from "axios";
import { toast } from "react-toastify";
import { toastErrorStyle } from "../components/utils/toastStyle";
import { GlobalContext } from "../components/utils/GlobalState";
import { authHeaders } from "../components/utils/api";
import Navbar from "../components/Navbar";
import InterviewDetailModal from "../components/InterviewDetailModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

function scoreColor(score) {
  if (score === null || score === undefined) return "#888";
  if (score >= 75) return "#2ecc71";
  if (score >= 50) return "#EDC215";
  return "#e74c3c";
}

function RecruiterDashboard() {
  const { gUser, gToken } = useContext(GlobalContext);
  const serverURL = process.env.REACT_APP_SERVER_URL;

  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeCandidate, setActiveCandidate] = useState(null); // {id, name, email}
  const [candidateInterviews, setCandidateInterviews] = useState([]);
  const [isLoadingCandidate, setIsLoadingCandidate] = useState(false);

  const [selectedInterview, setSelectedInterview] = useState(null);
  const [loadingDetailId, setLoadingDetailId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [minScore, setMinScore] = useState("");
  const [sortBy, setSortBy] = useState("name"); // name | avgScore | totalInterviews | lastInterviewAt

  useEffect(() => {
    fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${serverURL}/api/recruiter/candidates`,
        authHeaders(gToken),
      );
      setCandidates(response.data.candidates);
    } catch (error) {
      toast.error(
        error.response ? error.response.data.errorMsg : error.message || error,
        { ...toastErrorStyle(), autoClose: 2000 },
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openCandidate = async (candidate) => {
    try {
      setActiveCandidate(candidate);
      setIsLoadingCandidate(true);
      const response = await axios.get(
        `${serverURL}/api/recruiter/candidates/${candidate.id}/history`,
        authHeaders(gToken),
      );
      setCandidateInterviews(response.data.interviews);
    } catch (error) {
      toast.error(
        error.response ? error.response.data.errorMsg : error.message || error,
        { ...toastErrorStyle(), autoClose: 2000 },
      );
    } finally {
      setIsLoadingCandidate(false);
    }
  };

  const openInterviewDetail = async (id) => {
    try {
      setLoadingDetailId(id);
      const response = await axios.get(
        `${serverURL}/api/interview/history/${id}`,
        authHeaders(gToken),
      );
      setSelectedInterview(response.data.interview);
    } catch (error) {
      toast.error(
        error.response ? error.response.data.errorMsg : error.message || error,
        { ...toastErrorStyle(), autoClose: 2000 },
      );
    } finally {
      setLoadingDetailId(null);
    }
  };

  const displayedCandidates = candidates
    .filter((c) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term);
      const matchesScore =
        !minScore ||
        (c.avgScore !== null &&
          c.avgScore !== undefined &&
          c.avgScore >= Number(minScore));
      return matchesSearch && matchesScore;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "avgScore":
          return (b.avgScore ?? -1) - (a.avgScore ?? -1);
        case "totalInterviews":
          return b.totalInterviews - a.totalInterviews;
        case "lastInterviewAt":
          return (
            new Date(b.lastInterviewAt || 0) - new Date(a.lastInterviewAt || 0)
          );
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="history-page">
      <Navbar />

      <div className="history-content">
        {!activeCandidate ? (
          <>
            <div className="history-heading">
              <div>
                <h1>Recruiter Dashboard</h1>
                <p>
                  Hi {gUser?.name}, here's the mock interview performance of
                  every candidate.
                </p>
              </div>
            </div>

            <div className="history-summary-cards">
              <div className="history-summary-card">
                <span className="hs-label">Total Candidates</span>
                <span className="hs-value">{candidates.length}</span>
              </div>
              <div className="history-summary-card">
                <span className="hs-label">Total Interviews</span>
                <span className="hs-value">
                  {candidates.reduce((sum, c) => sum + c.totalInterviews, 0)}
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="history-loading">
                <FontAwesomeIcon icon={faSpinner} spin /> Loading candidates...
              </div>
            ) : candidates.length === 0 ? (
              <div className="history-empty">
                <p>No candidates have signed up yet.</p>
              </div>
            ) : (
              <>
                <div className="recruiter-filters">
                  <input
                    type="text"
                    className="recruiter-search-input"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="recruiter-minscore-input"
                    placeholder="Min avg score"
                    value={minScore}
                    onChange={(e) => setMinScore(e.target.value)}
                  />
                  <select
                    className="recruiter-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">Sort: Name (A-Z)</option>
                    <option value="avgScore">Sort: Avg Score (High-Low)</option>
                    <option value="totalInterviews">
                      Sort: Interviews Taken
                    </option>
                    <option value="lastInterviewAt">Sort: Most Recent</option>
                  </select>
                </div>

                {displayedCandidates.length === 0 ? (
                  <div className="history-empty">
                    <p>No candidates match your filters.</p>
                  </div>
                ) : (
                  <div className="history-table-wrapper">
                    <table className="history-table">
                      <thead>
                        <tr>
                          <th>Candidate</th>
                          <th>Email</th>
                          <th>Interviews Taken</th>
                          <th>Avg Score</th>
                          <th>Last Interview</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedCandidates.map((c) => (
                          <tr key={c.id}>
                            <td>{c.name}</td>
                            <td>{c.email}</td>
                            <td>{c.totalInterviews}</td>
                            <td>
                              <span
                                className="score-pill"
                                style={{
                                  borderColor: scoreColor(c.avgScore),
                                  color: scoreColor(c.avgScore),
                                }}
                              >
                                {c.avgScore !== null && c.avgScore !== undefined
                                  ? c.avgScore
                                  : "--"}
                              </span>
                            </td>
                            <td>
                              {c.lastInterviewAt
                                ? new Date(
                                    c.lastInterviewAt,
                                  ).toLocaleDateString()
                                : "-"}
                            </td>
                            <td>
                              <button
                                className="recruiter-view-btn"
                                onClick={() => openCandidate(c)}
                                disabled={c.totalInterviews === 0}
                              >
                                {c.totalInterviews === 0
                                  ? "No interviews"
                                  : "View History"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <button
              className="back-btn"
              onClick={() => {
                setActiveCandidate(null);
                setCandidateInterviews([]);
              }}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Back to all candidates
            </button>

            <div className="history-heading">
              <div>
                <h1>{activeCandidate.name}'s Interview History</h1>
                <p>{activeCandidate.email}</p>
              </div>
            </div>

            {isLoadingCandidate ? (
              <div className="history-loading">
                <FontAwesomeIcon icon={faSpinner} spin /> Loading interviews...
              </div>
            ) : candidateInterviews.length === 0 ? (
              <div className="history-empty">
                <p>This candidate hasn't taken any interviews yet.</p>
              </div>
            ) : (
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
                    {candidateInterviews.map((interview) => (
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
                            onClick={() => openInterviewDetail(interview.id)}
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
            )}
          </>
        )}
      </div>

      <InterviewDetailModal
        interview={selectedInterview}
        onClose={() => setSelectedInterview(null)}
        candidateName={activeCandidate?.name}
      />
    </div>
  );
}

export default RecruiterDashboard;