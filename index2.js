import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

let page = 1;
let matches = books;

const createBookElement = ({ author, id, image, title }) => {
  const element = document.createElement("button");
  element.classList = "preview";
  element.setAttribute("data-preview", id);

  element.innerHTML = `
    <img class="preview__image" src="${image}" />
    <div class="preview__info">
      <h3 class="preview__title">${title}</h3>
      <div class="preview__author">${authors[author]}</div>
    </div>
  `;

  return element;
};

const displayBooks = (matches, starting) => {
  for (const { author, id, image, title } of matches.slice(0, BOOKS_PER_PAGE)) {
    const bookElement = createBookElement({ author, id, image, title });
    starting.appendChild(bookElement);
  }

  const bookListItems = document.querySelector("[data-list-items]");
  bookListItems.appendChild(starting);
};

const createSelectElement = (options, defaultOptionText) => {
  const selectElement = document.createDocumentFragment();
  const firstElement = document.createElement("option");
  firstElement.value = "any";
  firstElement.innerText = defaultOptionText;
  selectElement.appendChild(firstElement);

  for (const [id, name] of Object.entries(options)) {
    const element = document.createElement("option");
    element.value = id;
    element.innerText = name;
    selectElement.appendChild(element);
  }

  return selectElement;
};

const displaySelectOptions = (options, targetSelector, defaultOptionText) => {
  const selectHtml = createSelectElement(options, defaultOptionText);
  document.querySelector(targetSelector).appendChild(selectHtml);
};

const setThemeColors = (theme) => {
  const colors = {
    darkColor: theme === "night" ? "255, 255, 255" : "10, 10, 20",
    lightColor: theme === "night" ? "10, 10, 20" : "255, 255, 255",
  };
  const { darkColor, lightColor } = colors;
  document.querySelector("[data-settings-theme]").value = theme;
  document.documentElement.style.setProperty("--color-dark", darkColor);
  document.documentElement.style.setProperty("--color-light", lightColor);
};

const checkAndSetTheme = () => {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    setThemeColors("night");
  } else {
    setThemeColors("day");
  }
};

const handleSearchFormSubmit = (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const filters = Object.fromEntries(formData);
  const result = [];

  for (const book of books) {
    let genreMatch = filters.genre === "any";

    for (const singleGenre of book.genres) {
      if (genreMatch) break;
      if (singleGenre === filters.genre) {
        genreMatch = true;
      }
    }

    if (
      (filters.title.trim() === "" ||
        book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
      (filters.author === "any" || book.author === filters.author) &&
      genreMatch
    ) {
      result.push(book);
    }
  }

  page = 1;
  matches = result;

  updateBookList();
};

const updateBookList = () => {
  const listItems = document.querySelector("[data-list-items]");
  listItems.innerHTML = "";

  if (matches.length === 0) {
    document
      .querySelector("[data-list-message]")
      .classList.add("list__message_show");
  } else {
    document
      .querySelector("[data-list-message]")
      .classList.remove("list__message_show");
    displayBooks(matches, document.createDocumentFragment());
  }

  updateListButton();
};

const updateListButton = () => {
  const remaining = Math.max(matches.length - page * BOOKS_PER_PAGE, 0);
  const button = document.querySelector("[data-list-button]");
  button.disabled = remaining === 0;
  button.innerHTML = `<span>Show more</span><span class="list__remaining">${remaining}</span>`;
};

const initializePage = () => {
  displayBooks(matches, document.createDocumentFragment());
  displaySelectOptions(genres, "[data-search-genres]", "All Genres");
  displaySelectOptions(authors, "[data-search-authors]", "All Authors");
  checkAndSetTheme();

  document
    .querySelector("[data-search-form]")
    .addEventListener("submit", handleSearchFormSubmit);
  document.querySelector("[data-list-button]").addEventListener("click", () => {
    page++;
    updateBookList();
  });
};

document.addEventListener("DOMContentLoaded", initializePage);
