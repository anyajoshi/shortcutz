import React, { useState, useEffect, useRef } from "react";

// Utility functions
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Question generation logic based on selected topics
const generateQuestion = (level, topics) => {
  const range = level * 5;
  const a = getRandomInt(-range, range); // Allow negative values for all operations
  const b = getRandomInt(-range, range); // Allow negative values for all operations
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  
  let question, answer;

  switch (randomTopic) {
    case "addition":
      question = `${a} + ${b}`;
      answer = a + b;
      break;
    case "subtraction":
      question = `${a} - ${b}`;
      answer = a - b;
      break;
    case "multiplication":
      question = `${a} × ${b}`;
      answer = a * b;
      break;
    case "division":
      // Avoid division by zero and ensure the quotient is correct
      const divisor = b === 0 ? 1 : b;
      question = `${a * divisor} ÷ ${divisor}`;
      answer = a;
      break;
    default:
      question = `${a} + ${b}`;
      answer = a + b;
      break;
  }

  return { question, answer, topic: randomTopic };
};

const getExplanation = (question, answer) => {
  const [left, op, right] = question.split(" ");
  const a = parseInt(left);
  const b = parseInt(right);
  let tip = "";

  switch (op) {
    case "+":
      tip = "Add the numbers together.";
      break;
    case "-":
      tip = "Subtract the second number from the first.";
      break;
    case "*":
      tip = "Multiply the two numbers together.";
      break;
    case "÷":
      tip = "Divide the first number by the second.";
      break;
    default:
      tip = "Follow the appropriate math operation.";
  }

  return {
    tip,
    explanation: `${left} ${op} ${right} = ${answer}.\n${tip}`,
  };
};

function calculateNextLevel(history) {
  const recent = history.slice(-5);
  const correctRatio = recent.filter((h) => h.correct).length / recent.length;
  const avgTime = recent.reduce((sum, h) => sum + h.timeTaken, 0) / recent.length;

  if (correctRatio >= 0.8 && avgTime < 10) {
    return Math.min(history.at(-1).level + 1, 10);
  } else if (correctRatio < 0.5 || avgTime > 20) {
    return Math.max(history.at(-1).level - 1, 1);
  } else {
    return history.at(-1).level;
  }
}

// Simple AI Feedback function
const getAIFeedback = (question, isCorrect) => {
  if (isCorrect) {
    return "Great job! You're on the right track!";
  } else {
    return "Oops! Try again. Remember to double-check your math!";
  }
};

