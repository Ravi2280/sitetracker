// LOGIN
function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  if (user === "admin" && pass === "admin") {
    localStorage.setItem("loggedIn", "true");
    showDashboard();
  } else {
    alert("Invalid credentials.");
  }
}

function logout() {
  localStorage.removeItem("loggedIn");
  location.reload();
}

function showDashboard() {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  loadRecords();
  drawChart();
}

// FORM
document.getElementById("sectionForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const sectionName = document.getElementById("sectionName").value;
  const progress = document.getElementById("progress").value;
  const materials = document.getElementById("materials").value;
  const logEntry = document.getElementById("logEntry").value;
  const editIndex = document.getElementById("editIndex").value;
  const date = new Date().toLocaleString();

  const newEntry = { sectionName, progress, materials, logEntry, date };

  let records = JSON.parse(localStorage.getItem("siteRecords")) || [];

  if (editIndex === "") {
    records.push(newEntry);
  } else {
    records[editIndex] = newEntry;
    document.getElementById("editIndex").value = "";
  }

  localStorage.setItem("siteRecords", JSON.stringify(records));
  loadRecords();
  drawChart();
  this.reset();
});

function loadRecords() {
  const container = document.getElementById("recordsContainer");
  container.innerHTML = "";
  const records = JSON.parse(localStorage.getItem("siteRecords")) || [];

  records.forEach((entry, index) => {
    const div = document.createElement("div");
    div.className = "record";
    div.innerHTML = `
      <h3>${entry.sectionName}</h3>
      <p><strong>Progress:</strong> ${entry.progress}%</p>
      <p><strong>Materials:</strong> ${entry.materials}</p>
      <p><strong>Log:</strong> ${entry.logEntry}</p>
      <p><em>${entry.date}</em></p>
      <div class="actions">
        <button onclick="editEntry(${index})">✏️ Edit</button>
        <button class="delete-btn" onclick="deleteEntry(${index})">🗑️ Delete</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function editEntry(index) {
  const records = JSON.parse(localStorage.getItem("siteRecords")) || [];
  const entry = records[index];

  document.getElementById("sectionName").value = entry.sectionName;
  document.getElementById("progress").value = entry.progress;
  document.getElementById("materials").value = entry.materials;
  document.getElementById("logEntry").value = entry.logEntry;
  document.getElementById("editIndex").value = index;
}

function deleteEntry(index) {
  let records = JSON.parse(localStorage.getItem("siteRecords")) || [];
  if (confirm("Are you sure you want to delete this entry?")) {
    records.splice(index, 1);
    localStorage.setItem("siteRecords", JSON.stringify(records));
    loadRecords();
    drawChart();
  }
}

// SEARCH
document.getElementById("searchInput").addEventListener("input", function () {
  const value = this.value.toLowerCase();
  const allRecords = document.querySelectorAll(".record");

  allRecords.forEach(record => {
    const title = record.querySelector("h3").innerText.toLowerCase();
    record.style.display = title.includes(value) ? "block" : "none";
  });
});

// CHART
let chart;
function drawChart() {
  const records = JSON.parse(localStorage.getItem("siteRecords")) || [];
  const labels = records.map(r => r.sectionName);
  const data = records.map(r => parseInt(r.progress));

  const ctx = document.getElementById("progressChart").getContext("2d");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Progress (%)",
        data,
        backgroundColor: "#007bff"
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}

// EXPORTS
function exportToPDF() {
  const el = document.getElementById("recordsContainer");
  html2pdf().from(el).save("site-records.pdf");
}

function exportToExcel() {
  const records = JSON.parse(localStorage.getItem("siteRecords")) || [];
  const ws = XLSX.utils.json_to_sheet(records);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Records");
  XLSX.writeFile(wb, "site-records.xlsx");
}

// DARK MODE
const darkToggle = document.getElementById("darkModeToggle");
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

// INITIAL LOAD
window.onload = () => {
  if (localStorage.getItem("loggedIn") === "true") showDashboard();
  if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark");
};
