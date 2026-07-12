// ============================
// CONSTANTS
// ============================
const STORAGE_KEY = "dsaTrackerProgress";

// ============================
// APP STATE
// ============================
// One object holds everything the UI depends on.
// solvedProblems  -> ids of problems the user has checked off
// searchText      -> current text typed in the search box
// difficulty      -> current difficulty filter ("All", "Easy", "Medium", "Hard")
// collapsedTopics -> ids of topics the user has collapsed
const app = {
  solvedProblems: [],
  searchText: "",
  difficulty: "All",
  collapsedTopics: [],
};

// ============================
// DOM REFERENCES
// ============================
const totalCountEl = document.querySelector("#totalCount");
const solvedCountEl = document.querySelector("#solvedCount");
const remainingCountEl = document.querySelector("#remainingCount");
const percentCountEl = document.querySelector("#percentCount");

const progressTrack = document.querySelector("#progressTrack");
const progressFill = document.querySelector("#progressFill");

const searchInput = document.querySelector("#searchInput");
const difficultyFilters = document.querySelector("#difficultyFilters");

const topicsContainer = document.querySelector("#topicsContainer");
const emptyState = document.querySelector("#emptyState");

// ============================
// LOCALSTORAGE
// ============================

// Reads saved progress from the browser and loads it into app state.
// If nothing is saved yet, app.solvedProblems simply stays empty.
function loadProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    app.solvedProblems = JSON.parse(saved);
  }
}

// Saves the current list of solved problem ids to the browser.
function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(app.solvedProblems));
}

// ============================
// HELPER FUNCTIONS
// ============================

// Checks whether a given problem id has been marked solved.
function isSolved(problemId) {
  return app.solvedProblems.includes(problemId);
}

// Checks whether a given topic id is currently collapsed.
function isTopicCollapsed(topicId) {
  return app.collapsedTopics.includes(topicId);
}

// Decides if a single problem should be visible right now,
// based on the active search text and difficulty filter.
function shouldDisplayProblem(problem) {
  const matchesDifficulty =
    app.difficulty === "All" || problem.difficulty === app.difficulty;

  const matchesSearch = problem.title
    .toLowerCase()
    .includes(app.searchText.toLowerCase());

  return matchesDifficulty && matchesSearch;
}

// Counts total and solved problems inside one topic.
function getTopicStats(topic) {
  let solved = 0;
  for (const problem of topic.problems) {
    if (isSolved(problem.id)) {
      solved++;
    }
  }
  return { total: topic.problems.length, solved: solved };
}

// Counts total and solved problems across every topic,
// by reusing getTopicStats() for each one.
function getOverallStats() {
  let total = 0;
  let solved = 0;

  for (const topic of TOPICS) {
    const stats = getTopicStats(topic);
    total += stats.total;
    solved += stats.solved;
  }

  return { total, solved };
}

// ============================
// DASHBOARD FUNCTIONS
// ============================

// Updates the stat cards and the overall progress bar.
// This always reflects ALL problems, regardless of the current filter.
function updateDashboard() {
  const stats = getOverallStats();
  const remaining = stats.total - stats.solved;
  const percent =
    stats.total === 0 ? 0 : Math.round((stats.solved / stats.total) * 100);

  totalCountEl.textContent = stats.total;
  solvedCountEl.textContent = stats.solved;
  remainingCountEl.textContent = remaining;
  percentCountEl.textContent = `${percent}%`;

  progressFill.style.width = `${percent}%`;
  progressTrack.setAttribute("aria-valuenow", percent);
}

// ============================
// UI CREATION FUNCTIONS
// ============================

// Builds a small colored badge showing a problem's difficulty.
function createBadge(difficulty) {
  const badge = document.createElement("span");
  badge.className = `difficulty-badge ${difficulty.toLowerCase()}`;
  badge.textContent = difficulty;
  return badge;
}

// Builds one row for a single problem: checkbox, name, pattern tag, badge.
function createProblemRow(problem) {
  const row = document.createElement("div");
  row.className = "problem-row";
  if (isSolved(problem.id)) {
    row.classList.add("solved");
  }

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "problem-checkbox";
  checkbox.checked = isSolved(problem.id);
  checkbox.addEventListener("change", () => {
    toggleSolved(problem.id);
    refreshUI();
  });

  const name = document.createElement("span");
  name.className = "problem-name";
  name.textContent = problem.title;

  const pattern = document.createElement("span");
  pattern.className = "problem-pattern";
  pattern.textContent = problem.pattern;

  const badge = createBadge(problem.difficulty);

  row.appendChild(checkbox);
  row.appendChild(name);
  row.appendChild(pattern);
  row.appendChild(badge);

  return row;
}

