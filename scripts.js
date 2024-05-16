import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

let page = 1;
let matches = books;

const starting = document.createDocumentFragment();

/**
 * Creates a book element with the given properties.
 * @param {Object} book - The book object containing author, id, image, and title.
 * @returns {HTMLButtonElement} - The created book element.
 */
const createBookElement = ({ author, id, image, title }) => {
  // Create a new button element
  const element = document.createElement("button");

  // Set the class and data attribute of the button
  element.classList = "preview";
  element.setAttribute("data-preview", id);

  // Set the inner HTML of the button to include the book's image, title, and author
  element.innerHTML = `
    <!-- Book image -->
    <img
      class="preview__image"
      src="${image}"
    />
    
    <!-- Book information -->
    <div class="preview__info">
      <!-- Book title -->
      <h3 class="preview__title">${title}</h3>
      
      <!-- Book author -->
      <div class="preview__author">${authors[author]}</div>
    </div>
`;

  // Return the created book element
  return element;
};

for (const { author, id, image, title } of matches.slice(0, BOOKS_PER_PAGE)) {
  const element = createBookElement({ author, id, image, title });
  starting.appendChild(element);
}

document.querySelector("[data-list-items]").appendChild(starting);

/**
 * Creates a document fragment containing option elements for each option in the given object.
 *
 * @param {Object} options - The object containing the options.
 * @param {string} defaultOptionText - The text to be displayed for the default option.
 * @return {DocumentFragment} - The created document fragment.
 */
const createOptionElement = (options, defaultOptionText) => {
  // Create a document fragment to hold the option elements.
  const fragment = document.createDocumentFragment();

  // Create the first option element for the default option.
  const firstElement = document.createElement("option");
  firstElement.value = "any"; // Set the value of the option to "any".
  firstElement.innerText = defaultOptionText; // Set the text of the option to the default option text.
  fragment.appendChild(firstElement); // Add the first option element to the document fragment.

  // Iterate over the options object.
  for (const [id, name] of Object.entries(options)) {
    // Create a new option element.
    const element = document.createElement("option");
    element.value = id; // Set the value of the option to the key of the current option.
    element.innerText = name; // Set the text of the option to the value of the current option.
    fragment.appendChild(element); // Add the option element to the document fragment.
  }

  // Return the created document fragment.
  return fragment;
};

const genreHtml = createOptionElement(genres, "All Genres");
document.querySelector("[data-search-genres]").appendChild(genreHtml);

const authorsHtml = createOptionElement(authors, "All Authors");
document.querySelector("[data-search-authors]").appendChild(authorsHtml);

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

checkAndSetTheme();

document.querySelector("[data-list-button]").innerText = `Show more (${
  books.length - BOOKS_PER_PAGE
})`;
document.querySelector("[data-list-button]").disabled =
  matches.length - page * BOOKS_PER_PAGE > 0;

document.querySelector("[data-list-button]").innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${
      matches.length - page * BOOKS_PER_PAGE > 0
        ? matches.length - page * BOOKS_PER_PAGE
        : 0
    })</span>
`;

document.querySelector("[data-search-cancel]").addEventListener("click", () => {
  document.querySelector("[data-search-overlay]").open = false;
});

document
  .querySelector("[data-settings-cancel]")
  .addEventListener("click", () => {
    document.querySelector("[data-settings-overlay]").open = false;
  });

document.querySelector("[data-header-search]").addEventListener("click", () => {
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
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);

    if (theme === "night") {
      document.documentElement.style.setProperty(
        "--color-dark",
        "255, 255, 255"
      );
      document.documentElement.style.setProperty("--color-light", "10, 10, 20");
    } else {
      document.documentElement.style.setProperty("--color-dark", "10, 10, 20");
      document.documentElement.style.setProperty(
        "--color-light",
        "255, 255, 255"
      );
    }

    document.querySelector("[data-settings-overlay]").open = false;
  });

document
  .querySelector("[data-search-form]")
  .addEventListener("submit", (event) => {
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

    if (result.length < 1) {
      document
        .querySelector("[data-list-message]")
        .classList.add("list__message_show");
    } else {
      document
        .querySelector("[data-list-message]")
        .classList.remove("list__message_show");
    }

    document.querySelector("[data-list-items]").innerHTML = "";
    const newItems = document.createDocumentFragment();

    for (const { author, id, image, title } of result.slice(
      0,
      BOOKS_PER_PAGE
    )) {
      const element = createBookElement({ author, id, image, title });
      newItems.appendChild(element);
    }

    document.querySelector("[data-list-items]").appendChild(newItems);
    document.querySelector("[data-list-button]").disabled =
      matches.length - page * BOOKS_PER_PAGE < 1;

    document.querySelector("[data-list-button]").innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${
      matches.length - page * BOOKS_PER_PAGE > 0
        ? matches.length - page * BOOKS_PER_PAGE
        : 0
    })</span>
  `;

    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelector("[data-search-overlay]").open = false;
  });

document.querySelector("[data-list-button]").addEventListener("click", () => {
  const fragment = document.createDocumentFragment();

  for (const { author, id, image, title } of matches.slice(
    page * BOOKS_PER_PAGE,
    (page + 1) * BOOKS_PER_PAGE
  )) {
    const element = createBookElement({ author, id, image, title });
    fragment.appendChild(element);
  }

  document.querySelector("[data-list-items]").appendChild(fragment);
  page += 1;
});

document
  .querySelector("[data-list-items]")
  .addEventListener("click", (event) => {
    const pathArray = Array.from(event.path || event.composedPath());
    let active = null;

    for (const node of pathArray) {
      if (active) break;

      if (node?.dataset?.preview) {
        let result = null;

        for (const singleBook of books) {
          if (result) break;
          if (singleBook.id === node?.dataset?.preview) result = singleBook;
        }

        active = result;
      }
    }

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
