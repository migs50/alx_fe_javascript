// ✅ Chargement initial depuis localStorage ou valeurs par défaut
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "You miss 100% of the shots you don’t take.", category: "Inspiration" },
];

const quoteDisplay = document.getElementById('quoteDisplay');
const filteredQuotesDiv = document.getElementById('filteredQuotes');
const categorySelect = document.getElementById('categorySelect');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// ✅ Met à jour les deux menus déroulants (génération & filtre)
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];

  // Menu déroulant de génération
  categorySelect.innerHTML = '';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  // Menu déroulant de filtre
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // ✅ Restaurer le dernier filtre sélectionné
  const savedFilter = localStorage.getItem('selectedFilter');
  if (savedFilter) {
    categoryFilter.value = savedFilter;
    filterQuotes(); // Affiche les citations filtrées au chargement
  }
}

function displayRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filtered = quotes.filter(q => q.category === selectedCategory);
  if (filtered.length === 0) {
    quoteDisplay.textContent = 'No quotes in this category.';
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${randomQuote.text}" — (${randomQuote.category})`;

  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories(); // ✅ Met à jour les filtres aussi
    filterQuotes(); // Affiche immédiatement si le filtre est actif
    newQuoteText.value = '';
    newQuoteCategory.value = '';
    alert("Quote added successfully!");
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// ✅ Fonction de filtrage dynamique
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem('selectedFilter', selected); // ✅ Sauvegarde filtre

  let filtered = quotes;
  if (selected !== "all") {
    filtered = quotes.filter(q => q.category === selected);
  }

  // Affiche toutes les citations filtrées
  filteredQuotesDiv.innerHTML = '';
  if (filtered.length === 0) {
    filteredQuotesDiv.textContent = 'No quotes to display.';
    return;
  }

  filtered.forEach(q => {
    const p = document.createElement('p');
    p.textContent = `"${q.text}" — (${q.category})`;
    filteredQuotesDiv.appendChild(p);
  });
}

// ✅ Export JSON
function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ✅ Import JSON
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid JSON structure.');
      }
    } catch (err) {
      alert('Error reading file: ' + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ✅ Event listeners
newQuoteBtn.addEventListener('click', displayRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);

// ✅ Initialisation au chargement
populateCategories();
filterQuotes(); // Pour afficher le filtre initial
