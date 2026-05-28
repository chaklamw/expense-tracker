const expenseName = document.getElementById("expense-name");
const expenseAmount = document.getElementById("expense-amount");
const expenseCategory = document.getElementById("expense-category");
const addBtn = document.getElementById("add-btn");
const expenseList = document.getElementById("expense-list");
const totalDisplay = document.getElementById("total");

let expenses = [];

addBtn.addEventListener("click", function() {
    const name = expenseName.value.trim();
    const amount = Number(expenseAmount.value);
    const category = expenseCategory.value;

    if (name === "" || amount <= 0 || category === "") {
        alert("Please fill out all fields correctly.");
        return;
    }

    const expense = {
        name: name,
        amount: amount,
        category: category
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
            <div class="button-group">
                <button class="edit-btn" data-index=${index}">Edit</button>

                <button class="delete-btn" data-index="${index}">X</button>
            </div>`

        expenseList.appendChild(li)
    });

    addDeleteEvents();
}

function updateTotal() {
    const total = expenses.reduce(function (sum, expense) {
        return sum + expense.amount
    }, 0);

    totalDisplay.textContent = total;

    expenseAmount.value = "";
    expenseCategory.value = "";
    expenseName.value = "";
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