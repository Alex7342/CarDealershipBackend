const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { isAnyArrayBuffer } = require('util/types');
const app = express();
app.use(cors());

const port = 3069;

module.exports = app;


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.use(express.json());

require('dotenv').config();

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const mysql = require('mysql')
const connection = mysql.createConnection({
    host: '34.154.122.240',
    user: 'root',
    password: 'carmanagement',
    database: 'cardealership'
  });

connection.connect();

function insertCarIntoDatabase(car, userName) {
    let stringQuery = `INSERT INTO cars (dealershipId, make, model, price, userName) VALUES (${car.dealershipId}, '${car.make}', '${car.model}', ${car.price}, '${userName}')`;
    
    return new Promise((resolve, reject) => {
        connection.query(stringQuery, (err) => {
            if (err)
                reject(err);
            resolve();
        });
    });
}

function insertDealershipIntoDatabase(dealership) {
    let stringQuery = `INSERT INTO dealerships (name, address) VALUES ('${dealership.name}', '${dealership.address}')`;
    
    return new Promise((resolve, reject) => {
        connection.query(stringQuery, (err) => {
            if (err)
                reject(err);
            resolve();
        });
    });
}

function deleteCarFromDatabase(car) {
    let stringQuery = `DELETE FROM cars WHERE id = ${car.id}`;
    
    return new Promise((resolve, reject) => {
        connection.query(stringQuery, (err) => {
            if (err)
                reject(err);
            resolve();
        });
    });
}

function deleteDealershipFromDatabase(dealership) {
    let stringQuery = `DELETE FROM dealerships WHERE id = ${dealership.id}`;
    
    return new Promise((resolve, reject) => {
        connection.query(stringQuery, (err) => {
            if (err)
                reject(err);
            resolve();
        });
    });
}

function updateCarIntoDatabase(car) {
    let stringQuery = `UPDATE cars SET dealershipId = ${car.dealershipId}, make = '${car.make}', model = '${car.model}', price = ${car.price} WHERE id = ${car.id}`;
    
    return new Promise((resolve, reject) => {
        connection.query(stringQuery, (err) => {
            if (err)
                reject(err);
            resolve();
        });
    });
}

function updateDealershipIntoDatabase(dealership) {
    let stringQuery = `UPDATE dealerships SET name = '${dealership.name}', address = '${dealership.address}' WHERE id = ${dealership.id}`;
    
    return new Promise((resolve, reject) => {
        connection.query(stringQuery, (err) => {
            if (err)
                reject(err);
            resolve();
        });
    });
}

function getAllCars(userName) {
    let result = [];
    let stringQuery = `SELECT * FROM cars WHERE userName = '${userName}'`;

    return new Promise((resolve, reject) => {
        connection.query(stringQuery, (err, rows) => {
            if (err)
                reject(err);
    
            for (let i = 0; i < rows.length; i++)
                result.push(rows[i]);
            
            resolve(result);
        });
    });
}

function getAllDealerships() {
    let result = [];
    let stringQuery = 'SELECT * FROM dealerships';

    return new Promise((resolve, reject) => {
        connection.query(stringQuery, (err, rows) => {
            if (err)
                reject(err);
    
            for (let i = 0; i < rows.length; i++)
                result.push(rows[i]);

            resolve(result);
        });
    });
}

function getCarDealershipName() {
    let result = [];
    let stringQuery = 'SELECT Cars.id as id, Dealerships.name as name FROM Cars INNER JOIN Dealerships ON Cars.dealershipId = Dealerships.id';
    connection.query(stringQuery, (err, rows) => {
        if (err)
            return;

        for (let i = 0; i < rows.length; i++)
            result.push(rows[i]);
    });

    return result;
}

function createUserInDatabase(newUser) {
    let stringQuery = `INSERT INTO users VALUES ('${newUser.name}', '${newUser.password}', '${newUser.accessToken}')`;

    return new Promise((resolve, reject) => {
        connection.query(stringQuery, (err) => {
            if (err)
                reject(err);
            resolve();
        });
    })
}

function getUserByName(name) {
    let stringQuery = `SELECT * FROM users WHERE name = '${name}'`;

    return new Promise((resolve, reject) => {
        connection.query(stringQuery, (err, rows) => {
            if (err)
                reject(err);
            resolve(rows[0]);
        });
    });
}


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']; // Bearer Token
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null)
        return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err)
            return res.sendStatus(403);

        req.user = user;
        next();
    });
}


let allDealerships = [];
let allCars = [];



