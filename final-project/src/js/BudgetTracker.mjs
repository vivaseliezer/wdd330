import { alertMessage, getLocalStorage, setLocalStorage } from "./utils.mjs";

export default class BudgetTracker {
  constructor(listElement, totalElement, formElement) {
    this.key = "tc-budgets";
    this.listElement = listElement;
    this.totalElement = totalElement;
    this.formElement = formElement;
    this.exchangeRate = 0.92;
    this.homeCurrency = "USD";
    this.targetCurrency = "EUR";
  }

  init() {
    this.render();

    this.formElement?.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!this.formElement.checkValidity()) {
        this.formElement.reportValidity();
        return;
      }
      this.addExpense();
    });

    this.listElement?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove-id]");
      if (btn) {
        this.removeExpense(btn.dataset.removeId);
      }
    });

    window.addEventListener("exchangeRateUpdated", (e) => {
      if (e.detail) {
        this.homeCurrency = e.detail.from;
        this.targetCurrency = e.detail.to;
        this.exchangeRate = e.detail.unitRate;
        this.render();
      }
    });
  }

  getItems() {
    return getLocalStorage(this.key, []);
  }

  addExpense() {
    const descInput = this.formElement.querySelector("#budget-desc");
    const catSelect = this.formElement.querySelector("#budget-category");
    const amountInput = this.formElement.querySelector("#budget-amount");
    const countryInput = this.formElement.querySelector("#budget-country");

    const description = descInput?.value.trim();
    const category = catSelect?.value || "General";
    const amount = Number(amountInput?.value || 0);
    const destination = countryInput?.value.trim() || "General Trip";

    if (!description || amount <= 0) {
      alertMessage("Please provide a valid expense description and amount.", "error");
      return;
    }

    const items = this.getItems();
    items.push({
      id: Date.now().toString(),
      description,
      category,
      destination,
      amount,
    });

    setLocalStorage(this.key, items);
    this.formElement.reset();
    alertMessage(`Added "${description}" ($${amount.toFixed(2)}) to your Trip Budget.`, "success");
    this.render();
  }

  removeExpense(id) {
    const items = this.getItems().filter((item) => item.id !== id);
    setLocalStorage(this.key, items);
    this.render();
  }

  render() {
    if (!this.listElement || !this.totalElement) return;
    const items = this.getItems();

    if (items.length === 0) {
      this.listElement.innerHTML = `<li class="empty-note">No trip expenses added yet. Add flights, lodging, or meals above!</li>`;
      this.totalElement.innerHTML = `Total Budget: <strong>0.00 ${this.homeCurrency}</strong>`;
      return;
    }

    this.listElement.innerHTML = items
      .map((item) => {
        const converted = (Number(item.amount) * this.exchangeRate).toFixed(2);
        return `<li class="budget-item">
          <div class="budget-item__info">
            <strong>${item.description}</strong>
            <span class="budget-item__tag">${item.category} &bull; ${item.destination}</span>
          </div>
          <div class="budget-item__Right">
            <span class="budget-item__amount">${Number(item.amount).toFixed(2)} ${this.homeCurrency} <small>(${converted} ${this.targetCurrency})</small></span>
            <button type="button" class="remove-btn" data-remove-id="${item.id}" aria-label="Remove ${item.description}">&times;</button>
          </div>
        </li>`;
      })
      .join("");

    const totalHome = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalLocal = totalHome * this.exchangeRate;

    this.totalElement.innerHTML = `
      Total Trip Budget: <strong>${totalHome.toFixed(2)} ${this.homeCurrency}</strong>
      <span class="total-converted">(&approx; ${totalLocal.toFixed(2)} ${this.targetCurrency})</span>
    `;
  }
}
