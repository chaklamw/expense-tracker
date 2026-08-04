// Elements
const expenseName = document.getElementById("expense-name");
const expenseAmount = document.getElementById("expense-amount");
const expenseCategory = document.getElementById("expense-category");
const expenseDate = document.getElementById("expense-date");
const addBtn = document.getElementById("add-btn");
const cancelBtn = document.getElementById("cancel-btn");
const expenseList = document.getElementById("expense-list");
const totalDisplay = document.getElementById("total");
const sortBy = document.getElementById("sort-by");
const filterCategoryContainer = document.querySelector(".filter-categories");
const filterCheckboxes = document.querySelectorAll(".filter-categories input[type='checkbox']");
const filterDateStart = document.getElementById("filter-date-start");
const filterDateEnd = document.getElementById("filter-date-end");
const clearDatesBtn = document.getElementById("clear-dates-btn");
const authBtn = document.getElementById("auth-btn"); 
const userName = document.getElementById("user-name");

const categoryChart = document.getElementById("category-chart");
const chartLegend = document.getElementById("chart-legend");
const chartEmptyMessage = document.getElementById("chart-empty-message");

const categoryColors = {
    food: "#4a90e2",
    transportation: "#f5a623",
    entertainment: "#7ed321",
    bills: "#d0021b",
    other: "#9013fe"
};

// App State
let expenses = [];
let editId = null;
let currentUser = null;

// Event Listeners
addBtn.addEventListener("click", async function() {
    const name = expenseName.value.trim();
    const amount = Number(expenseAmount.value);
    const category = expenseCategory.value;
    const date = expenseDate.value;

    if (name === "" || amount <= 0 || category === "") {
        alert("Please fill out all fields correctly.");
        return;
    }

    if(currentUser) {
        if (editId !== null) {
            const { error } = await supabaseClient
                .from("expenses")
                .update({
                    name,
                    amount,
                    category,
                    expense_date: date
                })
                .eq("id", editId)
                .eq("user_id",currentUser.id);

            if (error) {
                console.error("Error updating expense:", error);
                return;
            }
            
            await loadExpenses();
            exitEditMode();
        } else {
            const { error } = await supabaseClient
                .from("expenses")
                .insert([
                    {
                        name,
                        amount,
                        category,
                        expense_date: date,
                        user_id: currentUser.id
                    }
                
                ]);

            if (error) {
                console.error("Error adding expense:", error);
                return;
            }

            await loadExpenses();
        }
    } else {
        if (editId !== null) {
            const index = expenses.findIndex(function (expense) {
                return expense.id === editId;
            });

            if (index === -1) {
                return;
            }

            expenses[index] = {
                ...expenses[index],
                name,
                amount,
                category,
                expenseDate: expenseDate.value
            };

            saveExpenses();
            exitEditMode();
        } else {
            expenses.push({
                id: crypto.randomUUID(),
                name: name,
                amount: amount,
                category: category,
                expenseDate: date,
                createdAt: Date.now()
            });

            saveExpenses();
        }
    }

    refresh();
    clearForm();
});

expenseList.addEventListener("click", async function (event) {
    const id = event.target.dataset.id

    if (event.target.classList.contains("delete-btn")) {
        if (currentUser) {
            const { error } = await supabaseClient
                .from("expenses")
                .delete()
                .eq("id", id)
                .eq("user_id",currentUser.id);

            if (error) {
                console.error("Error deleting expense:", error);
                return;
            }

            await loadExpenses();
        } else {
            expenses = expenses.filter(function (expense) {
                return expense.id !== id;
            });

            saveExpenses();
        }
    }

    if (event.target.classList.contains("edit-btn")) {
        const expense = expenses.find(function (expense) {
            return expense.id === id;
        });

        if (!expense) {
            return;
        }

        expenseName.value = expense.name;
        expenseAmount.value = expense.amount;
        expenseCategory.value = expense.category;
        expenseDate.value = expense.expenseDate;

        enterEditMode(id);
    }
    refresh();
});

cancelBtn.addEventListener("click", function () {
    clearForm();
    exitEditMode();
    refresh();
});

filterCategoryContainer.addEventListener("change", refresh);

filterDateStart.addEventListener("change", refresh);
filterDateEnd.addEventListener("change", refresh);

clearDatesBtn.addEventListener("click", function () {
    filterDateStart.value = "";
    filterDateEnd.value = "";
    refresh();
});

sortBy.addEventListener("change", refresh);

