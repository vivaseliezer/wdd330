// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

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

// update superscript number of items on backpack cart icon
export function updateCartCount() {
  const cartLink = document.querySelector(".cart a");
  if (!cartLink) return;

  const cartItems = getLocalStorage("so-cart") || [];
  let badge = cartLink.querySelector(".cart-count");

  if (!badge) {
    badge = document.createElement("span");
    badge.className = "cart-count";
    cartLink.appendChild(badge);
  }

  if (cartItems.length > 0) {
    badge.textContent = cartItems.length;
    badge.classList.remove("hide");
  } else {
    badge.textContent = "";
    badge.classList.add("hide");
  }
}
