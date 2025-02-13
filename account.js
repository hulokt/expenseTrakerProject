let category, amount, date,
    totalExpenses = 0,
    currentBalance = 0,
    currentIncome = 0,
    xs = [], ys = [], expenses = [],
    chartInstanceType = 'bar',
    chartInstance,
    isDrawn = false,
    isMultipleDrawn = false,
    chartInstances = [],
    isDarkThemeActivated = false;

// Get references to DOM elements
const expensesTableBody = document.getElementById("expensesTableBody"),
      totalExpensesDisplay = document.getElementById('totalExpensesDisplay'),
      currentBalanceDisplay = document.getElementById('currentBalanceDisplay'),
      currentIncomeDisplay = document.getElementById("currentIncomeDisplay"),
      categorySelect = document.getElementById("categorySelect"),
      transactionDiv = document.getElementById("transactionDiv"),
      ctx = document.getElementById('chart'),
      dashboardBtn = document.getElementById("dashboardBtn"),
      transBtn = document.getElementById("transBtn"),
      pieBtn = document.getElementById("pieBtn"),
      barBtn = document.getElementById("barBtn"),
      scatterBtn = document.getElementById("scatterBtn"),
      lineBtn = document.getElementById("lineBtn"),
      allBtns = [transBtn, pieBtn, barBtn, scatterBtn, lineBtn, dashboardBtn],
      totalAmountTableDisplay = document.getElementById("totalAmount"),
      userNameDisplay = document.getElementById("userNameDisplay"),
      userName = localStorage.getItem('userName'),
      dashboardDiv = document.getElementById("dashboardDiv"),
      dashBoardIncomeDisplay = document.getElementById("dashBoardIncomeDisplay"),
      dashBoardExpensesDisplay = document.getElementById("dashBoardExpensesDisplay"),
      dashBoardBalanceDisplay = document.getElementById("dashBoardBalanceDisplay");

// Initialize the app
window.addEventListener("load", () => {
    loadData(); // Load data first
    showTransactionsPage();
    if (userName) {
        userNameDisplay.textContent = userName;
    } else {
        userNameDisplay.textContent = 'Guest';
    }
});

function toggleTheme() {
    isDarkThemeActivated = document.documentElement.classList.toggle('dark-theme');
    saveData();
}

function setActive(button) {
    allBtns.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
}

// Function to view the dashboard
function viewDashboard() {
    dashboardDiv.style.display = "grid";
    const charts = [document.getElementById("chart1"), document.getElementById("chart3"), document.getElementById("chart4")];
    transactionDiv.style.display = "none";
    ctx.style.display = "none";
    charts.forEach(chart => chart.style.display = "flex");

    if (isDrawn && !isMultipleDrawn && chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }

    const chartTypes = ["pie", "line", "bar"];
    chartInstances = charts.map((chart, index) => drawChart(chartTypes[index], chart));
    isMultipleDrawn = true;

    allBtns.slice(0, -1).forEach(b => b.addEventListener("click", () => {
        chartInstances.forEach(instance => instance.destroy());
        isMultipleDrawn = false;
        dashboardDiv.style.display = "none";
    }));
}

// Function to add an expense
function addExpense() {
    category = categorySelect.value;
    amount = parseFloat(document.getElementById("amountInput").value);
    date = document.getElementById('date-input').value;

    if (category && !isNaN(amount) && date) {
        const expense = { category, amount, date };
        expenses.push(expense);
        addExpenseRow(expense); // By default, updateTotals is true
        updateChartData();
        saveData();
        showSuccessAlert();
        document.getElementById("amountInput").value = '';
    } else {
        showErrorAlert();
    }
}

