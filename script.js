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
addBtn.addEventListener("click", async function() {
    const name = expenseName.value.trim();
    const amount = Number(expenseAmount.value);
    const category = expenseCategory.value;

    if (name === "" || amount <= 0 || category === "") {
        alert("Please fill out all fields correctly.");
        return;
    }

    let expense;

    if (editId !== null) {
        const { error } = await supabaseClient
            .from("expenses")
            .update({
                name,
                amount,
                category
            })
            .eq("id", editId);

        if (error) {
            console.error("Error updating expense:", error);
            return;
        }
        
        await loadExpenses();
        exitEditMode();
    } else {
        const { data, error } = await supabaseClient
            .from("expenses")
            .insert([
                {
                    name: name,
                    amount: amount,
                    category: category,
                }
            
            ]);

        if (error) {
            console.error("Error adding expense:", error);
            return;
        }

        await loadExpenses();
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

        refresh();
    }

});

cancelBtn.addEventListener("click", function () {
    clearForm();
    exitEditMode();
    refresh();
});

filterCategory.addEventListener("change", refresh);

sortBy.addEventListener("change", refresh);

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
    } else if (sort === "a-z") {
        displayedExpenses.sort(function (a,b) {
            return a.name.localeCompare(b.name);
        });
    } else if (sort === "z-a") {
        displayedExpenses.sort(function (a,b) {
            return b.name.localeCompare(a.name);
        });
    } else if (sort === "highest") {
        displayedExpenses.sort(function (a,b) {
            return b.amount - a.amount;
        });
    } else if (sort === "lowest") {
        displayedExpenses.sort(function (a,b) {
            return a.amount - b.amount;
        });
    }

    return displayedExpenses;
}

// Storage
function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

async function loadExpenses() {
    const { data, error } = await supabaseClient
        .from("expenses")
        .select("*");

    if (error) {
        console.error("Error loading expenses:", error);
        return;
    }

    expenses = data.map(function (expense) {
        return {
            id: expense.id,
            name: expense.name,
            amount: expense.amount,
            category: expense.category,
            createdAt: expense.created_at
        };
    });
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
                <button class="edit-btn" data-id="${expense.id}">EDIT</button>

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

async function startApp() {
    await loadExpenses();
    refresh();
}

startApp();