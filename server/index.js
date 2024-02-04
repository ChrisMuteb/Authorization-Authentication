const express = require('express')
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session');
const bcrypt = require('bcrypt')
const saltRounds = 10

const jwt = require('jsonwebtoken');


const app = express();

app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    key: 'userId',
    secret: "subscribe",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 24,
    }
}))


const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: '65412Muteb',
    database: 'LoginSystem'
})

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            res.send({ err: err });
        }
        db.query("INSERT INTO users (username, password) VALUES(?,?)",
            [username, hash],
            (err, result) => {
                console.log(err);
            })
    });

})

const verifyJWT = (req, res, next) => {
    const token = req.headers['x-access-token']

    if (!token) {
        res.send('Yo, we need a token, please give it to us next time!')
    } else {
        jwt.verify(token, "jwtSecret", (err, decoded) => {
            if (err) {
                res.json({ auth: false, message: "U failed to authenticate" })
            } else {
                req.userId = decoded.id;// variable called userId
                next();
            }
        })
    }
}
app.get('/isUserAuth', verifyJWT, (req, res) => {
    res.send("Yo, u are authenticated Congrats!")
})

app.get('/login', (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user })
    } else {
        res.send({ loggedIn: false })

    }
})

app.post('/login', (req, res) => {
    const { username, password } = req.body

    db.query(
        "SELECT * FROM users WHERE username = ?;",
        [username],
        (err, result) => {
            if (err) {
                res.send({ err: err })
            }

            if (result.length > 0) {
                bcrypt.compare(password, result[0].password, (error, response) => {
                    if (response) {

                        const id = result[0].id
                        console.log(result[0].id)
                        const token = jwt.sign({ id }, "jwtSecret", {
                            expiresIn: 300,// 5min
                        })
                        req.session.user = result;// create a session

                        res.json({ auth: true, token: token, result: result })
                    } else {
                        res.json({ auth: false, message: "wwrong username/password combination" })
                    }
                })
            } else {
                res.json({ auth: false, message: 'no user exists' })
            }


        })
})
app.listen(8081, () => {
    console.log('running server');
})