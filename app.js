const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const router = express.Router()
const pool = require('./dbconfig/db')
require('dotenv').config()
const prisma = require('./test')
const cors = require("cors");
// const { PrismaClient } = require('@prisma/client')
// const prisma = new PrismaClient()
const bodyParser = require('body-parser');
const routes = require("./routes/route");

const app = express();
app.use(express.json());
// app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', routes);

// Set up express-session middleware
app.use(
  session({
    secret: 'This-is-big-bank', // Change this to your own secret key
    resave: false,
    saveUninitialized: true,
  })
);

// pool.getConnection(function (err, connection) {
//   if (err) throw err
//   console.log("Database connected in app.js")

//   connection.query(`select * from user where id=${4}`, async (err, result) => {
//     if (err) throw err
//     console.log(result)
//   })
// })

// const getalluser = async () => {
//   const allUsers = await prisma.user.findMany()
//   console.log(allUsers)
// }

// getalluser()


app.listen(process.env.PORT_LOC, () => {
  console.log(`Server started Running  on PORT_LOC:${process.env.PORT_LOC}`);
});