// Builds one collapsible topic card, containing only the problems
// that currently pass the search/difficulty filter.
function createTopicCard(topic, visibleProblems) {
  const stats = getTopicStats(topic);
  const percent =
    stats.total === 0 ? 0 : Math.round((stats.solved / stats.total) * 100);

  const card = document.createElement("div");
  card.className = "topic-card";
  if (isTopicCollapsed(topic.id)) {
    card.classList.add("collapsed");
  }

  // ---- Header ----
  const header = document.createElement("button");
  header.className = "topic-header";
  header.addEventListener("click", () => {
    toggleTopicCollapse(topic.id);
  });

  const headerLeft = document.createElement("div");
  headerLeft.className = "topic-header-left";

  const number = document.createElement("span");
  number.className = "topic-number";
  number.textContent = topic.id;

  const title = document.createElement("span");
  title.className = "topic-title";
  title.textContent = topic.title;

  const count = document.createElement("span");
  count.className = "topic-count";
  count.textContent = `${stats.solved}/${stats.total} solved`;

  headerLeft.appendChild(number);
  headerLeft.appendChild(title);
  headerLeft.appendChild(count);

  const miniProgress = document.createElement("div");
  miniProgress.className = "topic-mini-progress";
  const miniProgressFill = document.createElement("div");
  miniProgressFill.className = "topic-mini-progress-fill";
  miniProgressFill.style.width = `${percent}%`;
  miniProgress.appendChild(miniProgressFill);

  const toggleIcon = document.createElement("span");
  toggleIcon.className = "topic-toggle-icon";
  toggleIcon.textContent = "▼";

  header.appendChild(headerLeft);
  header.appendChild(miniProgress);
  header.appendChild(toggleIcon);

  // ---- Body (problem rows) ----
  const body = document.createElement("div");
  body.className = "topic-body";
  for (const problem of visibleProblems) {
    const row = createProblemRow(problem);
    body.appendChild(row);
  }

  card.appendChild(header);
  card.appendChild(body);

  return card;
}

// ============================
// RENDERING FUNCTIONS
// ============================

// Rebuilds the entire topics list from scratch based on current app state.
// With ~156 problems, re-rendering everything on each change is simple
// and fast enough, so there's no need for partial DOM updates.
function renderTopics() {
  topicsContainer.innerHTML = "";
  let topicsShown = 0;

  for (const topic of TOPICS) {
    const visibleProblems = topic.problems.filter(shouldDisplayProblem);

    if (visibleProblems.length === 0) {
      continue;
    }

    const card = createTopicCard(topic, visibleProblems);
    topicsContainer.appendChild(card);
    topicsShown++;
  }

  emptyState.hidden = topicsShown > 0;
}

// Re-renders the topic list and refreshes the dashboard together.
// Used whenever solved status changes, since both are affected.
function refreshUI() {
  renderTopics();
  updateDashboard();
}

// ============================
// EVENT HANDLERS
// ============================

// Flips a problem between solved and not solved, then saves progress.
function toggleSolved(problemId) {
  if (isSolved(problemId)) {
    const index = app.solvedProblems.indexOf(problemId);
    app.solvedProblems.splice(index, 1);
  } else {
    app.solvedProblems.push(problemId);
  }
  saveProgress();
}

// Expands or collapses a topic card.
function toggleTopicCollapse(topicId) {
  if (isTopicCollapsed(topicId)) {
    const index = app.collapsedTopics.indexOf(topicId);
    app.collapsedTopics.splice(index, 1);
  } else {
    app.collapsedTopics.push(topicId);
  }
  renderTopics();
}

// Updates search text in state and re-renders the filtered list.
// The dashboard is untouched here since search never changes solved counts.
function handleSearchInput(event) {
  app.searchText = event.target.value;
  renderTopics();
}

// Updates the active difficulty filter and re-renders the filtered list.
function handleDifficultyClick(event) {
  const clickedButton = event.target;
  if (!clickedButton.classList.contains("filter-btn")) {
    return;
  }

  app.difficulty = clickedButton.dataset.difficulty;

  const allButtons = difficultyFilters.querySelectorAll(".filter-btn");
  for (const button of allButtons) {
    button.classList.remove("active");
  }
  clickedButton.classList.add("active");

  renderTopics();
}

// ============================
// INITIALIZATION
// ============================
function init() {
  loadProgress();
  refreshUI();

  searchInput.addEventListener("input", handleSearchInput);
  difficultyFilters.addEventListener("click", handleDifficultyClick);
}

init();
