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




app.post('/insert', requireLogin, async (request, response) => {
    
 try {
        const {
            username,
            password,
            firstname,
            lastname,
            salary,
            age
        } = request.body;

        if (
            typeof username !== "string" || !username.trim() ||
            typeof password !== "string" || password.length < 8 ||
            typeof firstname !== "string" || !firstname.trim() ||
            typeof lastname !== "string" || !lastname.trim() ||
            firstname === "-" ||
            lastname === "-" ||
            typeof salary !== "number" || !Number.isFinite(salary) || salary < 0 ||
            !Number.isInteger(age) || age < 0 || age > 150
        ) {
            return response.status(400).json({
                success: false,
                message: "Invalid user information"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const db = dbService.getDbServiceInstance();

        const result = await db.insertNewUser(
            username.trim(),
            hashedPassword,
            firstname.trim(),
            lastname.trim(),
            salary,
            age
        );

        response.status(201).json({
            success: true,
            data: result,
            message: "User added"
        });

    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return response.status(409).json({
                success: false,
                message: "Username already exists"
            });
        }

        response.status(500).json({
            success: false,
            message: "Failed to insert user"
        });
    }
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
            firstname === "-" ||
            lastname === "-" ||
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
        const hashedPassword = await bcrypt.hash(password, 12);

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
        const user = await db.getUserByUsername(username);

        if (!user) {
            return response.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }
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




app.get('/getAll', requireLogin, (request, response) => {
    
    const db = dbService.getDbServiceInstance();

    
    const result =  db.getAllData();

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


app.get('/searchSalary/:lower/:upper', requireLogin, (request, response) =>{
    const {upper, lower} = request.params;
    const db = dbService.getDbServiceInstance();

    const result = db.searchBySalary(lower, upper);

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
})

app.get('/searchAge/:lower/:upper', requireLogin, (request, response) =>{
    const {upper, lower} = request.params;
    const db = dbService.getDbServiceInstance();

    const result = db.searchByAge(lower, upper);

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
})

app.get('/searchNULLSignin', requireLogin, (request, response) => {
    const db = dbService.getDbServiceInstance();
    const result = db.searchByNULLSignin();
    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));

})

app.get('/searchJohn', requireLogin, (request, response) => {
    const db = dbService.getDbServiceInstance();
    const result = db.searchByJohn();
    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));

})

app.get('/searchJohnSame', requireLogin, (request, response) => {
    const db = dbService.getDbServiceInstance();
    const result = db.searchByJohnSame();
    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));

})

app.get('/searchSameDay', requireLogin, (request, response) => {
    const db = dbService.getDbServiceInstance();
    const result = db.searchBySameDay();
    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));

})


app.get('/search/:firstname/:lastname', requireLogin, (request, response) => {
    
    const {firstname, lastname} = request.params;
    console.log(firstname);

    const db = dbService.getDbServiceInstance();

    let result;
    if(firstname === "-" && lastname === "-")
       result = db.getAllData()
    else 
       result =  db.searchByName(firstname,lastname);

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});


app.get('/searchid/:id', requireLogin, (request, response) => {
    
    const {id} = request.params;

    console.log(id);

    const db = dbService.getDbServiceInstance();

    const result = db.searchById(id);

    result.then(data => response.json({data: data})).catch(err => console.log(err));
});




app.patch('/update', requireLogin, (request, response) => {
          console.log("app: update is called");
          const{id, firstname, lastname} = request.body;
    
          const db = dbService.getDbServiceInstance();

          const result = db.updateNameById(id, firstname, lastname);

          result.then(data => response.json({success: true}))
          .catch(err => console.log(err)); 

     }
);



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


app.post('/debug',requireLogin, (request, response) => {
    // console.log(request.body); 

    const {debug} = request.body;
    console.log(debug);

    return response.json({success: true});
});   


app.get('/testdb', requireLogin, (request, response) => {
    
    const db = dbService.getDbServiceInstance();

    
    const result =  db.deleteById("14");

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});




const frontendPath = path.join(__dirname, "../frontend");

function requireLogin(request, response, next) {
    if (!request.session.username) {
        return response.redirect("/");
    }

    next();
}

app.get("/", (request, response) => {
    response.sendFile(path.join(frontendPath, "login.html"));
});

app.get("/index.html", requireLogin, (request, response) => {
    response.sendFile(path.join(frontendPath, "index.html"));
});

app.use(express.static(frontendPath, {
    index: false
}));
app.listen(5050, 
    () => {
        console.log("I am listening on the fixed port 5050.")
    }
);