app.get('/dealerships', authenticateToken, async (req, res) => {
    console.log('request get');
    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    });
    
    await getAllDealerships(req.user.name)
        .then(dealerships => {res.status(200).json(dealerships)})
        .catch(err => {res.status(500).send({error: "Database connection down!"})});
});

app.get('/cars', authenticateToken, async (req, res) => {
    console.log('request get');
    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    });
    
    await getAllCars(req.user.name)
        .then(cars => {res.status(200).json(cars)})
        .catch(err => {res.status(500).send({error: "Database connection down!"})});
});

app.get('/carDealershipName', (req, res) => {
    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    });
    let carDealershipName = getCarDealershipName();
    setTimeout(() => {
        res.status(200).json(allCars);
    }, 100);
});


app.post('/dealership/add', authenticateToken, async (req, res) => {
    const data = req.body;
    let dealership = data.data;

    if (Array.isArray(data)) {
        dealership = data[data.length - 1];
    }

    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    });

    console.log(dealership);

    if (dealership.name && dealership.address) {
        await insertDealershipIntoDatabase(dealership)
            .then(res.status(200).json(dealership))
            .catch(err => {res.status(500).send({error: err.message})});       
    }
    else {
        res.status(400).send({error: 'Invalid data!'});
    }
});

app.post('/car/add', authenticateToken, async (req, res) => {
    const data = req.body;
    let car = data.data;

    if (Array.isArray(data)) {
        car = data[data.length - 1];
    }

    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    });

    console.log(car);

    if (car.dealershipId && car.make && car.model && car.price) {
        await insertCarIntoDatabase(car, req.user.name)
            .then(res.status(200).json(car))
            .catch(err => {res.status(500).send({error: err.message})});
    }
    else {
        res.status(400).send({error: 'Invalid data!'});
    }
});


app.post('/dealership/edit', authenticateToken, async (req, res) => {
    const data = req.body;
    let dealership = data.data;

    if (Array.isArray(data)) {
        dealership = data[data.length - 1];
    }

    if (dealership.name && dealership.address) {
        await updateDealershipIntoDatabase(dealership)
            .then(res.status(200).json(dealership))
            .catch(err => { res.status(400).send({error: err.message})});
    }
    else {
        res.status(404).send({error: "Invalid data!"});
    }
});

app.post('/car/edit', authenticateToken, async (req, res) => {
    const data = req.body;
    let car = data.data;

    if (Array.isArray(data)) {
        car = data[data.length - 1];
    }

    if (car.dealershipId && car.make && car.model && car.price) {
        await updateCarIntoDatabase(car)
            .then(res.status(200).json(car))
            .catch(err => {res.status(500).send({error: err.message})});        
    }
    else {
        res.status(404).send({error: "Invalid data!"});
    }
});


app.delete('/dealership/delete', authenticateToken, async (req, res) => {
    const data = req.body;
    let dealership = data;

    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    });

    if (Array.isArray(data)) {
        dealership = data[data.length - 1];
    }
    
    if (dealership.name && dealership.address) {
        await deleteDealershipFromDatabase(dealership)
            .then(res.status(200).json(dealership))
            .catch(err => {res.status(500).send({error: err.message})});        
    }
    else {
        res.status(404).send({error: 'Invalid data!'});
    }
});

app.delete('/car/delete', authenticateToken, async (req, res) => {
    const data = req.body;
    let car = data;

    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    });

    if (Array.isArray(data)) {
        car = data[data.length - 1];
    }

    if (car.make && car.model && car.price) {
        await deleteCarFromDatabase(car)
            .then(res.status(200).json(car))
            .catch(err => {res.status(500).send({error: err.message})});
    }
    else {
        res.status(404).send({error: 'Invalid data!'});
    }
});


app.post('/register', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const tokenUser = {name: req.body.name};
        const accessToken = jwt.sign(tokenUser, process.env.ACCESS_TOKEN_SECRET);

        const newUser = {name: req.body.name, password: hashedPassword, accessToken: accessToken};
        try {
            await createUserInDatabase(newUser)
                .then()
                .catch(err => {throw err});

            res.status(200).json(newUser);
        }
        catch(exception) {
            res.status(501).send({error: 'Could not add the new user!'});
        }
    }
    catch(exception) {
        res.status(501).send({error: 'Hashing error!'});
    }
});


app.post('/login', async (req, res) => {
    try {
        let _user;

        await getUserByName(req.body.name)
        .then(user => _user = user)
        .catch(err => {throw err});

        if (await bcrypt.compare(req.body.password, _user.password))
            res.status(200).json({accessToken: _user.accessToken});
        else
            res.status(401).send({error: "Invalid password!"});
    }
    catch(exception) {
        res.status(500).send({error: exception.message});
    }
});
