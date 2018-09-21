const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");

const app = require("../server");
const { TEST_MONGODB_URI } = require("../config");

const Tag = require("../models/tags");

const tags = require("../db/seed/tags.json");

const expect = chai.expect;
chai.use(chaiHttp);

describe("Tags Testing", function() {
  before(function() {
    return mongoose.connect(TEST_MONGODB_URI);
  });
  beforeEach(function() {
    return Tag.insertMany(tags).then(() => Tag.createIndexes());
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
      [Tag.find(), chai.request(app).get("/api/tags")].then(
        ([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a("array");
          expect(res.body).to.have.length(data.length);
        }
      );
    });
  });

  describe("GET /api/tags/:id", function() {
    it("should return correct tag", function() {
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/tags/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.keys("id", "name", "createdAt", "updatedAt");
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  describe("POST /api/tags", function() {
    it("should create and return a new tag when provided valid data", function() {
      const newItem = {
        name: "Another new tag"
      };
      let res;
      return chai
        .request(app)
        .post("/api/tags")
        .send(newItem)
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header("location");
          expect(res).to.be.json;
          expect(res.body).to.be.a("object");
          expect(res.body).to.have.keys("id", "name", "createdAt", "updatedAt");
          return Tag.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  describe("PUT /api/tags", function() {
    it("should update fields you send over", function() {
      const updateData = {
        name: "sadfasdg"
      };
      return Tag.findOne()
        .then(function(tag) {
          updateData.id = tag.id;
          return chai
            .request(app)
            .put(`/api/tags/${tag.id}`)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          return Tag.findById(updateData.id);
        })
        .then(function(tag) {
          expect(tag.name).to.equal(updateData.name);
        });
    });
  });

  describe("DELETE /api/tags/:id", function() {
    it("delete a tag by id", function() {
      let tag;
      return Tag.findOne()
        .then(function(_tag) {
          tag = _tag;
          return chai.request(app).delete(`/api/tags/${tag.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Tag.findById(tag.id);
        })
        .then(function(_tag) {
          expect(_tag).to.be.null;
        });
    });
  });
});
