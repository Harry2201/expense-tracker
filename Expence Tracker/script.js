// Authentication Handling
const authOverlay = document.getElementById("auth-overlay");
const authPinInput = document.getElementById("auth-pin");
// const authSubmit = document.getElementById("auth-submit");
const USER_PIN = "123456";

// <----------------------- Addes the click event listner to the authenticator button
// authSubmit.addEventListener("click", () => {
//   if (authPinInput.value === USER_PIN) {
//     authOverlay.style.display = "none";
//   } else {
//     alert("Invalid PIN. Try again.");
//   }
// });

// Dark Mode Toggle
const darkModeToggle = document.getElementById("dark-mode-toggle");
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// Multilanguage Support
const translations = {
  en: {
    welcome: "Welcome to Advanced Expense Tracker",
    addExpense: "Add Expense",
    totalExpenses: "Total Expenses",
    achievements: "Achievements",
  },
  es: {
    welcome: "Bienvenido al Rastreador de Gastos Avanzado",
    addExpense: "Añadir Gasto",
    totalExpenses: "Gastos Totales",
    achievements: "Logros",
  },
  fr: {
    welcome: "Bienvenue dans le Suivi des Dépenses Avancé",
    addExpense: "Ajouter une Dépense",
    totalExpenses: "Dépenses Totales",
    achievements: "Réalisations",
  },
};

const languageSelect = document.getElementById("language-select");
const languageChoose = document.getElementById("language-choose");
const dashboard = document.getElementById("dashboard");
languageSelect.addEventListener("change", (e) => {
  const lang = e.target.value;
  languageChoose.classList.add("float-right");
  document.body.classList.remove("initial-page");
  dashboard.classList.remove("display-none"); 
  initializeChart();
  document.querySelector("h1").textContent = translations[lang].welcome;
});

// Custom Categories
const expenseCategory = document.getElementById("expense-category");
const customCategories = ["Food", "Transport", "Shopping", "Bills", "Other"];

function populateCategories() {
  expenseCategory.innerHTML = customCategories
    .map((cat) => `<option value="${cat}">${cat}</option>`)
    .join("");
}
populateCategories();

// Add Custom Category
function addCustomCategory(category) {
  if (!customCategories.includes(category)) {
    customCategories.push(category);
    populateCategories();
  }
}

// Expense Data
let expenses = [];
const expenseForm = document.getElementById("expense-form");
const monthlyTotal = document.getElementById("monthly-total");
const recurringCheckbox = document.getElementById("recurring-expense");

// Add Expense
expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("expense-name").value.trim();
  const amount = parseFloat(document.getElementById("expense-amount").value);
  const category = expenseCategory.value;
  const recurring = recurringCheckbox.checked;

  if (!name || isNaN(amount) || !category) {
    alert("Please fill out all fields.");
    return;
  }

  const expense = { name, amount, category, recurring, date: new Date() };
  expenses.push(expense);
  updateSummary();
  updateCharts();
  checkAchievements();
  expenseForm.reset();
});

// Update Summary
function updateSummary() {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  monthlyTotal.textContent = total.toFixed(2);
}

// Charts
let expenseChart;

function initializeChart() {
  const ctx = document.getElementById("expense-chart").getContext("2d");
  expenseChart = new Chart(ctx, {
    type: "pie",
    data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
  });
}

// initializeChart();
// const ctx = document.getElementById("expense-chart").getContext("2d");
// expenseChart = new Chart(ctx, {
//   type: "pie",
//   data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
// });

function updateCharts() {
  const categoryTotals = {};
  expenses.forEach((exp) => {
    categoryTotals[exp.category] =
      (categoryTotals[exp.category] || 0) + exp.amount;
  });

  expenseChart.data.labels = Object.keys(categoryTotals);
  expenseChart.data.datasets[0].data = Object.values(categoryTotals);
  expenseChart.data.datasets[0].backgroundColor = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4CAF50",
    "#FF9800",
  ];
  expenseChart.update();
}

// Export Data
document.getElementById("download-summary").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(expenses)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "expenses.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Gamification
const achievements = document.getElementById("achievements");
let streak = 0;

function checkAchievements() {
  const today = new Date().toDateString();
  const todayExpenses = expenses.filter(
    (exp) => new Date(exp.date).toDateString() === today
  );
  if (todayExpenses.length > 0) streak++;
  else streak = 0;

  achievements.innerHTML = `
    <li>Expense Streak: ${streak} days</li>
    ${streak >= 5 ? "<li>Achievement Unlocked: 5-Day Streak!</li>" : ""}
  `;
}

// Voice Input
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript.toLowerCase();
  const amountMatch = transcript.match(/(\d+\.?\d*)/);
  const categoryMatch = customCategories.find((cat) =>
    transcript.includes(cat.toLowerCase())
  );

  if (amountMatch && categoryMatch) {
    const amount = parseFloat(amountMatch[0]);
    const category = categoryMatch;
    const expense = { name: "Voice Input", amount, category, date: new Date() };
    expenses.push(expense);
    updateSummary();
    updateCharts();
    checkAchievements();
    alert(`Added $${amount} to ${category}`);
  } else {
    alert("Could not understand input. Please try again.");
  }
};

document.addEventListener("keydown", (e) => {
  if (e.key === "v") {
    recognition.start();
    alert("Listening for voice input...");
  }
});

// Search and Filter
document
  .getElementById("expense-form-widget")
  .insertAdjacentHTML(
    "beforeend",
    `<input type="text" id="search-expense" placeholder="Search Expenses">`
  );

document.getElementById("search-expense").addEventListener("input", (e) => {
  const search = e.target.value.toLowerCase();
  const filtered = expenses.filter(
    (exp) =>
      exp.name.toLowerCase().includes(search) ||
      exp.category.toLowerCase().includes(search)
  );

  console.log("Filtered Expenses:", filtered); // Replace this with UI filtering.
});
