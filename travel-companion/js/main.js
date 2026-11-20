import ExternalServices from "./ExternalServices.mjs";
import CountryList from "./CountryList.mjs";
import CurrencyConverter from "./CurrencyConverter.mjs";
import BudgetTracker from "./BudgetTracker.mjs";
import CountryDetails from "./CountryDetails.mjs";
import {
  getLocalStorage,
  getParam,
  loadHeaderFooter,
  setLocalStorage,
  updateFavoriteBadge,
} from "./utils.mjs";

loadHeaderFooter(".");

const services = new ExternalServices();

// 1. Home Page: Country Explorer Grid + Search + Region Filter
const countryListEl = document.getElementById("country-list");
if (countryListEl) {
  const countryList = new CountryList(services, countryListEl);
  countryList.init();

  const searchInput = document.getElementById("country-search");
  const regionSelect = document.getElementById("region-filter");

  const applyFilter = () => {
    countryList.filterCountries(
      searchInput?.value || "",
      regionSelect?.value || "all",
    );
  };

  searchInput?.addEventListener("input", applyFilter);
  regionSelect?.addEventListener("change", applyFilter);
}

// 2. Country Detail Page
const detailContainer = document.getElementById("country-detail-container");
if (detailContainer) {
  const code = getParam("code") || "ESP";
  const details = new CountryDetails(code, services, detailContainer);
  details.init();
}

// 3. Live Currency Converter (present on Home, Detail, and Budget pages)
const converterForm = document.getElementById("converter-form");
const converterResult = document.getElementById("converter-result");
if (converterForm && converterResult) {
  const converter = new CurrencyConverter(services, converterForm, converterResult);
  converter.init();
}

// 4. Trip Budget Builder
const budgetListEl = document.getElementById("budget-list");
const budgetTotalEl = document.getElementById("budget-total");
const budgetFormEl = document.getElementById("budget-form");
if (budgetListEl && budgetTotalEl) {
  const tracker = new BudgetTracker(budgetListEl, budgetTotalEl, budgetFormEl);
  tracker.init();
}

// 5. Saved Favorite Destinations list (on budget.html)
const savedFavsEl = document.getElementById("saved-favorites-list");
function renderSavedFavorites() {
  if (!savedFavsEl) return;
  const favs = getLocalStorage("tc-favorites", []);
  if (favs.length === 0) {
    savedFavsEl.innerHTML = `<li class="empty-note">You haven't saved any favorite countries yet. Click the ★ icon on any country card!</li>`;
    return;
  }
  savedFavsEl.innerHTML = favs
    .map(
      (f) => `<li class="saved-fav-card">
        <img src="${f.flag}" alt="Flag of ${f.name}" />
        <div>
          <h4><a href="country.html?code=${f.cca3}">${f.name}</a></h4>
          <p>${f.capital} &bull; ${f.region} &bull; Currency: <strong>${f.currency}</strong></p>
        </div>
        <button type="button" class="remove-btn" data-remove-fav="${f.cca3}" aria-label="Remove ${f.name}">&times;</button>
      </li>`,
    )
    .join("");
}

if (savedFavsEl) {
  renderSavedFavorites();
  savedFavsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove-fav]");
    if (btn) {
      const updated = getLocalStorage("tc-favorites", []).filter(
        (f) => f.cca3 !== btn.dataset.removeFav,
      );
      setLocalStorage("tc-favorites", updated);
      updateFavoriteBadge();
      renderSavedFavorites();
    }
  });
}
