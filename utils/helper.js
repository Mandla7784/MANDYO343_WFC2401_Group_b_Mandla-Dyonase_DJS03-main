import { authors } from "/data.js";
/**
 * Creates a book element with the given properties.
 * @param {Object} book - The book object containing author, id, image, and title.
 * @returns {HTMLButtonElement} - The created book element.
 */
export const createBookElement = ({ author, id, image, title }) => {
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

/**
 * Creates a document fragment containing option elements for each option in the given object.
 *
 * @param {Object} options - The object containing the options.
 * @param {string} defaultOptionText - The text to be displayed for the default option.
 * @return {DocumentFragment} - The created document fragment.
 */
export const createOptionElement = (options, defaultOptionText) => {
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
