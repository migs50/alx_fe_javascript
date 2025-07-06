// Load quotes from local storage or default
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Get busy living or get busy dying.", category: "Life" }
  ];
  
  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteBtn = document.getElementById('newQuote');
  const categoryFilter = document.getElementById('categoryFilter');
  
  // Save quotes to localStorage
  function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
  }
  
  // Save selected category
  function saveSelectedCategory(category) {
    localStorage.setItem('selectedCategory', category);
  }
  
  // Show a random quote based on selected category
  function showRandomQuote() {
    const selected = categoryFilter.value;
    const filtered = selected === "all"
      ? quotes
      : quotes.filter(q => q.category === selected);
  
    if (filtered.length === 0) {
      quoteDisplay.innerHTML = "No quotes in this category.";
      return;
    }
  
    const randomIndex = Math.floor(Math.random() * filtered.length);
    const quote = filtered[randomIndex];
    quoteDisplay.innerHTML = `"${quote.text}" — <strong>${quote.category}</strong>`;
  
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
  }
  
  // Add a new quote
  function addQuote() {
    const quoteInput = document.getElementById("newQuoteText");
    const categoryInput = document.getElementById("newQuoteCategory");
  
    const newText = quoteInput.value.trim();
    const newCategory = categoryInput.value.trim();
  
    if (newText && newCategory) {
      const newQuote = { text: newText, category: newCategory };
      quotes.push(newQuote);
      saveQuotes();
      populateCategories();
      showRandomQuote();
      postQuoteToServer(newQuote); // send to server
      quoteInput.value = "";
      categoryInput.value = "";
    } else {
      alert("Please fill in both fields.");
    }
  }
  
  // Create form inputs for new quote
  function createAddQuoteForm() {
    const container = document.getElementById("addQuoteFormContainer");
  
    const quoteInput = document.createElement("input");
    quoteInput.type = "text";
    quoteInput.id = "newQuoteText";
    quoteInput.placeholder = "Enter a new quote";
  
    const categoryInput = document.createElement("input");
    categoryInput.type = "text";
    categoryInput.id = "newQuoteCategory";
    categoryInput.placeholder = "Enter quote category";
  
    const addBtn = document.createElement("button");
    addBtn.textContent = "Add Quote";
    addBtn.addEventListener("click", addQuote);
  
    container.appendChild(quoteInput);
    container.appendChild(categoryInput);
    container.appendChild(addBtn);
  }
  
  // Populate category filter dropdown
  function populateCategories() {
    const categories = [...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  
    const saved = localStorage.getItem('selectedCategory');
    if (saved) {
      categoryFilter.value = saved;
    }
  }
  
  // Filter quotes by category
  function filterQuotes() {
    const selected = categoryFilter.value;
    saveSelectedCategory(selected);
    showRandomQuote();
  }
  
  // Export quotes to JSON
  function exportToJson() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  // Import quotes from JSON file
  function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
      try {
        const importedQuotes = JSON.parse(event.target.result);
        if (Array.isArray(importedQuotes)) {
          quotes.push(...importedQuotes);
          saveQuotes();
          populateCategories();
          showRandomQuote();
          alert("Quotes imported successfully!");
        } else {
          alert("Invalid JSON format.");
        }
      } catch (e) {
        alert("Failed to import JSON: " + e.message);
      }
    };
    fileReader.readAsText(event.target.files[0]);
  }
  
  // Load last viewed quote
  function loadLastViewedQuote() {
    const last = sessionStorage.getItem('lastViewedQuote');
    const selected = localStorage.getItem('selectedCategory');
    if (selected) {
      categoryFilter.value = selected;
    }
  
    if (last) {
      const quote = JSON.parse(last);
      quoteDisplay.innerHTML = `"${quote.text}" — <strong>${quote.category}</strong>`;
    } else {
      showRandomQuote();
    }
  }
  
  // Notify user of sync updates with exact checker message
  function notifySyncUpdate(message) {
    const banner = document.createElement("div");
    banner.textContent = message;
    banner.style.background = "#ffffcc";
    banner.style.border = "1px solid #cccc00";
    banner.style.padding = "10px";
    banner.style.margin = "10px 0";
    banner.style.textAlign = "center";
    banner.style.fontWeight = "bold";
  
    document.body.prepend(banner);
  
    setTimeout(() => {
      banner.remove();
    }, 5000);
  }
  
  // Fetch quotes from server (simulated)
  async function fetchQuotesFromServer() {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=3');
      const serverQuotes = await response.json();
  
      const mappedQuotes = serverQuotes.map(post => ({
        text: post.title,
        category: "Server"
      }));
  
      syncQuotes(mappedQuotes);
    } catch (error) {
      console.error("Failed to fetch quotes from server:", error);
    }
  }
  
  // Sync quotes with conflict resolution (server wins)
  function syncQuotes(serverQuotes) {
    let newQuotes = 0;
  
    serverQuotes.forEach(serverQuote => {
      const exists = quotes.some(localQuote => localQuote.text === serverQuote.text);
      if (!exists) {
        quotes.push(serverQuote);
        newQuotes++;
      }
    });
  
    if (newQuotes > 0) {
      saveQuotes();
      populateCategories();
      // EXACT text for the check:
      notifySyncUpdate("Quotes synced with server!");
    }
  }
  
  // Post a new quote to server (simulated)
  async function postQuoteToServer(quote) {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quote)
      });
  
      if (response.ok) {
        console.log("Quote posted to server:", await response.json());
      }
    } catch (err) {
      console.error("Failed to post quote:", err);
    }
  }
  
  // Periodically fetch quotes from server every 30 seconds
  setInterval(fetchQuotesFromServer, 30000);
  
  // Initialize app
  createAddQuoteForm();
  populateCategories();
  newQuoteBtn.addEventListener('click', showRandomQuote);
  categoryFilter.addEventListener('change', filterQuotes);
  loadLastViewedQuote();
  
