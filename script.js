// Elements
const expenseName = document.getElementById("expense-name");
const expenseAmount = document.getElementById("expense-amount");
const expenseCategory = document.getElementById("expense-category");
const addBtn = document.getElementById("add-btn");
const cancelBtn = document.getElementById("cancel-btn");
const expenseList = document.getElementById("expense-list");
const totalDisplay = document.getElementById("total");

// App State
let expenses = [];
let editIndex = null;

// Event Listeners
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

    if (editIndex !== null) {
        expenses[editIndex] = expense;
        exitEditMode();
    } else {
        expenses.push(expense)
    }

    refresh();
    clearForm();
});

expenseList.addEventListener("click", function (event) {
    const index = event.target.dataset.index;

    if (event.target.classList.contains("delete-btn")) {
        expenses.splice(index, 1);

        refresh();
    }

    if (event.target.classList.contains("edit-btn")) {
        const expense = expenses[index];

        expenseName.value = expense.name;
        expenseAmount.value = expense.amount;
        expenseCategory.value = expense.category;

        enterEditMode(index);

        renderExpenses();
    }

});

cancelBtn.addEventListener("click", function () {
    clearForm();
    exitEditMode();
    renderExpenses();
});

// Editing
function enterEditMode(index) {
    editIndex = index;
    addBtn.textContent = "Save Changes";
    cancelBtn.hidden = false;
}

function exitEditMode() {
    editIndex = null;
    addBtn.textContent = "Add Expense";
    cancelBtn.hidden = true;
}


// Rendering
function clearForm() {
    expenseName.value = "";
    expenseAmount.value = "";
    expenseCategory.value = "";
}

function renderExpenses() {
    expenseList.innerHTML = "";

    expenses.forEach(function (expense, index) {
        const isEditing = index == editIndex; // boolean

        const li = document.createElement("li");
        li.classList.add("expense-item");

        if (isEditing) {
            li.classList.add("editing");
        }

        li.innerHTML = 
            `<span>
                ${expense.name} - $${expense.amount} (${expense.category})
            </span>
            <div class="button-group">
                <button class="edit-btn" data-index="${index}">EDIT</button>

                <button class="delete-btn" data-index="${index}">X</button>
            </div>`;

        expenseList.appendChild(li);
    });
}

function updateTotal() {
    const total = expenses.reduce(function (sum, expense) {
        return sum + expense.amount
    }, 0);

    totalDisplay.textContent = `${total.toFixed(2)}`;
}

function refresh() {
    renderExpenses();
    updateTotal();
}