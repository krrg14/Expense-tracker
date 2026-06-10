let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let summaryCategoryChartObj;

const colors = {
    Food: "#4CAF50",
    Transport: "#FF9800",
    Shopping: "#F44336",
    Bills: "#2196F3",
    Entertainment: "#9C27B0"
};

/* ADD EXPENSE */
function addExpense() {
    if (!desc.value || amount.value <= 0 || !date.value) {
        alert("Fill all fields");
        return;
    }
    expenses.push({
        desc: desc.value,
        amt: +amount.value,
        cat: category.value,
        dateVal: date.value
    });
    localStorage.setItem("expenses", JSON.stringify(expenses));
    alert("Expense Added");
}

/* RECORDS */
if (document.getElementById("list")) {
    expenses.forEach((e, i) => {
        list.innerHTML += `
        <tr>
            <td>${e.desc}</td>
            <td>₹${e.amt}</td>
            <td>${e.cat}</td>
            <td>${e.dateVal}</td>
            <td><button onclick="removeExpense(${i})">Delete</button></td>
        </tr>`;
    });
}

function removeExpense(i) {
    expenses.splice(i, 1);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    location.reload();
}

/* SUMMARY */
function updateSummaryUI() {
    dayInput.style.display = "none";
    monthInput.style.display = "none";
    yearInput.style.display = "none";

    if (summaryType.value === "day") dayInput.style.display = "block";
    if (summaryType.value === "month") monthInput.style.display = "block";
    if (summaryType.value === "year") yearInput.style.display = "block";
}

function generateSummary() {
    calculateSummary();
}

function calculateSummary() {
    let filtered = [];

    if (summaryType.value === "day") {
        filtered = expenses.filter(e => e.dateVal === dayInput.value);
        selectedLabel.innerText = dayInput.value;
    }
    if (summaryType.value === "month") {
        filtered = expenses.filter(e => e.dateVal.startsWith(monthInput.value));
        selectedLabel.innerText = monthInput.value;
    }
    if (summaryType.value === "year") {
        filtered = expenses.filter(e => e.dateVal.startsWith(yearInput.value));
        selectedLabel.innerText = yearInput.value;
    }

    let sum = 0;
    generatedTable.innerHTML = "";

    filtered.forEach(e => {
        sum += e.amt;
        generatedTable.innerHTML += `
        <tr>
            <td>${e.dateVal}</td>
            <td>${e.cat}</td>
            <td>₹${e.amt}</td>
        </tr>`;
    });

    total.innerText = sum;
    grandTotal.innerText = sum;

    drawCategorySummaryChart(filtered);
}

function drawCategorySummaryChart(filtered) {

    let totals = {}, sum = 0;

    filtered.forEach(e => {
        totals[e.cat] = (totals[e.cat] || 0) + e.amt;
        sum += e.amt;
    });

    summaryLegend.innerHTML = "";
    summaryTotal.innerText = "₹" + sum;

    const labels = Object.keys(totals);
    const data = Object.values(totals);

    labels.forEach((cat, i) => {
        summaryLegend.innerHTML += `
        <div class="legend-row">
            <div style="display:flex;gap:8px">
                <div class="legend-color" style="background:${colors[cat]}"></div>
                ${cat}
            </div>
            <div>${((data[i] / sum) * 100).toFixed(0)}% ₹${data[i]}</div>
        </div>`;
    });

    const ctx = document
        .getElementById("summaryCategoryChart")
        .getContext("2d");

    if (summaryCategoryChartObj) {
        summaryCategoryChartObj.destroy();
    }

    summaryCategoryChartObj = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: labels.map(l => colors[l])
            }]
        },
        options: {
            cutout: "65%",
            plugins: { legend: { display: false } },
            animation: {
                animateRotate: true,
                duration: 1200
            },
            onClick(e, el) {
                if (el.length) {
                    const i = el[0].index;
                    summaryCenter.querySelector(".center-cat").innerText = labels[i];
                    summaryCenter.querySelector(".center-amt").innerText = "₹" + data[i];
                    summaryCenter.querySelector(".center-per").innerText =
                        ((data[i] / sum) * 100).toFixed(2) + "%";
                }
            }
        }
    });
}


function printSummary() {
    window.print();
}
