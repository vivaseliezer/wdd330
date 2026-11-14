import { getLocalStorage, setLocalStorage } from "./utils.mjs";

export default class ProductDetails {
    constructor(productId, dataSource) {
        // Stores the ID of the tent selected by the user.
        this.productId = productId;
        // Creates an empty object to hold the product details later.
        this.product = {};
        // Provides access to the product data source. 
        this.dataSource = dataSource;
    }


    // Initializes the product details by retrieving the selected product, 
    // displaying it, and setting up the Add to Cart button.
    async init() {
        // Retrieves the selected product using its ID and stores its details.
        this.product = await this.dataSource.findProductById(this.productId);

        // Displays the selected product details.
        this.renderProductDetails();


        // Adds an event listener to the Add to Cart button.
        document
            .getElementById("addToCart")
            .addEventListener("click", () => {
                console.log("Add to Cart clicked");
                this.addProductToCart(this.product);
            });
    }

    addProductToCart(product) {
      // Retrieves existing products; Creates an empty array if no cart exists
      let cart = getLocalStorage("so-cart") || [];
      // Make sure cart is an array
      if (!Array.isArray(cart)) {
        cart = [cart];
      }
    
      // Check whether the product already exists
      const existingProduct = cart.find((item) => item.Id === product.Id);
    
      if (existingProduct) {
        // Increase its quantity
        existingProduct.Quantity = (existingProduct.Quantity || 1) + 1;
      } else {
        // Adds the new product to the array
        cart.push({ ...product, Quantity: 1 });
      }
    
      // Saves the updated array
      setLocalStorage("so-cart", cart);
    }

    // Dynamically displays the selected product's details by 
    // inserting its information into the product-detail section.
    renderProductDetails() {
    const isDiscounted =
      this.product.FinalPrice < this.product.SuggestedRetailPrice;
    const discountAmount = (
      this.product.SuggestedRetailPrice - this.product.FinalPrice
    ).toFixed(2);
    const discountPercent = isDiscounted
      ? Math.round(
          ((this.product.SuggestedRetailPrice - this.product.FinalPrice) /
            this.product.SuggestedRetailPrice) *
            100,
        )
      : 0;
    const discountMarkup = isDiscounted
      ? `<p class="product-card__discount"><span class="product-card__original-price">$${this.product.SuggestedRetailPrice.toFixed(2)}</span> <span class="product-card__badge">Save $${discountAmount} (${discountPercent}% OFF)</span></p>`
      : "";

    document.querySelector(".product-detail").innerHTML = `
        <h3>${this.product.Brand.Name}</h3>
        <h2 class="divider">${this.product.NameWithoutBrand}</h2>
        <img class="divider" src="${this.product.Image}" alt="${this.product.NameWithoutBrand}">
        <p class="product-card__price">$${this.product.FinalPrice}</p>
        ${discountMarkup}
        <p class="product__color">${this.product.Colors[0].ColorName}</p>
        <p class="product__description">${this.product.DescriptionHtmlSimple}</p>
        <div class="product-detail__add">
            <button id="addToCart" data-id="${this.product.Id}">Add to Cart</button>
        </div>
    `;
    }

}