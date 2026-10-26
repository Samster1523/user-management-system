// Backend: application services, accessible by URIs


const express = require('express')
const cors = require ('cors')
const dotenv = require('dotenv')
const bcrypt = require("bcrypt");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const path = require("path");
dotenv.config()

const app = express();

const dbService = require('./dbService');
const { resourceUsage } = require('process');


app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: false}));


const sessionStore = new MySQLStore({
    host: process.env.HOST,
    user: process.env.DB_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: Number(process.env.DB_PORT)
})

app.use(session({
    name: "app.sid",
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
    }
}))
// create
app.post('/insert', requireLogin, (request, response) => {
    console.log("app: insert a row.");
    // console.log(request.body); 

    const {name} = request.body;
    const db = dbService.getDbServiceInstance();

    const result = db.insertNewName(name);
 
    // note that result is a promise
    result 
    .then(data => response.json({data: data})) // return the newly added row to frontend, which will show it
   // .then(data => console.log({data: data})) // debug first before return by response
   .catch(err => console.log(err));
});

app.post("/signup",  async (request, response) => {
    try {
        const {
            username,
            password,
            firstname,
            lastname,
            salary,
            age
        } = request.body;

        // Validate input
        if (
            typeof username !== "string" ||
            typeof password !== "string" ||
            typeof firstname !== "string" ||
            typeof lastname !== "string" ||
            !username.trim() ||
            !firstname.trim() ||
            !lastname.trim() ||
            username.length > 50 ||
            firstname.length > 50 ||
            lastname.length > 50 ||
            password.length < 8 ||
            Buffer.byteLength(password, "utf8") > 72 ||
            !Number.isInteger(age) ||
            age < 0 ||
            age > 150 ||
            typeof salary !== "number" ||
            !Number.isFinite(salary) ||
            salary < 0
        ) {
            return response.status(400).json({
                success: false,
                message: "Invalid registration information."
            });
        }

        const db = dbService.getDbServiceInstance();

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert the user
        await db.createUser(
            username.trim(),
            hashedPassword,
            firstname.trim(),
            lastname.trim(),
            salary,
            age
        );

        response.status(201).json({
            success: true,
            message: "Account created successfully!"
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return response.status(409).json({
                success: false,
                message: "Username already exists."
            });
        }

        console.error(error);

        response.status(500).json({
            success: false,
            message: "Registration failed."
        });
    }
});

app.post("/signin",  async (request, response) => {
    try {
        const { username, password } = request.body;

        if (
            typeof username !== "string" ||
            typeof password !== "string"
        ) {
            return response.status(400).json({
                success: false,
                message: "Invalid credentials."
            });
        }

        const db = dbService.getDbServiceInstance();

        // Find user
        const user = await db.getUserByUsername(username);

        if (!user) {
            return response.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        // Compare password with stored hash
        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return response.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        // Create a new authenticated session
        request.session.regenerate(async (err) => {
            if (err) {
                return response.status(500).json({
                    success: false,
                    message: "Session error."
                });
            }

            try {
                request.session.username = user.username;

                await db.updateSignInTime(user.username);

                request.session.save((saveError) => {
                    if (saveError) {
                        return response.status(500).json({
                            success: false,
                            message: "Session error."
                        });
                    }

                    response.json({
                        success: true,
                        message: "Login successful!",
                        username: user.username
                    });
                });

            } catch (error) {
                console.error(error);
                response.status(500).json({
                    success: false,
                    message: "Login failed."
                });
            }
        });

    } catch (error) {
        console.error(error);

        response.status(500).json({
            success: false,
            message: "Login failed."
        });
    }
});




// read 
app.get('/getAll', requireLogin, (request, response) => {
    
    const db = dbService.getDbServiceInstance();

    
    const result =  db.getAllData(); // call a DB function

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});

app.get("/me", async (request, response) => {
    if (!request.session.username) {
        return response.status(401).json({
            success: false,
            message: "Not signed in."
        });
    }

    try {
        const db = dbService.getDbServiceInstance();

        const user = await db.getUserByUsername(
            request.session.username
        );

        if (!user) {
            return response.status(401).json({
                success: false,
                message: "User not found."
            });
        }

        response.json({
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname
        });

    } catch (error) {
        console.error(error);
        response.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

app.post("/logout", (request, response) => {
    request.session.destroy((err) => {
        if (err) {
            return response.status(500).json({
                success: false,
                message: "Logout failed."
            });
        }

        response.clearCookie("app.sid");

        response.json({
            success: true,
            message: "Logged out successfully."
        });
    });
});

app.get('/search/:name', requireLogin, (request, response) => { // we can debug by URL
    
    const {name} = request.params;
    
    console.log(name);

    const db = dbService.getDbServiceInstance();

    let result;
    if(name === "all") // in case we want to search all
       result = db.getAllData()
    else 
       result =  db.searchByName(name); // call a DB function

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});


// update
app.patch('/update', requireLogin,
     (request, response) => {
          console.log("app: update is called");
          //console.log(request.body);
          const{id, name} = request.body;
          console.log(id);
          console.log(name);
          const db = dbService.getDbServiceInstance();

          const result = db.updateNameById(id, name);

          result.then(data => response.json({success: true}))
          .catch(err => console.log(err)); 

     }
);

// delete service
app.delete('/delete/:id', requireLogin,
     (request, response) => {     
        const {id} = request.params;
        console.log("delete");
        console.log(id);
        const db = dbService.getDbServiceInstance();

        const result = db.deleteRowById(id);

        result.then(data => response.json({success: true}))
        .catch(err => console.log(err));
     }
)   

// debug function, will be deleted later
app.post('/debug',requireLogin, (request, response) => {
    // console.log(request.body); 

    const {debug} = request.body;
    console.log(debug);

    return response.json({success: true});
});   

// debug function: use http://localhost:5050/testdb to try a DB function
// should be deleted finally
app.get('/testdb', requireLogin, (request, response) => {
    
    const db = dbService.getDbServiceInstance();

    
    const result =  db.deleteById("14"); // call a DB function here, change it to the one you want

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});


// set up the web server listener
// if we use .env to configure
/*
app.listen(process.env.PORT, 
    () => {
        console.log("I am listening on the configured port " + process.env.PORT)
    }
);
*/

// if we configure here directly

const frontendPath = path.join(__dirname, "../frontend");

function requireLogin(request, response, next) {
    if (!request.session.username) {
        return response.redirect("/");
    }

    next();
}

// First page visitors see
app.get("/", (request, response) => {
    response.sendFile(path.join(frontendPath, "login.html"));
});

// Existing database page, available after login
app.get("/index.html", requireLogin, (request, response) => {
    response.sendFile(path.join(frontendPath, "index.html"));
});

// Serve frontend CSS and JavaScript
app.use(express.static(frontendPath, {
    index: false
}));
//app.use(express.static(path.join(__dirname, "../frontend")));
app.listen(5050, 
    () => {
        console.log("I am listening on the fixed port 5050.")
    }
);
