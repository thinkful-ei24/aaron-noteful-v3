const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");

const app = require("../server");
const { TEST_MONGODB_URI } = require("../config");

const Folder = require("../models/folder");

const folders = require("../db/seed/folders.json");

const expect = chai.expect;
chai.use(chaiHttp);

describe("Folders Testing", function() {

  before(function() {
    return mongoose.connect(TEST_MONGODB_URI);
  });
  beforeEach(function() {
    return Folder.insertMany(folders)
        .then(() => Folder.createIndexes());
  });
  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });
  after(function() {
    return mongoose.disconnect();
  });


  describe('GET /api/folders', function () {
    it('Should return all folders', function() {
        return 
            [Folder.find(),
            chai.request(app).get('/api/folders')]
            .then(([data, res]) => {
              expect(res).to.have.status(200);
              expect(res).to.be.json;
              expect(res.body).to.be.a('array');
              expect(res.body).to.have.length(data.length);
            });
    });
  });


  describe("GET /api/folders/:id", function() {
    it("should return correct folder", function() {
      let data;
      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/folders/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.keys(
            "id",
            "name",
            "createdAt",
            "updatedAt"
          );
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  describe("POST /api/folders", function() {
    it("should create and return a new folder when provided valid data", function() {
      const newItem = {
        name: "Another new folder"
      };
      let res;
      return (
        chai
          .request(app)
          .post("/api/folders")
          .send(newItem)
          .then(function(_res) {
            res = _res;
            expect(res).to.have.status(201);
            expect(res).to.have.header("location");
            expect(res).to.be.json;
            expect(res.body).to.be.a("object");
            expect(res.body).to.have.keys(
              "id",
              "name",
              "createdAt",
              "updatedAt"
            );
            return Folder.findById(res.body.id);
          })
          .then(data => {
            expect(res.body.id).to.equal(data.id);
            expect(res.body.name).to.equal(data.name);
            expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
            expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
          })
      );
    });
  });

  describe('PUT /api/folders', function() {

    it('should update fields you send over', function() {
      const updateData = {
        name: 'sadfasdg'
      };
      return Folder
        .findOne()
        .then(function(folder) {
          updateData.id = folder.id;
          return chai.request(app)
            .put(`/api/folders/${folder.id}`)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          return Folder.findById(updateData.id);
        })
        .then(function(folder) {
          expect(folder.name).to.equal(updateData.name);
        });
    });
  });

  describe('DELETE /api/folders/:id', function() {

    it('delete a folder by id', function() {
      let folder;
      return Folder
        .findOne()
        .then(function(_folder) {
          folder = _folder;
          return chai.request(app).delete(`/api/folders/${folder.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Folder.findById(folder.id);
        })
        .then(function(_folder) {
          expect(_folder).to.be.null;
        });
    });
  });


});
