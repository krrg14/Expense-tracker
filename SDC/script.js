const API_URL = "/api/expenses";
const AUTH_TOKEN_KEY = "expenzo_token";
const AUTH_USER_KEY = "expenzo_user";
const DEMO_USER = {
    username: "demo",
    password: "demo123",
    role: "demo"
};
let expenses = [];
let summaryCategoryChartObj;

const colors = {
    Food: "#4CAF50",
    Transport: "#FF9800",
    Shopping: "#F44336",
    Bills: "#2196F3",
    Entertainment: "#9C27B0"
};

function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(value || 0);
}

function saveAuthSession(token, user) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function clearAuthSession() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || 'null');
    } catch {
        return null;
    }
}

function isAuthenticated() {
    return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
}

function requireLogin() {
    if (!isAuthenticated()) {
        window.location.replace("login.html");
        return false;
    }
    return true;
}

function authHeaders(extra = {}) {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra
    };
}

async function apiFetch(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: authHeaders(options.headers)
    });

    if (response.status === 401) {
        const currentToken = localStorage.getItem(AUTH_TOKEN_KEY);

        if (currentToken === "demo-token") {
            throw new Error("Demo session is using local fallback data.");
        }

        clearAuthSession();
        window.location.replace("login.html");
        throw new Error("Session expired.");
    }

    return response;
}

async function loadExpenses() {
    if (!requireLogin()) return [];
    try {
        const response = await apiFetch(API_URL);
        if (!response.ok) throw new Error("Backend unavailable");
        expenses = await response.json();
        localStorage.setItem("expenses", JSON.stringify(expenses));
        return expenses;
    } catch (error) {
        expenses = JSON.parse(localStorage.getItem("expenses")) || [];
        return expenses;
    }
}

function resetForm() {
    if (typeof desc !== "undefined") desc.value = "";
    if (typeof amount !== "undefined") amount.value = "";
    if (typeof category !== "undefined") category.value = "Food";
    if (typeof date !== "undefined") date.value = "";
}

async function addExpense() {
    if (!requireLogin()) return;
    if (!desc || !amount || !date) return;
    if (!desc.value || amount.value <= 0 || !date.value) {
        alert("Please complete all fields before saving.");
        return;
    }

    const expense = {
        desc: desc.value.trim(),
        amt: Number(amount.value),
        cat: category.value,
        dateVal: date.value
    };

    try {
        const response = await apiFetch(API_URL, {
            method: "POST",
            body: JSON.stringify(expense)
        });
        if (!response.ok) throw new Error("Unable to save record");

        await loadExpenses();
        alert("Expense added successfully.");
        resetForm();
        if (document.getElementById("list")) renderRecords();
    } catch (error) {
        const storedExpenses = JSON.parse(localStorage.getItem("expenses") || "[]");
        const existingExpenses = Array.isArray(storedExpenses) ? storedExpenses : [];
        const localExpense = {
            ...expense,
            id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        };

        expenses = [...existingExpenses, localExpense];
        localStorage.setItem("expenses", JSON.stringify(expenses));
        alert("Expense saved successfully on this device.");
        resetForm();
        if (document.getElementById("list")) renderRecords();
    }
}

function renderRecords() {
    const tableBody = document.getElementById("list");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (!expenses.length) {
        tableBody.innerHTML = '<tr><td colspan="5">No expenses yet. Add your first expense to get started.</td></tr>';
        return;
    }

    expenses.forEach((expense, index) => {
        const id = expense.id ?? index;
        tableBody.innerHTML += `
        <tr>
            <td>${expense.desc}</td>
            <td>${formatCurrency(expense.amt)}</td>
            <td>${expense.cat}</td>
            <td>${expense.dateVal}</td>
            <td><button class="secondary" onclick="removeExpense(${JSON.stringify(id)})">Delete</button></td>
        </tr>`;
    });
}

async function removeExpense(id) {
    if (!requireLogin()) return;
    const confirmed = confirm("Remove this expense?");
    if (!confirmed) return;

    try {
        const response = await apiFetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Delete failed");
        await loadExpenses();
    } catch (error) {
        const index = expenses.findIndex(exp => String(exp.id ?? expenses.indexOf(exp)) === String(id));
        if (index !== -1) {
            expenses.splice(index, 1);
            localStorage.setItem("expenses", JSON.stringify(expenses));
        }
    }

    renderRecords();
}

