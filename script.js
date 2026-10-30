import { supabase } from "./supabase-client.js";

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const menuItems = document.querySelector(".menu-items");
const cart = new Map();
let products = [];
const confirmation = document.createElement("div");
confirmation.className = "cart-confirmation";
confirmation.setAttribute("role", "status");
confirmation.setAttribute("aria-live", "polite");
document.body.append(confirmation);
let confirmationTimer;

const money = (value) => new Intl.NumberFormat("en-US").format(value);

const closeMenu = () => {
  navigation?.classList.remove("is-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Open navigation menu");
};

menuToggle?.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") === "true";
  navigation?.classList.toggle("is-open", !open);
  menuToggle.setAttribute("aria-expanded", String(!open));
  menuToggle.setAttribute("aria-label", open ? "Open navigation menu" : "Close navigation menu");
});
navigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

const cartButton = document.querySelector("header > button:not(.menu-toggle)");
cartButton?.setAttribute("type", "button");
cartButton?.setAttribute("aria-label", "Open shopping cart");
cartButton?.addEventListener("click", () => document.querySelector(".cart-drawer")?.classList.add("is-open"));

const cartDrawer = document.createElement("aside");
cartDrawer.className = "cart-drawer";
cartDrawer.setAttribute("aria-label", "Shopping cart");
cartDrawer.innerHTML = '<div class="cart-header"><h2>Your cart</h2><button class="cart-close" type="button" aria-label="Close shopping cart">×</button></div><div class="cart-items"></div><div class="cart-footer"><div class="cart-total"><span>Subtotal</span><strong></strong></div><button class="continue-shopping" type="button">Continue shopping</button></div>';
document.body.append(cartDrawer);

const cartItems = cartDrawer.querySelector(".cart-items");
const cartTotal = cartDrawer.querySelector(".cart-total strong");
cartDrawer.querySelector(".cart-close").addEventListener("click", () => cartDrawer.classList.remove("is-open"));
cartDrawer.querySelector(".continue-shopping").addEventListener("click", () => cartDrawer.classList.remove("is-open"));

function updateCartButton() {
  const quantity = [...cart.values()].reduce((sum, item) => sum + item.quantity, 0);
  cartButton.textContent = quantity ? `Cart (${quantity})` : "Order Now";
}

function renderCart() {
  cartItems.replaceChildren();
  let subtotal = 0;
  if (!cart.size) {
    const empty = document.createElement("p");
    empty.className = "cart-empty";
    empty.textContent = "Your cart is empty.";
    cartItems.append(empty);
  }
  cart.forEach((item, id) => {
    subtotal += item.price * item.quantity;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `<img src="${item.image_url}" alt=""><div class="cart-item-info"><h3>${item.name}</h3><span>${money(item.price)}</span><div class="cart-controls"><button type="button" data-action="decrease" data-id="${id}" aria-label="Decrease ${item.name}">−</button><strong>${item.quantity}</strong><button type="button" data-action="increase" data-id="${id}" aria-label="Increase ${item.name}">+</button><button type="button" class="cart-remove" data-action="remove" data-id="${id}">Remove</button></div></div>`;
    cartItems.append(row);
  });
  cartTotal.textContent = money(subtotal);
  updateCartButton();
}

function addToCart(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  const current = cart.get(id);
  cart.set(id, { ...product, quantity: current ? current.quantity + 1 : 1 });
  renderCart();
  confirmation.textContent = `${product.name} added to your cart.`;
  confirmation.classList.add("is-visible");
  clearTimeout(confirmationTimer);
  confirmationTimer = setTimeout(() => confirmation.classList.remove("is-visible"), 2200);
  cartDrawer.classList.add("is-open");
}

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;
  const item = cart.get(button.dataset.id);
  if (!item) return;
  if (button.dataset.action === "increase") item.quantity += 1;
  if (button.dataset.action === "decrease") item.quantity -= 1;
  if (button.dataset.action === "remove" || item.quantity <= 0) cart.delete(button.dataset.id);
  renderCart();
});

async function loadProducts() {
  const { data, error } = await supabase.from("products").select("id,name,description,image_url,price").eq("is_available", true).order("created_at");
  if (error) throw error;
  products = data;
  menuItems.replaceChildren();
  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "menu-card";
    const image = document.createElement("img");
    image.src = product.image_url;
    image.alt = product.name;
    const title = document.createElement("h3");
    title.textContent = product.name;
    const description = document.createElement("p");
    description.textContent = product.description;
    const button = document.createElement("button");
    button.className = "add-to-cart";
    button.type = "button";
    button.textContent = "Add to Cart";
    button.addEventListener("click", () => addToCart(product.id));
    const price = document.createElement("span");
    price.textContent = money(product.price);
    card.append(image, title, description, button, price);
    menuItems.append(card);
  });
}

renderCart();
loadProducts().catch(() => {
  menuItems.replaceChildren();
  const message = document.createElement("p");
  message.textContent = "Menu unavailable. Please try again shortly.";
  menuItems.append(message);
});
