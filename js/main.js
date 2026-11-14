// Import the class that reads product data from the JSON files.
import ProductData from "./ProductData.mjs";
// Import the class that builds the list of product cards.
import ProductList from "./ProductList.mjs";


// Create a data source for the "tents" category (reads tents.json).
const dataSource = new ProductData("tents");

// Find the <ul> on the home page where the cards will go.
const listElement = document.querySelector(".product-list");

// Create the product list for tents and display it.
const productList = new ProductList("tents", dataSource, listElement);
productList.init();