const questions = [
  {
    question: "Who was the father of Shri Rama?",
    options: ["Dasharatha", "Janaka", "Sugriva", "Shantanu"],
    answer: "Dasharatha",
  },
  {
    question: "What is the name of Shri Rama's wife?",
    options: ["Draupadi", "Sita", "Tara", "Mandodari"],
    answer: "Sita",
  },
  {
    question: "How many years was Shri Rama exiled?",
    options: ["10", "12", "14", "16"],
    answer: "14",
  },
  {
    question: "Who went with Shri Rama into exile?",
    options: ["Bharata", "Lakshmana", "Shatrughna", "Vibhishana"],
    answer: "Lakshmana",
  },
  {
    question: "Who abducted Sita?",
    options: ["Ravana", "Kumbhakarna", "Vali", "Meghnad"],
    answer: "Ravana",
  },
  {
    question: "Who is regarded as Shri Rama's greatest devotee?",
    options: ["Hanuman", "Jambavan", "Angada", "Sugriva"],
    answer: "Hanuman",
  },
  {
    question: "In which city did Shri Rama rule after exile?",
    options: ["Mithila", "Ayodhya", "Mathura", "Kashi"],
    answer: "Ayodhya",
  },
  {
    question: "What is the name of the epic of Shri Rama's life?",
    options: ["Mahabharata", "Ramayana", "Bhagavata", "Vedas"],
    answer: "Ramayana",
  },
  {
    question: "Who wrote the Sanskrit Ramayana?",
    options: ["Valmiki", "Tulsidas", "Vyasa", "Kalidasa"],
    answer: "Valmiki",
  },
  {
    question: "Who helped build the bridge to Lanka?",
    options: ["Vanara Sena", "Pandavas", "Kauravas", "Yadavas"],
    answer: "Vanara Sena",
  },
];

const LEADERBOARD_KEY = "shri-rama-quiz-leaderboard-v2";

const startCard = document.getElementById("start-card");
const quizCard = document.getElementById("quiz-card");
const resultCard = document.getElementById("result-card");
const playerNameInput = document.getElementById("player-name");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options");
const progressText = document.getElementById("progress");
const timerText = document.getElementById("timer");
const leaderboardList = document.getElementById("leaderboard-list");
const resultText = document.getElementById("result-text");

const startBtn = document.getElementById("start-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const submitBtn = document.getElementById("submit-btn");
const restartBtn = document.getElementById("restart-btn");
const clearBtn = document.getElementById("clear-btn");

let currentIndex = 0;
let playerName = "";
let answers = [];
let seconds = 0;
let timerId = null;

function shuffle(array) {
  const cloned = [...array];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

let quizQuestions = shuffle(questions);

function startTimer() {
  stopTimer();
  timerId = setInterval(() => {
    seconds += 1;
    timerText.textContent = `Time: ${seconds}s`;
  }, 1000);
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function renderQuestion() {
  const current = quizQuestions[currentIndex];
  progressText.textContent = `Question ${currentIndex + 1} of ${quizQuestions.length}`;
  questionText.textContent = current.question;
  optionsContainer.innerHTML = "";

  current.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-btn";
    button.textContent = option;

    if (answers[currentIndex] === option) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      answers[currentIndex] = option;
      renderQuestion();
    });

    optionsContainer.appendChild(button);
  });

  prevBtn.disabled = currentIndex === 0;
  const lastQuestion = currentIndex === quizQuestions.length - 1;
  nextBtn.classList.toggle("hidden", lastQuestion);
  submitBtn.classList.toggle("hidden", !lastQuestion);
}

function calculateScore() {
  return quizQuestions.reduce((acc, q, idx) => {
    if (answers[idx] === q.answer) {
      return acc + 1;
    }
    return acc;
  }, 0);
}

function getLeaderboard() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LEADERBOARD_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function saveLeaderboard(entries) {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
}

function renderLeaderboard() {
  const entries = getLeaderboard();
  leaderboardList.innerHTML = "";

  if (entries.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No players yet. Start the challenge!";
    leaderboardList.appendChild(item);
    return;
  }

  entries.forEach((entry, index) => {
    const item = document.createElement("li");
    item.textContent = `#${index + 1} ${entry.name} - ${entry.score}/${questions.length} in ${entry.seconds}s`;
    leaderboardList.appendChild(item);
  });
}

function addToLeaderboard(entry) {
  const entries = getLeaderboard();
  entries.push(entry);
  entries.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.seconds - b.seconds;
  });
  saveLeaderboard(entries.slice(0, 10));
  renderLeaderboard();
}

function startQuiz() {
  const rawName = playerNameInput.value.trim();
  if (!rawName) {
    alert("Please enter your name to start.");
    return;
  }

  playerName = rawName.slice(0, 20);
  currentIndex = 0;
  seconds = 0;
  answers = new Array(questions.length).fill(null);
  quizQuestions = shuffle(questions);

  timerText.textContent = "Time: 0s";
  startCard.classList.add("hidden");
  resultCard.classList.add("hidden");
  quizCard.classList.remove("hidden");

  renderQuestion();
  startTimer();
}

function submitQuiz() {
  if (answers.includes(null)) {
    alert("Please answer every question before submitting.");
    return;
  }

  stopTimer();
  const score = calculateScore();

  addToLeaderboard({
    name: playerName,
    score,
    seconds,
  });

  quizCard.classList.add("hidden");
  resultCard.classList.remove("hidden");
  resultText.textContent = `${playerName}, you scored ${score}/${questions.length} in ${seconds} seconds.`;
}

function playAgain() {
  playerNameInput.value = playerName;
  startCard.classList.remove("hidden");
  resultCard.classList.add("hidden");
}

startBtn.addEventListener("click", startQuiz);

playerNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    startQuiz();
  }
});

prevBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex -= 1;
    renderQuestion();
  }
});

nextBtn.addEventListener("click", () => {
  if (answers[currentIndex] === null) {
    alert("Pick an option before moving to the next question.");
    return;
  }
  if (currentIndex < quizQuestions.length - 1) {
    currentIndex += 1;
    renderQuestion();
  }
});

submitBtn.addEventListener("click", submitQuiz);
restartBtn.addEventListener("click", playAgain);

clearBtn.addEventListener("click", () => {
  const ok = confirm("Clear all leaderboard entries?");
  if (ok) {
    saveLeaderboard([]);
    renderLeaderboard();
  }
});

renderLeaderboard();
