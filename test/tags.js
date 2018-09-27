const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = require("../server");
const { TEST_MONGODB_URI, JWT_SECRET } = require("../config");

const Tag = require("../models/tags");
const User = require("../models/user");
const Note = require("../models/note");

const { tags, users, notes } = require("../db/seed/notes");

const expect = chai.expect;
chai.use(chaiHttp);

describe("Tags Testing", function() {
  before(function() {
    return mongoose.connect(TEST_MONGODB_URI);
  });
  beforeEach(function() {
    return Promise.all([
      User.insertMany(users),
      Tag.insertMany(tags),
      Tag.createIndexes(),
      Note.insertMany(notes)
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

  describe("GET /api/tags", function() {
    it("Should return all tags", function() {
      return;
      [Tag.find({ userId: user.id }), chai.request(app).get("/api/tags")]
        .set("Authorization", `Bearer ${token}`)
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a("array");
          expect(res.body).to.have.length(data.length);
        });
    });
  });

  describe("GET /api/tags/:id", function() {
    it("should return correct tag", function() {
      let data;
      return Tag.findOne({ userId: user.id })
        .then(_data => {
          data = _data;
          return chai
            .request(app)
            .get(`/api/tags/${data.id}`)
            .set("Authorization", `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.keys(
            "id",
            "name",
            "createdAt",
            "updatedAt",
            "userId"
          );
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  describe("POST /api/tags", function() {
    it("should create and return a new item when provided valid data", function() {
      const newItem = { name: "newTag" };
      let body;
      return chai
        .request(app)
        .post("/api/tags")
        .set("Authorization", `Bearer ${token}`)
        .send(newItem)
        .then(function(res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header("location");
          expect(res).to.be.json;
          expect(body).to.be.a("object");
          expect(body).to.have.keys(
            "id",
            "name",
            "createdAt",
            "updatedAt",
            "userId"
          );
          return Tag.findOne({ userId: user.id, _id: body.id });
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

  describe("PUT /api/tags", function() {
    it('should create and return a new item when provided valid data', function () {
      const newItem = { name: 'newTag' };
      let body;
      return chai.request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${token}`)
        .send(newItem)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(body).to.be.a('object');
          expect(body).to.have.keys('id', 'name', 'createdAt', 'updatedAt', 'userId');
          return Tag.findOne({ userId: user.id, _id: body.id });
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

  describe("DELETE /api/tags/:id", function() {
    it("delete a tag by id", function() {
      let tag;
      return Tag.findOne({ userId: user.id })
        .then(function(_tag) {
          tag = _tag;
          return chai.request(app).delete(`/api/tags/${tag.id}`).set('Authorization', `Bearer ${token}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Tag.findOne({ userId: user.id, _id: res.body.id });
        })
        .then(function(_tag) {
          expect(_tag).to.be.null;
        });
    });
  });
});
