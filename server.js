const express = require("express");
const multer = require("multer");
const cors = require("cors");
const session = require("express-session");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// =======================================
// ADMIN LOGIN
// =======================================

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "buzzboom123";

// =======================================
// MIDDLEWARE
// =======================================

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "buzzboom-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// =======================================
// PATHS
// =======================================

const uploadsFolder = path.join(__dirname, "uploads");
const productsFile = path.join(__dirname, "products.json");

if (!fs.existsSync(uploadsFolder)) {
    fs.mkdirSync(uploadsFolder);
}

if (!fs.existsSync(productsFile)) {
    fs.writeFileSync(productsFile, "[]");
}

// =======================================
// STATIC FILES
// =======================================

app.use(express.static(__dirname));
app.use("/uploads", express.static(uploadsFolder));

// =======================================
// MULTER
// =======================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, uploadsFolder);

    },

    filename: (req, file, cb) => {

        cb(null, Date.now() + "-" + file.originalname);

    }

});

const upload = multer({ storage });

// =======================================
// HOME
// =======================================

app.get("/", (req, res) => {

    res.sendFile(path.join(__dirname, "index.html"));

});

// =======================================
// LOGIN
// =======================================

app.post("/login", (req, res) => {

    const { username, password } = req.body;

    if (
        username === ADMIN_USERNAME &&
        password === ADMIN_PASSWORD
    ) {

        req.session.admin = true;

        return res.json({

            success: true,
            message: "Login Successful"

        });

    }

    res.status(401).json({

        success: false,
        message: "Wrong Username or Password"

    });

});

// =======================================
// LOGOUT
// =======================================

app.post("/logout", (req, res) => {

    req.session.destroy(() => {

        res.json({

            success: true

        });

    });

});

// =======================================
// SESSION
// =======================================

app.get("/session", (req, res) => {

    res.json({

        loggedIn: req.session.admin === true

    });

});

// =======================================
// GET PRODUCTS
// =======================================

app.get("/products", (req, res) => {

    const products = JSON.parse(

        fs.readFileSync(productsFile)

    );

    res.json(products);

});

// =======================================
// ADD PRODUCT
// =======================================

app.post("/product", upload.array("images", 10), (req, res) => {

    if (!req.session.admin) {

        return res.status(401).json({

            success: false,
            message: "Unauthorized"

        });

    }

    let products = JSON.parse(

        fs.readFileSync(productsFile)

    );

    const imagePaths = req.files.map(file => {

        return "/uploads/" + file.filename;

    });

    const product = {

        id: Date.now(),

        name: req.body.name,

        price: req.body.price,

        description: req.body.description,

        images: imagePaths

    };

    products.push(product);

    fs.writeFileSync(

        productsFile,

        JSON.stringify(products, null, 2)

    );

    res.json({

        success: true,

        message: "Product Published",

        product

    });

});

// =======================================
// UPDATE PRODUCT
// =======================================

app.put("/product/:id", (req, res) => {

    if (!req.session.admin) {

        return res.status(401).json({

            success: false

        });

    }

    const id = Number(req.params.id);

    let products = JSON.parse(

        fs.readFileSync(productsFile)

    );

    const index = products.findIndex(p => p.id === id);

    if (index === -1) {

        return res.status(404).json({

            success: false,

            message: "Product Not Found"

        });

    }

    products[index].name = req.body.name;
    products[index].price = req.body.price;
    products[index].description = req.body.description;

    fs.writeFileSync(

        productsFile,

        JSON.stringify(products, null, 2)

    );

    res.json({

        success: true,

        message: "Product Updated"

    });

});

// =======================================
// DELETE PRODUCT
// =======================================

app.delete("/product/:id", (req, res) => {

    if (!req.session.admin) {

        return res.status(401).json({

            success: false

        });

    }

    const id = Number(req.params.id);

    let products = JSON.parse(

        fs.readFileSync(productsFile)

    );

    const product = products.find(p => p.id === id);

    if (!product) {

        return res.status(404).json({

            success: false,

            message: "Product Not Found"

        });

    }

    product.images.forEach(image => {

        const file = path.join(__dirname, image);

        if (fs.existsSync(file)) {

            fs.unlinkSync(file);

        }

    });

    products = products.filter(p => p.id !== id);

    fs.writeFileSync(

        productsFile,

        JSON.stringify(products, null, 2)

    );

    res.json({

        success: true,

        message: "Product Deleted"

    });

});

// =======================================
// SERVER STATUS
// =======================================

app.get("/status", (req, res) => {

    res.json({

        success: true,

        app: "BUZZ&BOOM",

        server: "Running"

    });

});

// =======================================
// START SERVER
// =======================================

app.listen(PORT, () => {

    console.log("");
    console.log("==================================");
    console.log("BUZZ&BOOM SERVER RUNNING");
    console.log(`Running on port ${PORT}`);
    console.log("==================================");
    console.log("");

});