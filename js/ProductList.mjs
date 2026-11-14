// Import the shared function that renders a list using a template.
import { renderListWithTemplate } from "./utils.mjs";


// Builds the HTML for one product card from a product object.
// Each ${...} placeholder is filled with a field from tents.json.
function productCardTemplate(product) {
  const isDiscounted = product.FinalPrice < product.SuggestedRetailPrice;
  const discountPercent = isDiscounted
    ? Math.round(
        ((product.SuggestedRetailPrice - product.FinalPrice) /
          product.SuggestedRetailPrice) *
          100,
      )
    : 0;
  const discountMarkup = isDiscounted
    ? `<p class="product-card__discount"><span class="product-card__original-price">$${product.SuggestedRetailPrice.toFixed(2)}</span> <span class="product-card__badge">-${discountPercent}%</span></p>`
    : "";

  return `<li class="product-card">
    <a href="product_pages/?product=${product.Id}">
      <img
        src="${product.Image}"
        alt="${product.Name}"
      />
      <h3 class="card__brand">${product.Brand.Name}</h3>
      <h2 class="card__name">${product.NameWithoutBrand}</h2>
      <p class="product-card__price">$${product.FinalPrice}</p>
      ${discountMarkup}
    </a>
  </li>`;
}

// Products that have an image file in public/images/tents.
// The JSON also lists 989CG and 880RT, but their images don't exist in the starter repo.
const availableIds = ["880RR", "985RF", "985PR", "344YJ"];


// Creates a list of product cards for one category (e.g. "tents").
export default class ProductList {
    constructor(category, dataSource, listElement) {
        // The product category, such as "tents".
        this.category = category;
        // The object that fetches the product data (a ProductData instance).
        this.dataSource = dataSource;
        // The HTML element the cards will be inserted into.
        this.listElement = listElement;
    }


    // Gets the product data, then displays it.
    async init() {

        // Wait for the data source to return the  fill list of products.
        const list = await this.dataSource.getData();
        // Keep only the products that have an image available.
        const availableProducts = list.filter((product) =>
            availableIds.includes(product.Id),
        );
        // Render only the available products on the page.
        this.renderList(availableProducts);
    }

    // Turns an array of products into HTML cards and adds them to the page.
    renderList(list) {
        // Use the shared utility to render the product cards.
        renderListWithTemplate(productCardTemplate, this.listElement, list);
    }
}
