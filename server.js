require("dotenv").config();

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const session = require("express-session");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const app = express();

app.set("trust proxy", 1);

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI)
.then(() => {

    console.log("✅ MongoDB Connected");

})
.catch(err => {

    console.error(err);

});
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
app.get("/products", async (req, res) => {

    try{

        const products = await Product.find().sort({createdAt:-1});

        res.json(products);

    }catch(err){

        res.status(500).json(err);

    }

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
const product = new Product({

    name:req.body.name,

    price:Number(req.body.price),

    description:req.body.description,

    images:imagePaths

});

await product.save();

res.json({

    success:true,

    product

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

app.put("/product/:id", async (req,res)=>{

    if(!req.session.admin){

        return res.status(401).json({success:false});

    }

    await Product.findByIdAndUpdate(

        req.params.id,

        {

            name:req.body.name,

            price:Number(req.body.price),

            description:req.body.description

        }

    );

    res.json({

        success:true

    });

});
const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    description: {
        type: String,
        default: ""
    },

    images: {
        type: [String],
        default: []
    },

    createdAt: {

        type: Date,

        default: Date.now

    }

});

const Product = mongoose.model("Product", productSchema);

// =======================================
// DELETE PRODUCT
// =======================================

app.delete("/product/:id", async(req,res)=>{

    if(!req.session.admin){

        return res.status(401).json({success:false});

    }

    const product = await Product.findById(req.params.id);

    if(product){

        product.images.forEach(image=>{

            const file = path.join(__dirname,image);

            if(fs.existsSync(file)){

                fs.unlinkSync(file);

            }

        });

        await Product.findByIdAndDelete(req.params.id);

    }

    res.json({

        success:true

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