async function initRecordsPage() {
    if (!requireLogin()) return;
    await loadExpenses();
    renderRecords();
}

if (document.getElementById("list")) {
    initRecordsPage();
}

function updateSummaryUI() {
    if (!window.summaryType) return;

    dayInput.style.display = "none";
    monthInput.style.display = "none";
    yearInput.style.display = "none";

    if (summaryType.value === "day") dayInput.style.display = "block";
    if (summaryType.value === "month") monthInput.style.display = "block";
    if (summaryType.value === "year") yearInput.style.display = "block";
}

async function initSummaryPage() {
    if (!requireLogin()) return;
    await loadExpenses();
    updateSummaryUI();
    calculateSummary();
}

if (document.getElementById("summaryType")) {
    initSummaryPage();
}

function generateSummary() {
    if (!requireLogin()) return;
    calculateSummary();
}

function calculateSummary() {
    if (!expenses) return;

    let filtered = [...expenses];

    if (summaryType && summaryType.value === "day") {
        filtered = expenses.filter(e => e.dateVal === dayInput.value);
        selectedLabel.innerText = dayInput.value || "Select a day";
    } else if (summaryType && summaryType.value === "month") {
        filtered = expenses.filter(e => e.dateVal.startsWith(monthInput.value));
        selectedLabel.innerText = monthInput.value || "Select a month";
    } else if (summaryType && summaryType.value === "year") {
        filtered = expenses.filter(e => e.dateVal.startsWith(yearInput.value));
        selectedLabel.innerText = yearInput.value || "Select a year";
    } else {
        selectedLabel.innerText = "All records";
    }

    let sum = 0;
    if (generatedTable) generatedTable.innerHTML = "";

    filtered.forEach(e => {
        sum += Number(e.amt) || 0;
        if (generatedTable) {
            generatedTable.innerHTML += `
            <tr>
                <td>${e.dateVal}</td>
                <td>${e.cat}</td>
                <td>${formatCurrency(e.amt)}</td>
            </tr>`;
        }
    });

    if (total) total.innerText = formatCurrency(sum);
    if (grandTotal) grandTotal.innerText = formatCurrency(sum);

    drawCategorySummaryChart(filtered);
}

function drawCategorySummaryChart(filtered) {
    if (!summaryLegend || !summaryTotal) return;

    let totals = {};
    let sum = 0;

    filtered.forEach(e => {
        totals[e.cat] = (totals[e.cat] || 0) + (Number(e.amt) || 0);
        sum += Number(e.amt) || 0;
    });

    summaryLegend.innerHTML = "";
    summaryTotal.innerText = formatCurrency(sum);

    const labels = Object.keys(totals);
    const totalLabel = sum > 0 ? formatCurrency(sum) : "₹0";

    if (summaryCenter) {
        summaryCenter.querySelector(".center-amt").innerText = totalLabel;
    }

    const selectedCategoryLabel = document.getElementById("selectedCategoryLabel");
    if (selectedCategoryLabel) {
        selectedCategoryLabel.innerText = labels.length
            ? "Total amount shown in the center. Click a slice to view that category outside the chart."
            : "No expense data available for this period.";
    }
    const data = Object.values(totals);

    labels.forEach((cat, i) => {
        summaryLegend.innerHTML += `
        <div class="legend-row">
            <div class="legend-label">
                <div class="legend-color" style="background:${colors[cat] || "#8b5cf6"}"></div>
                ${cat}
            </div>
            <div>${((data[i] / sum) * 100).toFixed(0)}% · ${formatCurrency(data[i])}</div>
        </div>`;
    });

    const chartCanvas = document.getElementById("summaryCategoryChart");
    if (!chartCanvas) return;

    const ctx = chartCanvas.getContext("2d");

    if (summaryCategoryChartObj) {
        summaryCategoryChartObj.destroy();
    }

    summaryCategoryChartObj = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: labels.map(l => colors[l] || "#8b5cf6")
            }]
        },
        options: {
            cutout: "65%",
            plugins: { legend: { display: false } },
            animation: { animateRotate: true, duration: 1200 },
            onClick(e, el) {
                const selectedCategoryLabel = document.getElementById("selectedCategoryLabel");

                if (el.length) {
                    const i = el[0].index;
                    const categoryName = labels[i];
                    const categoryTotal = data[i];
                    const categoryPercent = ((categoryTotal / sum) * 100).toFixed(0);

                    if (selectedCategoryLabel) {
                        selectedCategoryLabel.innerText = `${categoryName}: ${formatCurrency(categoryTotal)} (${categoryPercent}% of total)`;
                    }

                    // Keep the center fixed on the total amount only.
                    summaryCenter.querySelector(".center-amt").innerText = formatCurrency(sum);
                } else {
                    if (selectedCategoryLabel) {
                        selectedCategoryLabel.innerText = "Total amount shown in the center. Click a slice to view that category outside the chart.";
                    }
                    summaryCenter.querySelector(".center-amt").innerText = formatCurrency(sum);
                }
            }
        }
    });
}

