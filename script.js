// =========================================
// BUZZ&BOOM
// script.js
// =========================================

const API = window.location.origin;

// =========================================
// LOAD PRODUCTS
// =========================================

async function loadProducts() {

    const container = document.getElementById("products");

    if (!container) return;

    try {

        const response = await fetch(API + "/products");
        const products = await response.json();

        container.innerHTML = "";

        products.forEach(product => {

            container.innerHTML += `

            <div class="card">

                <img src="${API}${product.images[0]}" alt="${product.name}">

                <h3>${product.name}</h3>

                <p>${product.description}</p>

                <h2>KSh ${product.price}</h2>

                <button onclick="addToCart(${product.id})">
                    Add To Cart
                </button>

            </div>

            `;

        });

    } catch (error) {

        console.error(error);

    }

}

// =========================================
// CART
// =========================================

function addToCart(id) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.push(id);

    localStorage.setItem("cart", JSON.stringify(cart));

    alert("Product added to cart.");

}

async function loadCart() {

    const cartBox = document.getElementById("cartItems");

    if (!cartBox) return;

    const response = await fetch(API + "/products");
    const products = await response.json();

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    let total = 0;

    cartBox.innerHTML = "";

    cart.forEach(id => {

        const product = products.find(p => p.id == id);

        if (!product) return;

        total += Number(product.price);

        cartBox.innerHTML += `

        <div class="card">

            <img src="${API}${product.images[0]}">

            <h3>${product.name}</h3>

            <p>KSh ${product.price}</p>

            <button onclick="removeCart(${product._id})">

                Remove

            </button>

        </div>

        `;

    });

    const totalBox = document.getElementById("total");

    if (totalBox) {

        totalBox.innerHTML = "Total: KSh " + total;

    }

}

function removeCart(id) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const index = cart.indexOf(id);

    if (index > -1) {

        cart.splice(index, 1);

    }

    localStorage.setItem("cart", JSON.stringify(cart));

    loadCart();

}

// =========================================
// ADMIN LOGIN
// =========================================

async function login() {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {

        const response = await fetch(API + "/login", {

            method: "POST",

            credentials: "include",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username,
                password
            })

        });

        const result = await response.json();

        if(result.success){

            localStorage.setItem("adminLoggedIn","true");

            showDashboard();

        }else{

            alert(result.message);

        }

    }catch(error){

        console.error(error);

        alert("Server connection failed.");

    }

}

function showDashboard() {

    const login = document.getElementById("loginPage");
    const dashboard = document.getElementById("dashboard");

    if (login) login.style.display = "none";

    if (dashboard) dashboard.style.display = "block";

    loadAdminProducts();

}

function logout() {

    localStorage.removeItem("adminLoggedIn");

    location.reload();

}

// =========================================
// UPLOAD PRODUCT
// =========================================

async function uploadProduct() {

    const name = document.getElementById("name").value;
    const price = document.getElementById("price").value;
    const description = document.getElementById("description").value;
    const files = document.getElementById("images").files;

    if (!name || !price || !description) {

        alert("Please complete all fields.");

        return;

    }

    if (files.length === 0) {

        alert("Please choose images.");

        return;

    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);

    for (let i = 0; i < files.length; i++) {

        formData.append("images", files[i]);

    }

    try {

       const response = await fetch(API + "/product", {

    method:"POST",

    credentials:"include",

    body:formData

});

        const result = await response.json();

        alert(result.message);

        loadAdminProducts();

    } catch (error) {

        console.error(error);

    }

}

// =========================================
// ADMIN PRODUCTS
// =========================================

async function loadAdminProducts() {

    const box = document.getElementById("adminProducts");

    if (!box) return;

    const response = await fetch(API + "/products");

    const products = await response.json();

    box.innerHTML = "";

    products.forEach(product => {

        box.innerHTML += `

        <div class="card">

            <img src="${API}${product.images[0]}">

            <h3>${product.name}</h3>

            <p>KSh ${product.price}</p>

            <button onclick="deleteProduct(${product._id})">

                Delete

            </button>

        </div>

        `;

    });

}

async function deleteProduct(id) {

    if (!confirm("Delete this product?")) return;
await fetch(API + "/product/" + id, {

    method:"DELETE",

    credentials:"include"

});

    loadAdminProducts();
    loadProducts();

}

// =========================================
// CHECKOUT
// =========================================

function placeOrder() {

    alert("Order placed successfully.");

    localStorage.removeItem("cart");

    window.location.href = "index.html";

}

// =========================================
// AUTO START
// =========================================

window.onload = function () {

    loadProducts();

    loadCart();

    if (document.getElementById("dashboard")) {

        if (localStorage.getItem("adminLoggedIn") === "true") {

            showDashboard();

        }

    }

};
// ===============================
// EDIT PRODUCT
// ===============================

async function editProduct(id){

    const response = await fetch(API + "/products");

    const products = await response.json();

    const product = products.find(p => p.id === id);

    if(!product) return;

    const newName = prompt("Product Name", product.name);

    if(newName === null) return;

    const newPrice = prompt("Price", product.price);

    if(newPrice === null) return;

    const newDescription = prompt(
        "Description",
        product.description
    );

    if(newDescription === null) return;

    const update = await fetch(API + "/product/" + id, {

        method: "PUT",

        credentials: "include",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            name: newName,
            price: newPrice,
            description: newDescription

        })

    });

    const result = await update.json();

    alert(result.message);

    loadAdminProducts();

    loadProducts();

}

// =====================================
// ORDER VIA WHATSAPP
// =====================================

async function orderOnWhatsApp(){

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if(cart.length === 0){

        alert("Your cart is empty.");

        return;

    }

    const response = await fetch(API + "/products");

    const products = await response.json();

    let message = "🛍️ *BUZZ&BOOM ORDER*%0A";
    message += "━━━━━━━━━━━━━━%0A%0A";

    let total = 0;

    cart.forEach((id,index)=>{

        const product = products.find(p=>p.id==id);

        if(product){

            message += (index+1)+". "+product.name+"%0A";
            message += "Price: KSh "+product.price+"%0A%0A";

            total += Number(product.price);

        }

    });

    message += "━━━━━━━━━━━━━━%0A";
    message += "TOTAL: KSh "+total+"%0A%0A";
    message += "Customer Name:%0A";
    message += "Phone Number:%0A";
    message += "Delivery Location:%0A";
    message += "Preferred Delivery Time:%0A%0A";
    message += "Thank you for shopping with BUZZ&BOOM ❤️";

    window.open(

        "https://wa.me/254717848993?text="+message,

        "_blank"

    );

}