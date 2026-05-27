const expenseName = document.getElementById("expense-name");
const expenseAmount = document.getElementById("expense-amount");
const expenseCategory = document.getElementById("expense-category");
const addBtn = document.getElementById("add-btn");
const expenseList = document.getElementById("expense-list");
const totalDisplay = document.getElementById("total");

let expenses = [];

addBtn.addEventListener("click", function() {
    const expense = {
        name: expenseName.value,
        amount: Number(expenseAmount.value),
        category: expenseCategory.value
    };

    expenses.push(expense)

    renderExpenses();
    
    updateTotal();
});

function renderExpenses() {
    expenseList.innerHTML = "";

    expenses.forEach(function (expense) {
        const li = document.createElement("li");

        li.textContent = `${expense.name} - $${expense.amount} (${expense.category})`;

        expenseList.appendChild(li)
    });
}

function updateTotal() {
    const total = expenses.reduce(function (sum, expense) {
        return sum + expense.amount
    }, 0);

    totalDisplay.textContent = total;
}