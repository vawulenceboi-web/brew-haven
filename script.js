import { supabase } from "./supabase-client.js";

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const menuItems = document.querySelector(".menu-items");

if (menuToggle && navigation) {
  const closeMenu = () => {
    navigation.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  };
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    navigation.classList.toggle("is-open", !open);
    menuToggle.setAttribute("aria-expanded", String(!open));
    menuToggle.setAttribute("aria-label", open ? "Open navigation menu" : "Close navigation menu");
  });
  navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
}

const money = (value) => new Intl.NumberFormat("en-US").format(value);

async function loadProducts() {
  const { data, error } = await supabase.from("products").select("id,name,description,image_url,price").eq("is_available", true).order("created_at");
  if (error) throw error;
  if (!menuItems) return;
  menuItems.replaceChildren();
  data.forEach((product) => {
    const card = document.createElement("article");
    card.className = "menu-card";
    card.innerHTML = `<img src="${product.image_url}" alt="${product.name}"><h3>${product.name}</h3><p>${product.description}</p><button class="add-to-cart" type="button" data-id="${product.id}">Add to Cart</button><span>${money(product.price)}</span>`;
    menuItems.append(card);
  });
}

loadProducts().catch(() => {
  if (menuItems) menuItems.innerHTML = "<p>Menu unavailable. Please try again shortly.</p>";
});