export default function AdaptiveMathApp() {
  const [level, setLevel] = useState(1);
  const [questionObj, setQuestionObj] = useState({});
  const [userAnswer, setUserAnswer] = useState("");
  const [history, setHistory] = useState([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [topics, setTopics] = useState({
    addition: false,
    subtraction: false,
    multiplication: false,
    division: false,
  });
  const [currentPage, setCurrentPage] = useState("home"); // Track current page (home or practice)
  const [isStarted, setIsStarted] = useState(false); // To track if the user has selected topics

  const containerRef = useRef(null);
  const currentTileRef = useRef(null);

  const handleSubmit = async () => {
    const numericAnswer = parseFloat(userAnswer);
    const correct = numericAnswer === questionObj.answer;
    const timeTaken = (Date.now() - startTime) / 1000;

    const newFeedback = {
      question: questionObj.question,
      correct,
      answer: questionObj.answer,
      level,
      timeTaken,
      aiFeedback: null, // Will be filled on button click
      ...getExplanation(questionObj.question, questionObj.answer),
    };

    const newHistory = [...history, newFeedback];
    setHistory(newHistory);

    const nextLevel = calculateNextLevel(newHistory);
    setLevel(nextLevel);

    setUserAnswer("");
    setQuestionObj(generateQuestion(nextLevel, Object.keys(topics).filter((topic) => topics[topic]))); // Generate question based on selected topics
    setStartTime(Date.now());
  };

  useEffect(() => {
    if (currentTileRef.current && containerRef.current) {
      currentTileRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [history]);

  const accuracy = history.length
    ? (history.filter((h) => h.correct).length / history.length) * 100
    : 0;

  const handleTopicSelection = (event) => {
    setTopics((prev) => ({
      ...prev,
      [event.target.name]: event.target.checked,
    }));
  };

  const handleStart = () => {
    if (Object.values(topics).includes(true)) {
      setCurrentPage("practice"); // Navigate to practice page
      setIsStarted(true); // Start the question flow if at least one topic is selected
      setQuestionObj(generateQuestion(level, Object.keys(topics).filter((topic) => topics[topic]))); // Generate first question based on selected topics
    } else {
      alert("Please select at least one topic to start!");
    }
  };

  const handleBackToHome = () => {
    setCurrentPage("home"); // Navigate back to the home page
    setTopics({
      addition: false,
      subtraction: false,
      multiplication: false,
      division: false,
    });
    setIsStarted(false);
    setHistory([]);
    setUserAnswer("");
  };

  if (currentPage === "home") {
    // Display topic selection screen
    return (
      <div style={{ textAlign: "center", padding: "50px", fontFamily: "sans-serif" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>Select Topics to Practice</h1>
        
        {/* Topic checkboxes */}
        <div>
          <label>
            <input
              type="checkbox"
              name="addition"
              checked={topics.addition}
              onChange={handleTopicSelection}
            />
            Addition
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              name="subtraction"
              checked={topics.subtraction}
              onChange={handleTopicSelection}
            />
            Subtraction
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              name="multiplication"
              checked={topics.multiplication}
              onChange={handleTopicSelection}
            />
            Multiplication
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              name="division"
              checked={topics.division}
              onChange={handleTopicSelection}
            />
            Division
          </label>
        </div>

        <button
          onClick={handleStart}
          style={{
            marginTop: "20px",
            padding: "0.6rem 1.2rem",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Start Practice
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "row", padding: "20px", fontFamily: "sans-serif" }}>
      {/* Left Column */}
      <div style={{ flex: 1, marginRight: "20px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>Adaptive Math Practice</h1>

        <div style={{ marginBottom: "1rem" }}>
          <p>Accuracy: {Math.round(accuracy)}%</p>
          <div style={{ height: "10px", background: "#eee", borderRadius: "5px" }}>
            <div
              style={{
                width: `${accuracy}%`,
                background: "#4caf50",
                height: "100%",
                borderRadius: "5px",
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>

        <div ref={containerRef} style={{ maxHeight: "400px", overflowY: "auto", marginBottom: "1rem" }}>
          {history.map((entry, index) => (
            <div
              key={index}
              ref={index === history.length - 1 ? currentTileRef : null}
              style={{
                background: entry.correct ? "#d4edda" : "#f8d7da",
                padding: "1rem",
                borderRadius: "10px",
                marginBottom: "10px",
                border: "1px solid #ccc",
              }}
            >
              <strong>{entry.correct ? "✅ Correct" : "❌ Incorrect"}</strong>
              <p style={{ margin: "0.5rem 0" }}>{entry.question}</p>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{entry.explanation}</pre>
              <small>Time: {entry.timeTaken.toFixed(1)}s | Level: {entry.level}</small>

              {!entry.aiFeedback && (
                <button
                  onClick={async () => {
                    const feedback = await getAIFeedback(entry.question, entry.correct);
                    setHistory((prevHistory) => {
                      const updated = [...prevHistory];
                      updated[index] = { ...updated[index], aiFeedback: feedback };
                      return updated;
                    });
                  }}
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.4rem 0.8rem",
                    background: "#6c63ff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Get AI Feedback
                </button>
              )}

              {entry.aiFeedback && (
                <div style={{ marginTop: "0.5rem", fontStyle: "italic", color: "#555" }}>{entry.aiFeedback}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Column */}
      <div style={{ flex: 1 }}>
        <div style={{ border: "1px solid #ccc", borderRadius: "10px", padding: "1rem", marginBottom: "1rem" }}>
          <p style={{ fontSize: "1.2rem", fontWeight: "600" }}>Question:</p>
          <p style={{ fontSize: "1.5rem", margin: "1rem 0" }}>{questionObj.question}</p>
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Your answer"
            style={{ padding: "0.5rem", width: "100%", marginBottom: "1rem" }}
          />
          <button
            onClick={handleSubmit}
            style={{
              padding: "0.6rem 1.2rem",
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Submit
          </button>
        </div>

        <button
          onClick={handleBackToHome}
          style={{
            padding: "0.6rem 1.2rem",
            background: "#ccc",
            color: "#000",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            width: "100%",
            marginTop: "20px",
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
