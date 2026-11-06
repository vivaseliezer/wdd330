import { getLocalStorage, setLocalStorage } from "./utils.mjs";

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  const productList = document.querySelector(".product-list");

  if (cartItems.length === 0) {
    productList.innerHTML = "<p>Your cart is currently empty.</p>";
    renderCartTotal(cartItems);
    return;
  }

  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  productList.innerHTML = htmlItems.join("");

  document.querySelectorAll(".cart-card__remove").forEach((button) => {
    button.addEventListener("click", removeFromCartHandler);
  });

  renderCartTotal(cartItems);
}

function renderCartTotal(cartItems) {
  const cartFooter = document.querySelector(".cart-footer");
  const cartTotal = document.querySelector(".cart-total");

  if (!cartFooter || !cartTotal) return;

  if (cartItems.length > 0) {
    cartFooter.classList.remove("hide");
    const total = cartItems.reduce(
      (sum, item) => sum + Number(item.FinalPrice),
      0,
    );
    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
  } else {
    cartFooter.classList.add("hide");
  }
}

function removeFromCartHandler(e) {
  const id = e.target.dataset.id;
  const cartItems = getLocalStorage("so-cart") || [];
  const index = cartItems.findIndex((item) => item.Id === id);

  if (index !== -1) {
    cartItems.splice(index, 1);
    setLocalStorage("so-cart", cartItems);
    renderCartContents();
  }
}

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
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">$${item.FinalPrice}</p>
  <span class="cart-card__remove" data-id="${item.Id}" title="Remove item">X</span>
</li>`;

  return newItem;
}

renderCartContents();
