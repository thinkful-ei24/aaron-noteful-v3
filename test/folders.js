const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { JWT_SECRET } = config;

const app = require("../server");
const { TEST_MONGODB_URI } = require("../config");

const Folder = require("../models/folder");
const User = require("../models/user");

const { folders, users } = require("../db/seed/notes");

const expect = chai.expect;
chai.use(chaiHttp);

describe("Folders Testing", function() {
  before(function() {
    return mongoose.connect(TEST_MONGODB_URI);
  });
  let token;
  let user;
  beforeEach(function() {
    return Promise.all([
      User.insertMany(users),
      Folder.insertMany(folders),
      Folder.createIndexes()
    ]).then(([users]) => {
      user = users[0];
      token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
    });
  });
  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });
  after(function() {
    return mongoose.disconnect();
  });

  describe("GET /api/folders", function() {
    it("Should return all folders", function() {
      return;
      [
        Folder.find({ userId: user.id }),
        chai
          .request(app)
          .get("/api/folders")
          .set("Authorizatoin", `Bearer ${token}`)
      ].then(([data, res]) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a("array");
        expect(res.body).to.have.length(data.length);
      });
    });
    it("should return a list with the correct right fields", function() {
      const dbPromise = Folder.find({ userId: user.id });
      const apiPromise = chai
        .request(app)
        .get("/api/folders")
        .set("Authorization", `Bearer ${token}`);

      return Promise.all([dbPromise, apiPromise]).then(([data, res]) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a("array");
        res.body.forEach(function(item) {
          expect(item).to.be.a("object");
          expect(item).to.have.keys(
            "id",
            "name",
            "userId",
            "createdAt",
            "updatedAt"
          );
        });
      });
    });
  });

  describe("GET /api/folders/:id", function() {
    it("should return correct folder", function() {
      let data;
      return Folder.findOne({ userId: user.id })
        .then(_data => {
          data = _data;
          return chai
            .request(app)
            .get(`/api/folders/${data.id}`)
            .set("Authorization", `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.all.keys(
            "id",
            "name",
            "userId",
            "createdAt",
            "updatedAt"
          );
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(res.body.userId).to.equal(data.userId.toString());
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  describe("POST /api/folders", function() {
    it("should create and return a new item when provided valid data", function() {
      const newItem = { name: "newFolder" };
      let body;
      return chai
        .request(app)
        .post("/api/folders")
        .set("Authorization", `Bearer ${token}`)
        .send(newItem)
        .then(function(res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header("location");
          expect(res).to.be.json;
          expect(body).to.be.a("object");
          expect(body).to.have.all.keys(
            "id",
            "name",
            "userId",
            "createdAt",
            "updatedAt"
          );
          return Folder.findOne({ _id: body.id, userId: user.id });
        })
        .then(data => {
          expect(body.id).to.equal(data.id);
          expect(body.name).to.equal(data.name);
          expect(body.userId).to.equal(data.userId.toString());
          expect(new Date(body.createdAt)).to.eql(data.createdAt);
          expect(new Date(body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  describe("PUT /api/folders", function() {
    it("should update the folder", function() {
      const updateItem = { name: "Updated Name" };
      let data;
      return Folder.findOne({ userId: user.id })
        .then(_data => {
          data = _data;
          return chai
            .request(app)
            .put(`/api/folders/${data.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send(updateItem);
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a("object");
          expect(res.body).to.have.all.keys(
            "id",
            "name",
            "userId",
            "createdAt",
            "updatedAt"
          );
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(updateItem.name);
          expect(res.body.userId).to.equal(data.userId.toString());
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.greaterThan(data.updatedAt);
        });
    });
  });

  describe("DELETE /api/folders/:id", function() {
    it("should delete an existing folder and respond with 204", function() {
      let data;
      return Folder.findOne({ userId: user.id })
        .then(_data => {
          data = _data;
          return chai
            .request(app)
            .delete(`/api/folders/${data.id}`)
            .set("Authorization", `Bearer ${token}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
          return Folder.count({ _id: data.id });
        })
        .then(count => {
          expect(count).to.equal(0);
        });
    });
  });
});