function printSummary() {
    window.print();
}

function updateAuthUI() {
    const user = getCurrentUser();
    const loginLink = document.getElementById('loginNavLink') || document.querySelector('nav a[href="login.html"]');
    const logoutLink = document.getElementById('logoutNavLink') || document.querySelector('nav a[data-action="logout"]');
    const profileBadge = document.getElementById('userProfileBadge');
    const profileName = document.getElementById('profileName');
    const profileStatus = document.getElementById('profileStatus');
    const profileAvatar = document.getElementById('profileAvatar');

    const isLoggedIn = isAuthenticated();

    if (loginLink) {
        loginLink.style.display = isLoggedIn ? 'none' : 'inline-block';
    }

    if (logoutLink) {
        logoutLink.style.display = isLoggedIn ? 'inline-flex' : 'none';
        logoutLink.setAttribute('aria-label', isLoggedIn ? 'Log out' : 'Log in');
    }

    if (profileBadge) {
        profileBadge.hidden = !isLoggedIn;
    }

    if (profileName) {
        const name = user?.username || 'User';
        profileName.textContent = name;
    }

    if (profileStatus) {
        profileStatus.textContent = user?.username ? user.username : 'User';
    }

    if (profileAvatar && user?.username) {
        const name = user.username;
        const initials = name
            .split(/\s+/)
            .map(part => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'U';
        profileAvatar.textContent = initials;
    }
}

function logout() {
    clearAuthSession();
    window.location.href = 'login.html';
}

function isDemoLogin(username, password) {
    return username === DEMO_USER.username && password === DEMO_USER.password;
}

async function handleAuthSubmit(event, type) {
    event.preventDefault();
    const message = document.getElementById('authMessage');
    const username = type === 'login' ? document.getElementById('loginUsername').value.trim() : document.getElementById('registerUsername').value.trim();
    const password = type === 'login' ? document.getElementById('loginPassword').value : document.getElementById('registerPassword').value;

    if (!username || !password) {
        if (message) message.textContent = 'Please enter both username and password.';
        return;
    }

    if (type === 'login' && isDemoLogin(username, password)) {
        const demoToken = 'demo-token';
        saveAuthSession(demoToken, { username: DEMO_USER.username });
        if (message) message.textContent = 'Welcome, demo! Redirecting...';
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`/api/auth/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Authentication failed.');

        saveAuthSession(data.token, data.user);
        if (message) message.textContent = `Welcome, ${data.user.username}! Redirecting...`;
        window.location.href = 'index.html';
    } catch (error) {
        if (message) {
            if (type === 'login' && isDemoLogin(username, password)) {
                saveAuthSession('demo-token', { username: DEMO_USER.username });
                message.textContent = 'Welcome, demo! Redirecting...';
                window.location.href = 'index.html';
                return;
            }
            message.textContent = error.message || 'Login failed. Please try again.';
        }
    }
}

function initAuthPage() {
    if (isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const registerSection = document.getElementById('registerSection');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => handleAuthSubmit(event, 'login'));
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (event) => handleAuthSubmit(event, 'register'));
    }

    if (showRegisterBtn && registerSection) {
        showRegisterBtn.addEventListener('click', () => {
            registerSection.hidden = false;
            registerSection.style.display = 'block';
            registerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

            const registerUsername = document.getElementById('registerUsername');
            if (registerUsername) {
                registerUsername.focus();
            }
        });
    }
}

if (document.getElementById('loginForm')) {
    initAuthPage();
}

if (window.location.pathname.endsWith('add.html') ||
    window.location.pathname.endsWith('records.html') ||
    window.location.pathname.endsWith('summary.html')) {
    if (!isAuthenticated()) {
        window.location.replace('login.html');
    }
}

window.addEventListener('load', updateAuthUI);
