const addToLocalStorage = ({ sku, name, salePrice }) => {
  const arrayToSave = [`${sku};${name};${salePrice}`];
  if (!localStorage.getItem("cart")) {
    localStorage.setItem("cart", JSON.stringify(arrayToSave));
  } else {
    const storedItem = JSON.parse(localStorage.getItem("cart"));
    const itemToStore = [...storedItem, ...arrayToSave];
    localStorage.setItem("cart", JSON.stringify(itemToStore));
  }
};

const removeItemFromStorage = ({ sku, name, salePrice }) => {
  const arrayFromStorage = JSON.parse(localStorage.getItem("cart"));
  const arrayToRemove = [`${sku};${name};${salePrice}`];
  arrayFromStorage.pop(arrayToRemove);
  localStorage.setItem("cart", JSON.stringify(arrayFromStorage));
};

const sumCartItems = () => {
  const allCartItems = document.querySelectorAll(".cart__item");
  let currentPrice = 0;
  allCartItems.forEach((element) => {
    const stringPrice = element.innerText.match(/\$\d+(\.\d+)?/g)[0];
    const realPrice = Number(stringPrice.substring(1));
    currentPrice += realPrice;
  });
  const elementToAppend = document.querySelector(".total-price");
  elementToAppend.innerText = currentPrice;
};

function createProductImageElement(imageSource) {
  const img = document.createElement("img");
  img.className = "item__image";
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}
const loadingElement = createCustomElement("p", "loading", "loading...");

const getSiblingThatContainsID = (element) => {
  const { children } = element.parentElement;
  let foundElement = "";
  Array.from(children).forEach((child) => {
    const classOfElement = child.className;
    if (classOfElement === "item__sku") {
      foundElement = child.innerText;
    }
  });
  return foundElement;
};

const getIdFromElement = (element) => {
  const stringID = element.innerText.split("|")[0].split(":")[1].trim();
  return stringID;
};

const removeElement = async (element) => {
  const elId = getIdFromElement(element);
  const cart = document.querySelector(".cart");
  const loadingElementForRemove = createCustomElement("p", "loading", "loading...");
  cart.insertBefore(loadingElementForRemove, cart.firstChild);
  const res = await fetch(`https://api.mercadolibre.com/items/${elId}`);
  cart.removeChild(loadingElementForRemove);
  const { id, title, price } = res.json();
  const params = {
    sku: id,
    name: title,
    salePrice: price,
  };
  removeItemFromStorage(params);
  element.parentElement.removeChild(element);
  sumCartItems();
};

function cartItemClickListener(event) {
  const thisElement = event.target;
  removeElement(thisElement);
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement("li");
  li.className = "cart__item";
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener("click", cartItemClickListener);
  return li;
}

const renderedBtnListener = async (e) => {
  const elId = getSiblingThatContainsID(e.target);
  const cart = document.querySelector(".cart");
  cart.insertBefore(loadingElement, cart.firstChild);
  const res = await fetch(`https://api.mercadolibre.com/items/${elId}`);
  cart.removeChild(loadingElement);
  const { id, title, price } = await res.json();
  const params = {
    sku: id,
    name: title,
    salePrice: price,
  };
  const createdCardItemElement = createCartItemElement(params);
  document.querySelector(".cart__items").appendChild(createdCardItemElement);
  addToLocalStorage(params);
  sumCartItems();
};

function createProductItemElement({ sku, name, image, price, time }) {
  const section = document.createElement("section");
  const div = document.createElement("div");
  div.className = "item__div";
  section.className = "item";
  if (time) section.style.animationDelay = time;
  div.appendChild(createProductImageElement(image));
  div.appendChild(createCustomElement("span", "item__price", price));
  section.appendChild(div);
  section.appendChild(createCustomElement("span", "item__sku", sku));
  section.appendChild(createCustomElement("span", "item__title", name));
  const renderedItemButton = createCustomElement("button", "item__add", "Adicionar ao carrinho!");
  renderedItemButton.addEventListener("click", renderedBtnListener);
  section.appendChild(renderedItemButton);

  return section;
}
//           Remove children
const removeChildren = (parent) => {
  parent.innerHTML = "";
};

const renderResults = (items) => {
  const itemContainer = document.querySelector(".items");
  removeChildren(itemContainer);
  let animTime = 0.6;
  items.forEach(({ id, title, thumbnail, price }) => {
    const newPrice = Math.round((price * 100) / 100).toFixed(2);
    const params = {
      sku: id,
      name: title,
      image: thumbnail,
      price: `R$: ${newPrice}`,
      time: `${animTime}s`,
    };
    animTime += 0.1;
    const element = createProductItemElement(params);
    itemContainer.appendChild(element);
  });
};

const getResults = async (item = "Monitor") => {
  const response = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${item}`);
  const { results } = await response.json();
  renderResults(results);
};

const loadCartFromStorage = async () => {
  const arrToRender = JSON.parse(localStorage.getItem("cart"));
  arrToRender.forEach((element) => {
    const [id, title, price] = element.split(";");
    const params = {
      sku: id,
      name: title,
      salePrice: price,
    };
    const createdCardItemElement = createCartItemElement(params);
    document.querySelector(".cart__items").appendChild(createdCardItemElement);
  });
  sumCartItems();
};

//                         Listeners
const setMainBtnListener = () => {
  const mainBtns = document.querySelectorAll(".header_button__main");
  mainBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const selectedBtn = document.querySelector(".header_button__main___selected");
      if (selectedBtn === e.target) {
        removeClassFromSelectedAndWindow(selectedBtn);
        return;
      }
      if (selectedBtn) {
        removeClassFromSelectedAndWindow(selectedBtn);
      }
      e.target.classList.add("header_button__main___selected");
      e.target.nextElementSibling.classList.remove("header_button_ul__invisible");
      addEventListenerWindow();
    });
  });
};

// Event Listener for Window

const windowEventListener = (e) => {
  const selectedBtn = document.querySelector(".header_button__main___selected");
  if (e.target !== selectedBtn) {
    removeClassFromSelectedAndWindow(selectedBtn);
  }
};

const addEventListenerWindow = () => {
  window.addEventListener("click", windowEventListener);
};

const loadEmptyCart = () => {
  document.querySelector(".empty-cart").addEventListener("click", () => {
    const allCartItems = document.querySelectorAll(".cart__item");
    allCartItems.forEach((element) => {
      removeElement(element);
    });
    sumCartItems();
  });
};
//               Remove The selected Class, and window Listener
const removeClassFromSelectedAndWindow = (selectedBtn) => {
  selectedBtn.nextElementSibling.classList.add("header_button_ul__invisible");
  selectedBtn.classList.remove("header_button__main___selected");
  window.removeEventListener("click", windowEventListener);
};

const addEventListenerLis = () => {
  const lis = document.querySelectorAll(".header_button_li");
  lis.forEach((li) => {
    li.addEventListener("click", (e) => {
      getResults(e.target.innerText);
    });
  });
};

//                   Implementing a debounce for mercado Libre search API
let timeout;
let delay = 500;

const addFiltrarEventListener = () => {
  const searchInput = document.querySelector("#filtrar");
  searchInput.addEventListener("keyup", (e) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      console.log(e.target.value);
      getResults(e.target.value);
    }, delay);
  });
};

const loadbuttons = () => {
  loadEmptyCart();
  setMainBtnListener();
  addEventListenerLis();
  addFiltrarEventListener();
};

window.onload = function onload() {
  loadCartFromStorage();
  loadbuttons();
};
