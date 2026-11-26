'use strict';

// Навчальні дані: не є реальним меню будь-якого закладу.
const DEMO_MENU = [
  { name: 'Борщ український', category: 'first', price: 38, vegetarian: false, allergens: [], description: 'Перша страва · 250 мл', emoji: '🥣' },
  { name: 'Курячий суп із локшиною', category: 'first', price: 45, vegetarian: false, allergens: ['gluten'], description: 'Перша страва · 250 мл', emoji: '🍲' },
  { name: 'Овочевий суп-пюре', category: 'first', price: 42, vegetarian: true, allergens: [], description: 'Перша страва · 250 мл', emoji: '🥦' },
  { name: 'Картопляне пюре', category: 'side', price: 32, vegetarian: true, allergens: ['lactose'], description: 'Гарнір · 180 г', emoji: '🥔' },
  { name: 'Гречана каша', category: 'side', price: 28, vegetarian: true, allergens: [], description: 'Гарнір · 180 г', emoji: '🌾' },
  { name: 'Овочевий салат', category: 'salad', price: 29, vegetarian: true, allergens: [], description: 'Свіжі овочі · 120 г', emoji: '🥗' },
  { name: 'Салат із капусти', category: 'salad', price: 24, vegetarian: true, allergens: [], description: 'Свіжа капуста · 120 г', emoji: '🥬' },
  { name: 'Котлета куряча', category: 'main', price: 48, vegetarian: false, allergens: ['gluten'], description: 'Основна страва · 110 г', emoji: '🍗' },
  { name: 'Рибне філе запечене', category: 'main', price: 55, vegetarian: false, allergens: ['fish'], description: 'Основна страва · 130 г', emoji: '🐟' },
  { name: 'Овочеве рагу', category: 'main', price: 44, vegetarian: true, allergens: [], description: 'Основна страва · 200 г', emoji: '🥕' },
  { name: 'Компот ягідний', category: 'drink', price: 18, vegetarian: true, allergens: [], description: 'Напій · 200 мл', emoji: '🫐' },
  { name: 'Какао на молоці', category: 'drink', price: 32, vegetarian: true, allergens: ['lactose'], description: 'Напій · 200 мл', emoji: '☕' }
];

const loadButton = document.getElementById('loadMenuBtn');
const errorButton = document.getElementById('errorBtn');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const priceFilter = document.getElementById('priceFilter');
const allergenFilter = document.getElementById('allergenFilter');
const sortOrder = document.getElementById('sortOrder');
const vegetarianFilter = document.getElementById('vegetarianFilter');
const resetFiltersButton = document.getElementById('resetFiltersBtn');
const statusElement = document.getElementById('menuStatus');
const resultsElement = document.getElementById('menuResults');
const errorElement = document.getElementById('menuError');
let isLoading = false;
let loadedMenu = [];

// Promise імітує мережевий запит; жоден сервер чи API не використовується.
function fetchMenuDemo(shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Демонстраційна помилка отримання меню.'));
      } else {
        resolve(DEMO_MENU);
      }
    }, 1500);
  });
}

function renderMenu(items) {
  resultsElement.replaceChildren();
  for (const item of items) {
    const article = document.createElement('article');
    article.className = 'dish';
    const emoji = document.createElement('span');
    emoji.className = 'dish-emoji';
    emoji.setAttribute('aria-hidden', 'true');
    emoji.textContent = item.emoji;
    const heading = document.createElement('h3');
    heading.textContent = item.name;
    const description = document.createElement('p');
    description.textContent = item.description;
    const price = document.createElement('span');
    price.className = 'dish-price';
    price.textContent = `${item.price} грн`;
    article.append(emoji, heading, description, price);
    resultsElement.append(article);
  }
}

function matchesAllergenFilter(item, allergenMode) {
  if (allergenMode === 'all') return true;
  if (allergenMode === 'no-gluten') return !item.allergens.includes('gluten');
  if (allergenMode === 'no-lactose') return !item.allergens.includes('lactose');
  if (allergenMode === 'allergen-free') return item.allergens.length === 0;
  return true;
}

function getFilteredMenu() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;
  const maxPrice = priceFilter.value === 'all' ? null : Number(priceFilter.value);
  const allergenMode = allergenFilter.value;
  const onlyVegetarian = vegetarianFilter.checked;
  const currentSort = sortOrder.value;

  const filtered = loadedMenu.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesPrice = maxPrice === null || item.price <= maxPrice;
    const matchesAllergen = matchesAllergenFilter(item, allergenMode);
    const matchesVegetarian = !onlyVegetarian || item.vegetarian;
    return matchesSearch && matchesCategory && matchesPrice && matchesAllergen && matchesVegetarian;
  });

  if (currentSort === 'price-asc') {
    return filtered.sort((a, b) => a.price - b.price);
  }
  if (currentSort === 'price-desc') {
    return filtered.sort((a, b) => b.price - a.price);
  }
  return filtered;
}

function applyFilters() {
  if (loadedMenu.length === 0) return;

  const filtered = getFilteredMenu();
  renderMenu(filtered);
  statusElement.className = 'status';
  statusElement.textContent = filtered.length > 0
    ? `Показано ${filtered.length} із ${loadedMenu.length} страв.`
    : 'За вашим запитом страв не знайдено.';
}

function resetFilters() {
  searchInput.value = '';
  categoryFilter.value = 'all';
  priceFilter.value = 'all';
  allergenFilter.value = 'all';
  sortOrder.value = 'default';
  vegetarianFilter.checked = false;
  applyFilters();
}

async function loadMenu(shouldFail = false) {
  if (isLoading) return;
  isLoading = true;
  loadButton.disabled = true;
  errorButton.disabled = true;
  resultsElement.setAttribute('aria-busy', 'true');
  errorElement.hidden = true;
  statusElement.className = 'status loading';
  statusElement.textContent = 'Завантажуємо меню…';

  try {
    loadedMenu = await fetchMenuDemo(shouldFail);
    applyFilters();
  } catch (error) {
    loadedMenu = [];
    resultsElement.replaceChildren();
    errorElement.hidden = false;
    statusElement.className = 'status error';
    statusElement.textContent = error instanceof Error ? error.message : 'Невідома помилка.';
  } finally {
    isLoading = false;
    loadButton.disabled = false;
    errorButton.disabled = false;
    resultsElement.setAttribute('aria-busy', 'false');
  }
}

loadButton.addEventListener('click', () => loadMenu(false));
errorButton.addEventListener('click', () => loadMenu(true));
searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);
priceFilter.addEventListener('change', applyFilters);
allergenFilter.addEventListener('change', applyFilters);
sortOrder.addEventListener('change', applyFilters);
vegetarianFilter.addEventListener('change', applyFilters);
resetFiltersButton.addEventListener('click', resetFilters);
