import { getParam } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";

// Create a data source for the tent category
const dataSource = new ProductData("tents");

// Get the product ID from the URL parameter.
const productId = getParam("product");

// Creates a ProductDetails instance.
const product = new ProductDetails(productId, dataSource);

// Initializes the product details page.
product.init();

// console.log("Product.js is running");
