import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";
import { createBookElement, createOptionElement } from "./utils/helper.js";

let page = 1;
let matches = books;

// Initial setup function
const initialize = () => {
  createBookList();
  createOptionLists();
  checkAndSetTheme();
  updateShowMoreButton();
};

// Function to create the initial book and append to  specified location DOM
function createBookList() {
  const starting = document.createDocumentFragment();
  const initialBooks = matches
    .slice(0, BOOKS_PER_PAGE)
    .map(({ author, id, image, title }) =>
      createBookElement({ author, id, image, title })
    );
  appendElements(starting, "[data-list-items]", initialBooks);
}

// Function to create option lists for genres and authors
function createOptionLists() {
  const genreHtml = createOptionElement(genres, "All Genres");
  const authorHtml = createOptionElement(authors, "All Authors");
  appendElements(genreHtml, "[data-search-genres]");
  appendElements(authorHtml, "[data-search-authors]");
}

// Function to append elements to the DOM
function appendElements(fragment, selector, elements = []) {
  elements.forEach((element) => fragment.appendChild(element));
  document.querySelector(selector).appendChild(fragment);
}

// Function to set theme colors
function setThemeColors(theme) {
  const colors = {
    darkColor: theme === "night" ? "255, 255, 255" : "10, 10, 20",
    lightColor: theme === "night" ? "10, 10, 20" : "255, 255, 255",
  };
  const { darkColor, lightColor } = colors;
  document.querySelector("[data-settings-theme]").value = theme;
  document.documentElement.style.setProperty("--color-dark", darkColor);
  document.documentElement.style.setProperty("--color-light", lightColor);
}

// Function to check and set theme
function checkAndSetTheme() {
  const theme =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "night"
      : "day";
  setThemeColors(theme);
}

// Function to update "Show more" button text and disabled state
function updateShowMoreButton() {
  const remainingBooks = Math.max(books.length - BOOKS_PER_PAGE, 0);
  const listButton = document.querySelector("[data-list-button]");
  listButton.innerText = `Show more (${remainingBooks})`;
  listButton.disabled = matches.length - page * BOOKS_PER_PAGE > 0;
}

// Event listeners setup function
function setupEventListeners() {
  document
    .querySelector("[data-search-cancel]")
    .addEventListener("click", () => {
      document.querySelector("[data-search-overlay]").open = false;
    });

  document
    .querySelector("[data-settings-cancel]")
    .addEventListener("click", () => {
      document.querySelector("[data-settings-overlay]").open = false;
    });

  document
    .querySelector("[data-header-search]")
    .addEventListener("click", () => {
      document.querySelector("[data-search-overlay]").open = true;
      document.querySelector("[data-search-title]").focus();
    });

  document
    .querySelector("[data-header-settings]")
    .addEventListener("click", () => {
      document.querySelector("[data-settings-overlay]").open = true;
    });

  document.querySelector("[data-list-close]").addEventListener("click", () => {
    document.querySelector("[data-list-active]").open = false;
  });

  document
    .querySelector("[data-settings-form]")
    .addEventListener("submit", handleSettingsFormSubmit);

  document
    .querySelector("[data-search-form]")
    .addEventListener("submit", handleSearchFormSubmit);

  document
    .querySelector("[data-list-button]")
    .addEventListener("click", handleShowMoreButtonClick);

  document
    .querySelector("[data-list-items]")
    .addEventListener("click", handleListItemClick);
}

// Event handlers
function handleSettingsFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const { theme } = Object.fromEntries(formData);

  setThemeColors(theme);

  document.querySelector("[data-settings-overlay]").open = false;
}

function handleSearchFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const filters = Object.fromEntries(formData);
  const result = applyFilters(filters);

  updateBookList(result);
}

function handleShowMoreButtonClick() {
  const fragment = document.createDocumentFragment();
  const start = page * BOOKS_PER_PAGE;
  const end = (page + 1) * BOOKS_PER_PAGE;
  const additionalBooks = matches
    .slice(start, end)
    .map(({ author, id, image, title }) =>
      createBookElement({ author, id, image, title })
    );

  appendElements(fragment, "[data-list-items]", additionalBooks);
  page += 1;
}

function handleListItemClick(event) {
  const pathArray = Array.from(event.path || event.composedPath());
  let active = null;

  for (const node of pathArray) {
    if (active) break;

    if (node?.dataset?.preview) {
      active = findActiveBook(node.dataset.preview);
    }
  }

  if (active) {
    showActiveBook(active);
  }
}

// Function to apply search filters
function applyFilters(filters) {
  return books.filter((book) => {
    let genreMatch = filters.genre === "any";

    for (const singleGenre of book.genres) {
      if (genreMatch) break;
      if (singleGenre === filters.genre) {
        genreMatch = true;
      }
    }

    return (
      (filters.title.trim() === "" ||
        book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
      (filters.author === "any" || book.author === filters.author) &&
      genreMatch
    );
  });
}

// Function to update the book list based on filtered results
function updateBookList(result) {
  page = 1;
  matches = result;

  const listMessage = document.querySelector("[data-list-message]");
  listMessage.classList.toggle("list__message_show", result.length < 1);

  document.querySelector("[data-list-items]").innerHTML = "";
  createBookList();

  updateShowMoreButton();

  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("[data-search-overlay]").open = false;
}

// Function to find active book by ID
function findActiveBook(id) {
  return books.find((book) => book.id === id);
}

// Function to show details of active book
function showActiveBook(active) {
  document.querySelector("[data-list-active]").open = true;
  document.querySelector("[data-list-blur]").src = active.image;
  document.querySelector("[data-list-image]").src = active.image;
  document.querySelector("[data-list-title]").innerText = active.title;
  document.querySelector("[data-list-subtitle]").innerText = `${
    authors[active.author]
  } (${new Date(active.published).getFullYear()})`;
  document.querySelector("[data-list-description]").innerText =
    active.description;
}

// Call the initialization function and setup event listeners
initialize();
setupEventListeners();
