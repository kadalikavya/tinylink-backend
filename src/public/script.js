// src/public/script.js

// Auto-detect backend URL (localhost vs production)
const BASE_URL = window.location.origin.includes("localhost")
  ? "http://localhost:3000"       // Local backend
  : "https://tinylink-backend-wfis.onrender.com"; // <-- Replace with your deployment backend URL

console.log("Using API:", BASE_URL);

// elements
const form = document.getElementById("linkForm");
const message = document.getElementById("message");
const table = document.getElementById("linksTable");

// Load all links
async function loadLinks() {
  table.innerHTML = `<tr><td colspan="6" class="p-4 text-center">Loading...</td></tr>`;

  try {
    const res = await fetch(`${BASE_URL}/api/links`);
    const data = await res.json();

    if (!Array.isArray(data)) {
      table.innerHTML = `<tr><td colspan="6" class="p-4 text-center">Error loading</td></tr>`;
      return;
    }

    if (data.length === 0) {
      table.innerHTML = `<tr><td colspan="6" class="p-4 text-center">No links yet</td></tr>`;
      return;
    }

    table.innerHTML = "";

    data.forEach(l => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="p-2 font-mono">${l.code}</td>
        <td class="p-2 truncate" style="max-width:360px" title="${l.url}">${l.url}</td>
        <td class="p-2 text-center">${l.clicks}</td>
        <td class="p-2 text-center">${l.last_clicked ? new Date(l.last_clicked).toLocaleString() : "-"}</td>
        <td class="p-2 text-center"><a class="text-blue-600" href="/code/${l.code}">View</a></td>
        <td class="p-2 text-center">
          <button onclick="copyLink('${l.code}')" class="mr-2 text-sm px-2 py-1 border rounded">Copy</button>
          <button onclick="deleteLink('${l.code}')" class="text-sm px-2 py-1 bg-red-600 text-white rounded">Delete</button>
        </td>
      `;

      table.appendChild(row);
    });

  } catch (err) {
    console.error("Load error", err);
    table.innerHTML = `<tr><td colspan="6" class="p-4 text-center">Error loading</td></tr>`;
  }
}

// Delete link
async function deleteLink(code) {
  if (!confirm("Delete this link?")) return;

  await fetch(`${BASE_URL}/api/links/${code}`, {
    method: "DELETE"
  });

  loadLinks();
}

// Copy link to clipboard
function copyLink(code) {
  const shortUrl = `${window.location.origin}/${code}`;
  navigator.clipboard.writeText(shortUrl)
    .then(() => alert("Copied: " + shortUrl));
}

// Create new link
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  message.textContent = "";
  const url = document.getElementById("url").value.trim();
  const code = document.getElementById("code").value.trim();

  if (!url) {
    message.textContent = "URL is required";
    message.className = "text-red-600";
    return;
  }

  message.textContent = "Creating...";
  message.className = "text-gray-600";

  const res = await fetch(`${BASE_URL}/api/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, code })
  });

  const data = await res.json();

  if (!res.ok) {
    message.textContent = data.error || "Error creating link";
    message.className = "text-red-600";
    return;
  }

  message.textContent = `Created: ${data.code}`;
  message.className = "text-green-600";

  form.reset();
  loadLinks();
});

// Initial load
loadLinks();