// Modified addExpenseRow function
function addExpenseRow(expense, updateTotals = true) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${expense.category}</td>
                    <td>${expense.amount.toFixed(2)}</td>
                    <td>${expense.date}</td>
                    <td style="display:flex; justify-content:center;">
                        <button class="deleteBtn">Delete</button>
                    </td>`;
    expensesTableBody.appendChild(tr);

    if (updateTotals) {
        totalExpenses += expense.amount;
        currentBalance -= expense.amount;
        totalExpensesDisplay.textContent = totalExpenses.toFixed(2);
        totalAmountTableDisplay.textContent = `$${totalExpensesDisplay.textContent}`;
        currentBalanceDisplay.textContent = currentBalance.toFixed(2);

        // Update dashboard displays
        dashBoardExpensesDisplay.textContent = `$${totalExpenses.toFixed(2)}`;
        dashBoardBalanceDisplay.textContent = `$${currentBalance.toFixed(2)}`;
    }

    tr.querySelector('.deleteBtn').addEventListener("click", function() {
        expensesTableBody.removeChild(tr);
        expenses.splice(expenses.indexOf(expense), 1);
        updateTotalsAfterDeletion();
        updateChartData();
        if (isDrawn && !isMultipleDrawn) {
            if (chartInstance) chartInstance.destroy();
            drawChart(chartInstanceType, ctx);
        }
        saveData();
    });
}

// Function to update totals after deletion
function updateTotalsAfterDeletion() {
    // Recalculate totalExpenses
    totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    // Recalculate currentBalance
    currentBalance = currentIncome - totalExpenses;
    // Update displays
    totalExpensesDisplay.textContent = totalExpenses.toFixed(2);
    totalAmountTableDisplay.textContent = `$${totalExpensesDisplay.textContent}`;
    currentBalanceDisplay.textContent = currentBalance.toFixed(2);

    // Update dashboard displays
    dashBoardExpensesDisplay.textContent = `$${totalExpenses.toFixed(2)}`;
    dashBoardBalanceDisplay.textContent = `$${currentBalance.toFixed(2)}`;
}

// Function to update chart data
function updateChartData() {
    xs = expenses.map(exp => exp.category);
    ys = expenses.map(exp => exp.amount);
}

// Function to add a new category
function addNewCategory() {
    const overlay = document.getElementById("addCategoryModal"),
          saveCategoryBtn = document.getElementById("saveCategoryBtn"),
          closeBtn = document.getElementById("closeCategorySelectBtn");

    // Remove existing event listeners to prevent multiple attachments
    saveCategoryBtn.replaceWith(saveCategoryBtn.cloneNode(true));
    closeBtn.replaceWith(closeBtn.cloneNode(true));

    const newSaveCategoryBtn = document.getElementById("saveCategoryBtn");
    const newCloseBtn = document.getElementById("closeCategorySelectBtn");

    newCloseBtn.addEventListener("click", () => {
        overlay.style.display = "none";
        document.body.classList.remove("modal-open");
    });

    newSaveCategoryBtn.addEventListener("click", () => {
        const categoryValue = document.getElementById("CategoryInput").value;
        if (categoryValue) {
            let newOption = document.createElement("option");
            newOption.value = categoryValue;
            newOption.innerHTML = categoryValue;
            categorySelect.appendChild(newOption);
            categorySelect.value = categoryValue;
            overlay.style.display = "none";
            document.body.classList.remove("modal-open");
            saveData();
        } else {
            alert("Please type in a valid category");
        }
    });

    overlay.style.display = "flex";
    document.body.classList.add("modal-open");
}

// Function to edit income
function editIncome() {
    const incomeModal = document.getElementById("incomeModal"),
          saveIncomeBtn = document.getElementById("saveIncome"),
          closeBtn = incomeModal.querySelector(".close");

    incomeModal.style.display = "block";
    document.body.classList.add("modal-open");

    // Remove existing event listeners to prevent multiple attachments
    saveIncomeBtn.replaceWith(saveIncomeBtn.cloneNode(true));
    closeBtn.replaceWith(closeBtn.cloneNode(true));

    const newSaveIncomeBtn = document.getElementById("saveIncome");
    const newCloseBtn = incomeModal.querySelector(".close");

    newCloseBtn.onclick = function() {
        incomeModal.style.display = "none";
        document.body.classList.remove("modal-open");
    };

    newSaveIncomeBtn.addEventListener("click", () => {
        const incomeValue = parseFloat(document.getElementById("incomeInput").value);
        if (!isNaN(incomeValue)) {
            currentIncome = incomeValue;
            currentIncomeDisplay.textContent = `$${currentIncome.toFixed(2)}`;
            currentBalance = currentIncome - totalExpenses;
            currentBalanceDisplay.textContent = currentBalance.toFixed(2);

            // Update dashboard displays
            dashBoardIncomeDisplay.textContent = `$${currentIncome.toFixed(2)}`;
            dashBoardBalanceDisplay.textContent = `$${currentBalance.toFixed(2)}`;

            incomeModal.style.display = "none";
            document.body.classList.remove("modal-open");
            saveData();
        } else {
            alert("Please enter a valid income amount");
        }
    });
}

// Function to show the transactions page
function showTransactionsPage() {
    transactionDiv.style.display = "block";
    ctx.style.display = "none";
    allBtns.forEach((btn) => btn.classList.remove("active"));
    transBtn.classList.add("active");
   
}

// Function to draw a chart
const drawChart = (type, canvasName) => {
    if (!canvasName) return console.error("Canvas element is undefined.");
    const existingChart = Chart.getChart(canvasName);
    if (existingChart) existingChart.destroy();

    return new Chart(canvasName, {
        type,
        data: {
            labels: xs,
            datasets: [{
                label: 'Expenses',
                data: ys,
                borderWidth: 1,
                ...(type === 'line' && { tension: 0.4 }), // Add tension for curved lines
            }],
        },
        options: {
            scales: {
                y: { beginAtZero: true },
            },
        },
    });
};


// Function to show charts based on the selected type
function showCharts(t) {
    if (isDrawn && !isMultipleDrawn && chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
    chartInstanceType = t;
    chartInstance = drawChart(t, ctx);
    transactionDiv.style.display = "none";
    ctx.style.display = "flex";
    isDrawn = true;
    const btnMap = { "pie": pieBtn, "bar": barBtn, "polarArea": scatterBtn, "line": lineBtn };
    setActive(btnMap[t]);
}

// Function to save data to localStorage
function saveData() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('currentIncome', currentIncome);
    localStorage.setItem('isDarkThemeActivated', isDarkThemeActivated);
}

// Function to load data from localStorage
function loadData() {
    isDarkThemeActivated = localStorage.getItem('isDarkThemeActivated') === 'true';
    expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    currentIncome = parseFloat(localStorage.getItem('currentIncome')) || 0;

    // Clear the table body
    expensesTableBody.innerHTML = '';

    // Reset totalExpenses
    totalExpenses = 0;

    expenses.forEach(expense => {
        addExpenseRow(expense, false); // Do not update totals during load
    });

    // Calculate totalExpenses
    totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    // Calculate currentBalance
    currentBalance = currentIncome - totalExpenses;

    // Update displays
    totalExpensesDisplay.textContent = totalExpenses.toFixed(2);
    totalAmountTableDisplay.textContent = `$${totalExpensesDisplay.textContent}`;
    currentBalanceDisplay.textContent = currentBalance.toFixed(2);
    currentIncomeDisplay.textContent = `$ ${currentIncome.toFixed(2)}`;

    // Update dashboard displays
    dashBoardExpensesDisplay.textContent = `$${totalExpenses.toFixed(2)}`;
    dashBoardBalanceDisplay.textContent = `$${currentBalance.toFixed(2)}`;
    dashBoardIncomeDisplay.textContent = `$${currentIncome.toFixed(2)}`;

    updateChartData();
    if (isDarkThemeActivated) {
        document.documentElement.classList.add('dark-theme');
    }
}

function showSuccessAlert() {
    const alert = document.getElementById('success-alert');
    alert.style.display = 'flex';

    // Hide after 5 seconds automatically
    setTimeout(() => {
      alert.style.display = 'none';
    }, 2000);
}

