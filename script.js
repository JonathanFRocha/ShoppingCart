const addToLocalStorage = ({ sku, name, salePrice, image }) => {
  const arrayToSave = [`${sku};${name};${salePrice};${image}`];
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
//                        LOCAL STORAGE ABOVE
const sumCartItems = () => {
  const allCartItems = document.querySelectorAll(".cart__item__price");
  let currentPrice = 0;
  allCartItems.forEach((element) => {
    const stringPrice = element.innerText.substring(3);
    const realPrice = parseFloat(stringPrice);
    currentPrice += realPrice;
  });
  const totalPrice = document.querySelector(".total-price");
  totalPrice.innerText = "Preço Total - R$: " + currentPrice.toFixed(2);
};
//                     Update Cart
const updateCart = () => {
  const itemsInCart = document.querySelector(".cart__items").children.length;
  const cartNumber = document.querySelector(".header_cart__itemAmount");
  if (itemsInCart) {
    cartNumber.style.opacity = 1;
    cartNumber.classList.add("header_cart__itemAmount___active");
    setTimeout(() => {
      cartNumber.classList.remove("header_cart__itemAmount___active");
    }, 400);
    cartNumber.innerText = itemsInCart;
  } else {
    cartNumber.style.opacity = 0;
    cartNumber.innerText = "";
  }
};

//
function createProductImageElement(imageSource, classN) {
  const img = document.createElement("img");
  img.className = classN;
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

const removeElement = async (element) => {
  const elId = element.parentElement.id;
  const res = await fetch(`https://api.mercadolibre.com/items/${elId}`);
  const { id, title, price } = res.json();
  const params = {
    sku: id,
    name: title,
    salePrice: price,
  };
  removeItemFromStorage(params);
  element.parentElement.parentElement.removeChild(element.parentElement);
  updateCart();
  sumCartItems();
};

function cartItemClickListener(event) {
  const thisElement = event.target;
  removeElement(thisElement);
}

function createCartItemElement({ id, image, name, salePrice }) {
  const li = document.createElement("li");
  li.className = "cart__item";
  const div = document.createElement("div");
  div.className = "cart__div";
  li.id = id;
  const img = createProductImageElement("./img/delete.svg", "cart__delete");
  img.addEventListener("click", cartItemClickListener);

  li.appendChild(createProductImageElement(image, "cart__image"));
  div.appendChild(createCustomElement("h3", "cart__item__name", name));
  div.appendChild(
    createCustomElement("h4", "cart__item__price", `R$ ${parseFloat(salePrice).toFixed(2)}`)
  );
  li.appendChild(div);
  li.appendChild(img);
  return li;
}

const renderedBtnListener = async (e) => {
  const elId = getSiblingThatContainsID(e.target);
  const cart = document.querySelector(".cart");
  cart.insertBefore(loadingElement, cart.firstChild);
  const res = await fetch(`https://api.mercadolibre.com/items/${elId}`);
  cart.removeChild(loadingElement);
  const { id, thumbnail, title, price } = await res.json();
  const params = {
    id: id,
    image: thumbnail,
    name: title,
    salePrice: price,
  };
  const createdCardItemElement = createCartItemElement(params);
  document.querySelector(".cart__items").appendChild(createdCardItemElement);
  addToLocalStorage(params);
  updateCart();
  sumCartItems();
};
//                  PAGE BTN
const createPageBtn = (page) => {
  const btn = document.createElement("button");
  if (page === "1") {
    btn.classList.add("page_btn", "page_btn_selected");
  } else {
    btn.classList.add("page_btn");
  }
  btn.innerText = page;
  return btn;
};

function createProductItemElement({ sku, name, image, price, time }) {
  const section = document.createElement("section");
  const div = document.createElement("div");
  div.className = "item__div";
  section.className = "item";
  if (time) section.style.animationDelay = time;
  div.appendChild(createProductImageElement(image, "item__image"));
  div.appendChild(createCustomElement("span", "item__price", price));
  section.appendChild(div);
  section.appendChild(createCustomElement("span", "item__sku", sku));
  section.appendChild(createCustomElement("span", "item__title", name));
  const renderedItemButton = createCustomElement("button", "item__add", "Adicionar ao carrinho");
  renderedItemButton.addEventListener("click", renderedBtnListener);
  section.appendChild(renderedItemButton);

  return section;
}
//          get X elements
const getFromXtoY = (x, y, arr) => {
  return arr.slice(x, y);
};

const getPaginatedResponse = (obj) => {
  const length = obj.length;
  const pages = Math.ceil(length / 10);
  const pageMap = {};
  let pageContentAmount = 10;
  for (let i = 1; i <= pages; i += 1) {
    pageMap[i] = getFromXtoY(pageContentAmount - 10, pageContentAmount, obj);
    pageContentAmount += 10;
  }
  return pageMap;
};
//           Remove children
const removeChildren = (...parents) => {
  parents.forEach((parent) => (parent.innerHTML = ""));
};

//          render results from X page

const renderXResults = (arr) => {
  const itemContainer = document.querySelector(".items");
  removeChildren(itemContainer);
  let animTime = 0.6;
  arr.forEach(({ id, title, thumbnail, price }) => {
    const newPrice = price.toFixed(2);
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

const renderPageButtons = (paginatedResults) => {
  const pageBtnDiv = document.querySelector(".items_page_btn");
  for (let page in paginatedResults) {
    const pagebtn = createPageBtn(page);
    pagebtn.addEventListener("click", (e) => {
      const selectedBtn = document.querySelector(".page_btn_selected");
      if (e.target === selectedBtn) {
        return;
      } else {
        selectedBtn.classList.remove("page_btn_selected");
        e.target.classList.toggle("page_btn_selected");
        renderXResults(paginatedResults[page]);
      }
    });
    pageBtnDiv.appendChild(pagebtn);
  }
};

const renderFirstResults = (items) => {
  const paginatedObjected = getPaginatedResponse(items);
  const pageBtnContainer = document.querySelector(".items_page_btn");
  removeChildren(pageBtnContainer);
  renderXResults(paginatedObjected[1]);
  renderPageButtons(paginatedObjected);
};

const getResults = async (item = "Monitor") => {
  const response = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${item}`);
  const { results } = await response.json();
  renderFirstResults(results);
};

const loadCartFromStorage = async () => {
  const arrToRender = JSON.parse(localStorage.getItem("cart"));
  if (!arrToRender) return;
  arrToRender.forEach((element) => {
    const [id, title, price, image] = element.split(";");
    const params = {
      sku: id,
      name: title,
      salePrice: price,
      image: image,
    };
    const createdCardItemElement = createCartItemElement(params);
    document.querySelector(".cart__items").appendChild(createdCardItemElement);
  });
  updateCart();
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
    const allCartItems = document.querySelector(".cart__items");
    allCartItems.innerHTML = "";
    localStorage.clear();
    sumCartItems();
    updateCart();
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

const closeCart = () => {
  const cartBg = document.querySelector(".cart-bg");
  const cart = document.querySelector(".cart");
  cartBg.classList.remove("cart-bg_active");
  cart.classList.remove("cart_active");
};

const addShowCartListener = () => {
  const cartBtn = document.querySelector(".header_cart");
  const cartBg = document.querySelector(".cart-bg");
  const cart = document.querySelector(".cart");
  cartBtn.addEventListener("click", () => {
    cartBg.classList.add("cart-bg_active");
    cart.classList.add("cart_active");
  });
};

const addCloseCartListener = () => {
  const closeBtn = document.querySelector(".cart__close");
  closeBtn.addEventListener("click", closeCart);
};

//                   Implementing a debounce for mercado Libre search API
let timeout;
let delay = 500;

const addFiltrarEventListener = () => {
  const searchInput = document.querySelector("#filtrar");
  searchInput.addEventListener("keyup", (e) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      getResults(e.target.value);
    }, delay);
  });
};

const loadbuttons = () => {
  loadEmptyCart();
  setMainBtnListener();
  addEventListenerLis();
  addFiltrarEventListener();
  addShowCartListener();
  addCloseCartListener();
};

window.onload = function onload() {
  getResults();
  loadCartFromStorage();
  loadbuttons();
};
