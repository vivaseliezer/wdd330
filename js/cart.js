// Import the helper that reads data from the browser's localStorage.
import { getLocalStorage } from "./utils.mjs";

// Reads the cart from localStorage and displays every item on the page.
function renderCartContents() {
  // Get the saved cart. If nothing is stored yet (empty cart),
  // use an empty array so .map() doesn't crash.
  const cartItems = getLocalStorage("so-cart") ?? [];

  // Turn each cart item into an HTML string using the template below.
  const htmlItems = cartItems.map((item) => cartItemTemplate(item));

  // Insert all the item HTML into the product list on the cart page.
  document.querySelector(".product-list").innerHTML = htmlItems.join("");

  // Show the total below the list (only when the cart has items).
  renderCartTotal(cartItems);
}

// Builds the HTML for a single cart item from its product data.
function cartItemTemplate(item) {
  const newItem = `<li class="cart-card divider">
  <a href="#" class="cart-card__image">
    <img
      src="${item.Image}"
      alt="${item.Name}"
    />
  </a>
  <a href="#">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${item.Colors[0].ColorName}</p>
  <!-- Show the saved quantity, or 1 if no quantity was stored -->
  <p class="cart-card__quantity">qty: ${item.Quantity || 1}</p>
  <p class="cart-card__price">$${item.FinalPrice}</p>
</li>`;

  return newItem;
}

// Adds up the price of every item, multiplied by its quantity.
function calculateTotal(cartItems) {
  return cartItems.reduce(
    (sum, item) => sum + item.FinalPrice * (item.Quantity || 1),
    0,
  );
}

// Shows the cart total on the page, but only if the cart has items.
function renderCartTotal(cartItems) {
  const container = document.querySelector("#cart-total-container");

  // Clear any total that was shown before.
  container.innerHTML = "";

  // Empty cart: show nothing.
  if (cartItems.length === 0) {
    return;
  }

  // Copy the template's content so the original stays unchanged.
  const template = document.querySelector("#cart-total-template");
  const clone = template.content.cloneNode(true);

  // Fill in the total, formatted with two decimal places.
  clone.querySelector(".cart-total__amount").textContent =
    calculateTotal(cartItems).toFixed(2);

  // Add the filled-in copy to the page.
  container.appendChild(clone);
}

renderCartContents();
