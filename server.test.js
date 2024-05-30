const mongoose = require("mongoose");
const request = require("supertest");
const app = require("./server");
 
require("dotenv").config();
 
const firstCar = {
    id: 0,
    make: "BMW",
    model: "X3",
    price: 1000
}
 
 
// Backend starts with 4 cars in the "database"
let numberOfCars = 4;
let providedCar = null;
let newCar = null;
 
describe("GET /cars", () => {
    test("should return all cars", async () => {
        return request(app)
            .get('/cars')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                expect(res.statusCode).toBe(200);
            })
    });
});
 
describe("PUT /add", () => {
    test("should add a new car", async () => {
        return request(app)
            .post('/add')
            .send({data: firstCar})
            .expect(200)
            .then(({body})=> {
                console.log(body.id == numberOfCars + 1);
            })
    });
});
 
describe("PUT /add", () => {
    test("should fail to add a new car", async () => {
        return request(app)
            .post('/add')
            .send({data: {price: 10000}})
            .expect(400)
    });
});
 
describe("GET /cars/:id", () => {
    test("should get the car based on the id", async () => {
        return request(app)
            .get('/cars/1')
            .expect(200)
            .then(({body})=>
            {
                providedCar = body;
            })
    });
});
 
describe("GET /cars/:id", () => {
    test("should  get an 404 not found message", async () => {
        return request(app)
            .get('/cars/-4684')
            .expect(404)
    });
});
 
describe("PUT /edit", () => {
    test("should edit the provided car", async () => {
        return request(app)
            .post('/edit')
            .send({data: providedCar})
            .expect(200)
    });
});
 
describe("PUT /edit", () => {
    test("should fail to edit the provided car", async () => {
        return request(app)
            .post('/edit')
            .send({data:{}})
            .expect(404)
    });
});
 
describe("PUT /delete", () => {
    test("should delete the item requested", async () => {
        request(app).get('/cars/1').then(({body}) => {
            return request(app)
            .delete('/delete')
            .send(body)
            .expect(200)
        });
    });
});
 
describe("PUT /delete", () => {
    test("should fail to delete the item requested", async () => {
        return request(app)
        .delete('/delete')
        .send({data: firstCar})
        .expect(404)
    });
});