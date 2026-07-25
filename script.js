// Elements
const expenseName = document.getElementById("expense-name");
const expenseAmount = document.getElementById("expense-amount");
const expenseCategory = document.getElementById("expense-category");
const addBtn = document.getElementById("add-btn");
const cancelBtn = document.getElementById("cancel-btn");
const expenseList = document.getElementById("expense-list");
const totalDisplay = document.getElementById("total");
const sortBy = document.getElementById("sort-by");
const filterCategory = document.getElementById("filter-category");

// App State
let expenses = [];
let editId = null;

// Event Listeners
addBtn.addEventListener("click", function() {
    const name = expenseName.value.trim();
    const amount = Number(expenseAmount.value);
    const category = expenseCategory.value;

    if (name === "" || amount <= 0 || category === "") {
        alert("Please fill out all fields correctly.");
        return;
    }

    let expense;

    if (editId !== null) {
        const expenseToEdit = expenses.find(function (expense) {
            return expense.id === editId;
        });

        expense = {
            id: editId,
            name,
            amount,
            category,
            createdAt: expenseToEdit.createdAt
        };
        
        const index = expenses.findIndex(function (expense) {
            return expense.id === editId;
        });

        expenses[index] = expense;

        saveExpenses();
        exitEditMode();
    } else {
        expense = {
            id: crypto.randomUUID(),
            name: name,
            amount: amount,
            category: category,
            createdAt: Date.now()
        };
        expenses.push(expense)
        saveExpenses();
    }

    refresh();
    clearForm();
});

expenseList.addEventListener("click", function (event) {
    const id = event.target.dataset.id

    if (event.target.classList.contains("delete-btn")) {
        expenses = expenses.filter(function (expense) {
            return expense.id !== id;
        });


        saveExpenses();

        refresh();
    }

    if (event.target.classList.contains("edit-btn")) {
        const expense = expenses.find(function (expense) {
            return expense.id === id;
        });

        expenseName.value = expense.name;
        expenseAmount.value = expense.amount;
        expenseCategory.value = expense.category;

        enterEditMode(id);

        renderExpenses();
    }

});

cancelBtn.addEventListener("click", function () {
    clearForm();
    exitEditMode();
    renderExpenses();
});

filterCategory.addEventListener("change", function() {
    renderExpenses();
    updateTotal();
});

sortBy.addEventListener("change", function() {
    renderExpenses();
    updateTotal();
});

// Editing
function enterEditMode(id) {
    editId = id;
    addBtn.textContent = "Save Changes";
    cancelBtn.hidden = false;
}

function exitEditMode() {
    editId = null;
    addBtn.textContent = "Add Expense";
    cancelBtn.hidden = true;
}

// Processing
function getDisplayedExpenses() {
    let displayedExpenses = [...expenses];

    const category = filterCategory.value;

    if (category !== "all") {
        displayedExpenses = displayedExpenses.filter(function (expense) {
            return expense.category === category;
        })
    }

    const sort = sortBy.value;

    if (sort === "newest") {
        displayedExpenses.sort(function (a,b) {
            return b.createdAt - a.createdAt;
        });
    } else if (sort === "oldest") {
        displayedExpenses.sort(function (a, b) {
            return a.createdAt - b.createdAt;
        });
    }

    return displayedExpenses;
}

// Storage
function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function loadExpenses() {
    const savedExpenses = localStorage.getItem("expenses");

    if (savedExpenses) {
        expenses = JSON.parse(savedExpenses);
    }
}

// Rendering
function clearForm() {
    expenseName.value = "";
    expenseAmount.value = "";
    expenseCategory.value = "";
}

function renderExpenses() {
    expenseList.innerHTML = "";

    const displayedExpenses = getDisplayedExpenses();

    displayedExpenses.forEach(function (expense) {
        const isEditing = expense.id === editId; // boolean

        const li = document.createElement("li");
        li.classList.add("expense-item");

        if (isEditing) {
            li.classList.add("editing");
        }

        const displayCategory = expense.category.charAt(0).toUpperCase() + expense.category.slice(1);

        li.innerHTML = 
            `<span>
                ${expense.name} - $${expense.amount} (${displayCategory})
            </span>
            <div class="button-group">
                <button class="edit-btn" data-id="${expense.id}"">EDIT</button>

                <button class="delete-btn" data-id="${expense.id}">X</button>
            </div>`;

        expenseList.appendChild(li);
    });
}

function updateTotal() {
    const displayedExpenses = getDisplayedExpenses();

    const total = displayedExpenses.reduce(function (sum, expense) {
        return sum + expense.amount
    }, 0);

    totalDisplay.textContent = `${total.toFixed(2)}`;
}

function refresh() {
    renderExpenses();
    updateTotal();
}

loadExpenses();
refresh();