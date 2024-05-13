const express = require("express");
const collection = require("./db");
const path = require("path"); 
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());

app.use(express.urlencoded({extended: false}));

app.set("views", path.join(__dirname, "../views"));

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, '../public')));

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {
    const data = {
        username: req.body.username,
        password: req.body.password
    }

    try {
        const existingUser = await collection.findOne({username: data.username});

        if(existingUser){
            res.send("User already exists!");
        }else{
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    
            data.password = hashedPassword;
    
            const userData = await collection.insertMany(data);
            console.log(userData);
            res.send("Registration successful!"); 
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred during registration."); 
    }
});

app.post("/login", async (req, res)=>{
    try{
        const check = await collection.findOne({username: req.body.username});
        if(!check){
            res.send("User name cannot found!");
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if(isPasswordMatch){
            res.render("home");
        }else{
            res.send("Wrong password!");
        }
    }catch{
        res.render("Wrong details");
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