supabaseClient.auth.onAuthStateChange(async (event, session) => {
    currentUser = session?.user ?? null;

    if (currentUser && event === "SIGNED_IN") {
        await syncGuestExpenses();
    }

    updateAuthUI(currentUser);

    await loadExpenses();
    refresh();
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

    const checkedCategories = Array.from(filterCheckboxes)
        .filter(function (checkbox) {
            return checkbox.checked;
        })
        .map(function (checkbox) {
            return checkbox.value;
        });

    if (checkedCategories.length > 0) {
        displayedExpenses = displayedExpenses.filter(function (expense) {
            return checkedCategories.includes(expense.category);
        });
    }

    const startDate = filterDateStart.value;
    const endDate = filterDateEnd.value;

    if (startDate) {
        displayedExpenses = displayedExpenses.filter(function (expense) {
            return expense.expenseDate >= startDate;
        });
    }

    if (endDate) {
        displayedExpenses = displayedExpenses.filter(function (expense) {
            return expense.expenseDate <= endDate;
        });
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
    } else if (sort === "expense-newest") {
        displayedExpenses.sort(function (a,b) {
            return new Date(b.expenseDate) - new Date(a.expenseDate);
        });
    } else if (sort === "expense-oldest") {
        displayedExpenses.sort(function (a,b) {
            return new Date(a.expenseDate) - new Date(b.expenseDate);
        });
    }

    return displayedExpenses;
}

function getCategoryTotals() {
    const displayedExpenses = getDisplayedExpenses();

    const totals = {};

    displayedExpenses.forEach(function (expense) {
        totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    });

    return totals;
}

// Storage
async function loadExpenses() {
    if (!currentUser) {
        expenses = JSON.parse(localStorage.getItem("expenses")) ?? [];
        return;
    }

    const { data, error } = await supabaseClient
        .from("expenses")
        .select("*")
        .eq("user_id", currentUser.id);

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
            expenseDate: expense.expense_date,
            createdAt: new Date(expense.created_at).getTime()
        };
    });
}

function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

async function syncGuestExpenses() {
    const guestExpenses = JSON.parse(localStorage.getItem("expenses")) ?? [];

    if (guestExpenses.length === 0) {
        return;
    }

    const expensesToInsert = guestExpenses.map(function (expense) {
        return {
            name: expense.name,
            amount: expense.amount,
            category: expense.category,
            expense_date: expense.expenseDate,
            user_id: currentUser.id,
            created_at: new Date(expense.createdAt).toISOString()
        }
    });

    const { error } = await supabaseClient
        .from("expenses")
        .insert(expensesToInsert);
    
    localStorage.removeItem("expenses");
}

// Rendering
function clearForm() {
    expenseName.value = "";
    expenseAmount.value = "";
    expenseCategory.value = "";
    expenseDate.value = new Date().toISOString().split("T")[0];
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

        const [year, month, day] = expense.expenseDate.split("-");

        const displayCategory = expense.category.charAt(0).toUpperCase() + expense.category.slice(1);
        const displayDate = new Date(year, month - 1, day).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });

        li.innerHTML = 
            `<span>
                ${expense.name} - $${expense.amount} (${displayCategory}) - ${displayDate}
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
    renderChart();
    renderLegend();
}

function updateAuthUI(user) {
    exitEditMode();
    clearForm();

    if (user) {
        userName.textContent = "Welcome " + user.user_metadata.full_name + "!";
        authBtn.textContent = "Sign Out";
        authBtn.onclick = signOut;
    } else {
        userName.textContent = "You are on Guest Mode! Changes are not saved to the cloud until you sign in.";
        authBtn.textContent = "Sign in with Google"
        authBtn.onclick = signIn;
    }
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;

    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians)
    };
}

function describeSlice(centerX, centerY, radius, startAngle, endAngle) {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);

    const largeArcFlag = (endAngle - startAngle) > 180 ? 1 : 0;

    return [
        "M", centerX, centerY,
        "L", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        "Z"
    ].join(" ");
}

function renderChart() {
    const totals = getCategoryTotals();
    const categories = Object.keys(totals);
    const chartTotal = categories.reduce(function (sum, category) {
        return sum + totals[category];
    }, 0);

    categoryChart.innerHTML = "";

    if (chartTotal === 0) {
        chartEmptyMessage.hidden = false;
        categoryChart.hidden = true;
        return;
    }

    chartEmptyMessage.hidden = true;
    categoryChart.hidden = false;

    if (categories.length === 1) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", 100);
        circle.setAttribute("cy", 100);
        circle.setAttribute("r", 90);
        circle.setAttribute("fill", categoryColors[categories[0]]);

        categoryChart.appendChild(circle);
        return;
    }

    let startAngle = 0;

    categories.forEach(function (category) {
        const amount = totals[category];
        const sweep = (amount / chartTotal) * 360;
        const endAngle = startAngle + sweep;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", describeSlice(100, 100, 90, startAngle, endAngle));
        path.setAttribute("fill", categoryColors[category]);

        categoryChart.appendChild(path);

        startAngle = endAngle;
    });
}

function renderLegend() {
    const totals = getCategoryTotals();
    const categories = Object.keys(totals);
    const chartTotal = categories.reduce(function (sum, category) {
        return sum + totals[category];
    }, 0);

    chartLegend.innerHTML = "";

    categories.forEach(function (category) {
        const amount = totals[category];
        const percentage = ((amount / chartTotal) * 100).toFixed(1);
        const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);

        const li = document.createElement("li");

        li.innerHTML =
            `<span class="legend-swatch" style="background:${categoryColors[category]}"></span>
            <span>${displayCategory} - $${amount.toFixed(2)} (${percentage}%)</span>`;

        chartLegend.appendChild(li);
    });
}

// Authentication
async function signIn() {
    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google"
    });

    if (error) {
        console.error("Error signing in:", error);
    }
}

async function signOut() {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error(error);
    }
}

async function startApp() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    currentUser = user;

    updateAuthUI(user);

    await loadExpenses();
    refresh();
}

startApp();