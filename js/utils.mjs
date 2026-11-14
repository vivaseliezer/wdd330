// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}


// Retrieves value of the named parameter when requested
// and exports it for other JavaScript files to use.
export function getParam(param) {
  // window.location.search gets everything after the ? in the URL.
  const queryString = window.location.search;

  // urlParams.get(param) retrieves the value of the parameter you request.
  const urlParams = new URLSearchParams(queryString);
  
  // Returns the values
  return urlParams.get(param)
}


export function renderListWithTemplate(
  templateFn,
  parentElement,
  list,
  position = "afterbegin",
  clear = false,
) {
    
    // Remove the existing content first if clear is true.
    if (clear) {
      parentElement.innerHTML = "";
    }

    // Convert each product object into an HTML string with the template function.
    const htmlStrings = list.map(templateFn);
    // Join the strings into one block and insert it at the start of the list element.
    parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}
  