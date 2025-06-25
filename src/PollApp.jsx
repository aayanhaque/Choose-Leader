import React, { useState, useEffect } from 'react';
import './PollApp.css';

const POLL_OPTIONS = [
  "BJP (Bharatiya Janata Party)",
  "Congress (Indian National Congress)",
  "AAP (Aam Aadmi Party)",
  "Other"
];

export default function PollApp() {
  const [votes, setVotes] = useState({});
  const [voted, setVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const MAX_VOTES = 3;
  const [showResults, setShowResults] = useState(false);
  const [lastVoted, setLastVoted] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [sessionVotes, setSessionVotes] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const savedVotes = JSON.parse(localStorage.getItem("pollVotes")) || {};
    setVotes(savedVotes);
    const savedVoteCount = parseInt(localStorage.getItem("voteCount") || "0", 10);
    setVoteCount(savedVoteCount);
  }, []);

  const handlePartyClick = (option) => {
    if (submitted) return;
    setSessionVotes(prev => ({ ...prev, [option]: (prev[option] || 0) + 1 }));
  };

  const handleSubmit = () => {
    if (submitted) return;
    // Add sessionVotes to main votes
    const updatedVotes = { ...votes };
    Object.keys(sessionVotes).forEach(option => {
      updatedVotes[option] = (updatedVotes[option] || 0) + sessionVotes[option];
    });
    setVotes(updatedVotes);
    localStorage.setItem("pollVotes", JSON.stringify(updatedVotes));
    setSubmitted(true);
  };

  const handleRefresh = () => {
    setSubmitted(false);
    setSessionVotes({});
    setVoteCount(0);
    localStorage.setItem("voteCount", "0");
    const resetVotes = {};
    POLL_OPTIONS.forEach(option => { resetVotes[option] = 0; });
    setVotes(resetVotes);
    localStorage.setItem("pollVotes", JSON.stringify(resetVotes));
  };

  const voteCounts = POLL_OPTIONS.map(option => votes[option] || 0);
  const totalVotes = voteCounts.reduce((a, b) => a + b, 0);
  // Find the max vote count and which parties have it
  const maxVotes = Math.max(...voteCounts);
  const winners = POLL_OPTIONS.filter(option => (votes[option] || 0) === maxVotes && maxVotes > 0);
  const losers = POLL_OPTIONS.filter(option => !winners.includes(option));

  return (
    <div className="poll-container">
      <div className="poll-section">
        <h2 className="poll-question">Which political party do you support?</h2>
      </div>
      <div className="poll-section">
        <div className="poll-buttons">
          {POLL_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => handlePartyClick(option)}
              disabled={submitted}
              className="poll-button"
              type="button"
            >
              {option} {sessionVotes[option] ? `(${sessionVotes[option]})` : ""}
            </button>
          ))}
        </div>
        <button
          className="poll-submit-btn"
          onClick={handleSubmit}
          disabled={submitted || Object.keys(sessionVotes).length === 0}
          type="button"
        >
          Submit
        </button>
      </div>
      {submitted && (
        <>
          <div className="poll-section">
            <h3 className="poll-results-title">Results:</h3>
            {POLL_OPTIONS.map((option) => {
              const percent = totalVotes > 0 ? ((votes[option] || 0) / totalVotes * 100) : 0;
              const isWinner = winners.includes(option);
              return (
                <div key={option} className="poll-result">
                  <span className="poll-option-name {isWinner ? 'poll-winner' : losers.includes(option) ? 'poll-loser' : ''}">{option}:</span>
                  <span>{votes[option] || 0} votes</span>
                  <span> ({percent.toFixed(1)}%)</span>
                  <div className="poll-bar">
                    <div className="poll-bar-inner" style={{width: percent + '%'}}></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="poll-section">
            <p className="poll-thanks">Thank you for voting!</p>
            <button className="poll-refresh-btn" onClick={handleRefresh}>Refresh Poll</button>
            {/* Winner and Loser display */}
            {totalVotes > 0 && (
              <div className="poll-winner-loser">
                <p><strong>Winner{winners.length > 1 ? 's' : ''}:</strong> {winners.join(', ')}</p>
                <p><strong>Loser{losers.length > 1 ? 's' : ''}:</strong></p>
                <ul>
                  {losers.map(loser => (
                    <li key={loser}>{loser}: {votes[loser] || 0} votes</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 