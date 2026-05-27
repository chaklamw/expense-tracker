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

    expenses.forEach(function (expense, index) {
        const li = document.createElement("li");
        li.classList.add("expense-item");

        li.innerHTML = 
            `<span>
                ${expense.name} - $${expense.amount} (${expense.category})
            </span>
            
            <button class="delete-btn" data-index="${index}">X</button>`

        expenseList.appendChild(li)
    });

    addDeleteEvents();
}

function updateTotal() {
    const total = expenses.reduce(function (sum, expense) {
        return sum + expense.amount
    }, 0);

    totalDisplay.textContent = total;
}

function addDeleteEvents() {
    const deleteButtons = document.querySelectorAll(".delete-btn");

    deleteButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const index = button.dataset.index;

            expenses.splice(index, 1);

            renderExpenses();
            updateTotal();
        });
    });
}