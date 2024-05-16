import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

let page = 1;
let matches = books;

const starting = document.createDocumentFragment();
function createBookElement({ author, id, image, title }) {
  const element = document.createElement("button");
  element.classList = "preview";
  element.setAttribute("data-preview", id);
  element.innerHTML = `
    <img class="preview__image" src="${image}"/>
    <div class="preview__info">
      <h3 class="preview__title">${title}</h3>
      <div class="preview__author">${authors[author]}</div>
    </div>
  `;
  return element;
}

function renderBooks(matches, starting) {
  const BOOKS_PER_PAGE = 10;
  for (const book of matches.slice(0, BOOKS_PER_PAGE)) {
    const bookElement = createBookElement(book);
    starting.appendChild(bookElement);
  }

  document.querySelector("[data-list-items]").appendChild(starting);
}
renderBooks(matches, starting);

function createSelectElemt(options, defaultOptionText) {
  const selectElement = document.createElement("select");
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
}

function displaySelectedOprions(options, targetSelector, defaultOptionText) {
  const selectHtml = createSelectElemt(options, defaultOptionText);
  document.querySelector(targetSelector).appendChild(selectHtml);
}

displaySelectedOprions(genres, "[data-search-genres]", "All Genres");
displaySelectedOprions(authors, "[data-search-authors]", "All Authors");

function setThemeColors(theme) {
  const darkColor = theme === "night" ? "255, 255, 255" : "10, 10, 20";
  const lightColor = theme === "night" ? "10, 10, 20" : "255, 255, 255";

  document.querySelector("[data-settings-theme]").value = theme;
  document.documentElement.style.setProperty("--color-dark", darkColor);
  document.documentElement.style.setProperty("--color-light", lightColor);
}

function checkAndSetTheme() {
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  setThemeColors(prefersDarkScheme.matches ? "night" : "day");
  prefersDarkScheme.addEventListener("change", () => {
    setThemeColors(prefersDarkScheme.matches ? "night" : "day");
  });
}

checkAndSetTheme();

document.querySelector("[data-list-button]").innerText = `Show more (${
  books.length - page * BOOKS_PER_PAGE
})`;
document.querySelector("[data-list-button]").disabled =
  matches.length - page * BOOKS_PER_PAGE < 1;

document
  .querySelector("[data-search-form]")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = books.filter((book) => {
      const { title, author, genres } = book;
      const { genre, title: searchTitle, author: searchAuthor } = filters;
      return (
        (searchTitle.trim() === "" ||
          title.toLowerCase().includes(searchTitle.toLowerCase())) &&
        (searchAuthor === "any" || author === searchAuthor) &&
        (genre === "any" || genres.includes(genre))
      );
    });

    page = 1;
    matches = result;

    const listItems = document.querySelector("[data-list-items]");
    listItems.innerHTML = "";
    renderBooks(matches, document.createDocumentFragment());

    document
      .querySelector("[data-list-message]")
      .classList.toggle("list__message_show", result.length === 0);

    document.querySelector("[data-search-overlay]").open = false;
  });

document.querySelector("[data-list-button]").addEventListener("click", () => {
  const fragment = document.createDocumentFragment();
  const startIndex = page * BOOKS_PER_PAGE;
  const endIndex = startIndex + BOOKS_PER_PAGE;
  const booksToShow = matches.slice(startIndex, endIndex);

  booksToShow.forEach((book) => {
    const bookElement = createBookElement(book);
    fragment.appendChild(bookElement);
  });

  document.querySelector("[data-list-items]").appendChild(fragment);
  page += 1;
  document.querySelector("[data-list-button]").disabled =
    matches.length - page * BOOKS_PER_PAGE < 1;
});

document
  .querySelector("[data-list-items]")
  .addEventListener("click", (event) => {
    const pathArray = Array.from(event.composedPath());
    const previewElement = pathArray.find((node) => node.dataset?.preview);
    const active =
      previewElement &&
      books.find((book) => book.id === previewElement.dataset.preview);

    if (active) {
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
  });
