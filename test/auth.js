'use strict';
process.env.NODE_ENV = 'test';
const apiURL = 'http://localhost:3000/api';
var server = require('../bin/www'),
    base = process.env.PWD,
    config = require('../api/config'),
    logger = require('mocha-logger'),
    mongoose = require('mongoose'),
    user = require('../api/models/user.model'),
    auth = require('../api/controllers/auth.controller'),
    chai = require('chai'),
    expect = chai.expect,
    chaiHttp = require('chai-http');

chai.use(chaiHttp);

describe('Registration & Login', () => {
    var user;

    before((done) => {
        mongoose.connect(config.MONGO_URI, () => {
            console.log('Connected to db');
            done();
        });
    });


    //------------------------------ Successful Registration & Login ------------------------------//

    user = {
        firstName: 'Amr',
        lastName: 'Kayid'
        username: 'AmrMKayid',
        email: 'amrkayid@gmail.com',
        password: '123456789',
    };

    describe("User Registration", () => {
        it("it should register the user", (done) => {
            chai.request(apiURL).post("/auth/signup").send(user).end((err, res) => {
                expect(res.body.msg).to.be.eql('Registration successful, you can now login to your account.');
                expect(res).to.have.status(201);
                done();
            });
        });
    });

    describe("User Login", () => {
        it("it should login the user", (done) => {
            chai.request(apiURL).post("/auth/login").send(user).end((err, res) => {
                expect(res.body.msg).to.be.eql('Welcome');
                expect(res).to.have.status(200);
                done();
            });
        });
    });

    //------------------------------------------------------------------------------------------//


    //--------------------------- UnSuccessful Registration & Login ---------------------------//

    user = {
        // firstName: 'Amr',
        // lastName: 'Kayid'
        username: 'AmrMKayid',
        email: 'amrkayid@gmail.com',
        password: '123456789',
    };

    describe("Register without the name", () => {
        it("it should return 422 because name is missing", (done) => {
            chai.request(apiURL).post("/auth/signup").send(user).end((err, res) => {
                expect(res).to.have.status(422);
                done();
            });
        });
    });

    user = {
        firstName: 'Amr',
        lastName: 'Kayid'
        username: 'AmrMKayid',
        // email: 'amrkayid@gmail.com',
        password: '123456789',
    };

    describe("Register without the email", () => {
        it("it should return 422 because email is missing", (done) => {
            chai.request(apiURL).post("/auth/signup").send(user).end((err, res) => {
                expect(res).to.have.status(422);
                done();
            });
        });
    });

    user = {
        firstName: 'Amr',
        lastName: 'Kayid'
        username: 'AmrMKayid',
        email: 'amrkayid@gmail.com',
        // password: '123456789',
    };

    describe("Register without providing a password", () => {
        it("it should return 422 because password is missing", (done) => {
            chai.request(apiURL).post("/auth/signup").send(user).end((err, res) => {
                expect(res).to.have.status(422);
                done();
            });
        });
    });

    
    user = {
        firstName: 'Amr',
        lastName: 'Kayid'
        username: 'AmrMKayid',
        email: 'amrkayid@gmail.com',
        password: '12345',
    };

    describe("Register with password less than 8", () => {
        it("it should return 422 because password is less than 8", (done) => {
            chai.request(apiURL).post("/auth/signup").send(user).end((err, res) => {
                expect(res).to.have.status(422);
                done();
            });
        });
    });


    user = {
        firstName: 'Amr',
        lastName: 'Kayid'
        username: 'AmrMKayid',
        email: 'amrkayid@gmail.com',
        password: '123456789',
    };

    describe("Register with existing email", () => {
        it("it should return 422 because user exist with this email", (done) => {
            chai.request(apiURL).post("/auth/signup").send(user).end((err, res) => {
                expect(res).to.have.status(422);
                done();
            });
        });
    });


    user = {
        password: '123456789',
    };

    describe("Login without email", () => {
        it("it should not login this user without providing his/her email", (done) => {
            chai.request(apiURL).post("/auth/login").send(user).end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
        });
    });

    user = {
        username: 'AmrMKayid'
    };

    describe("Login without password", () => {
        it("it should not login this user without providing his/her password", (done) => {
            chai.request(apiURL).post("/auth/login").send(user).end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
        });
    });

    user = {
        username: 'amrNotExists',
        password: '123456789',
    };

    describe("Login with unregister account", () => {
        it("it should not login this user", (done) => {
            chai.request(apiURL).post("/auth/login").send(user).end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
        });
    });

    user = {
        username: 'AmrMKayid',
        password: '123',
    };

    describe("Login with incorrect password", () => {
        it("it should not login this user with incorreect password", (done) => {
            chai.request(apiURL).post("/auth/login").send(user).end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
        });
    });

    //--------------------------------------------------------------------------------------//

    after((done) => {
        mongoose.connection.db.dropDatabase();
        done();
    });


});