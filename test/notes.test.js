"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = require("../server");
const { TEST_MONGODB_URI, JWT_SECRET } = require("../config");

const Note = require("../models/note");
const Folder = require("../models/folder");
const Tag = require("../models/tags");
const User = require("../models/user");

const { notes, folders, tags, users } = require("../db/seed/notes");

const expect = chai.expect;
chai.use(chaiHttp);

describe("Notes API Resource", function() {
  let user = {};
  let token;
  before(function() {
    return mongoose
      .connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return Promise.all([
      User.insertMany(users),
      User.createIndexes(),
      Note.insertMany(notes),
      Folder.insertMany(folders),
      Folder.createIndexes(),
      Tag.insertMany(tags),
      Tag.createIndexes()
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

  describe("GET /api/notes", function() {
    it("Should return all notes", function() {
      // return Promise.all([
      //     Note.find(),
      //     chai.request(app).get('/api/notes')
      //   ])
      //     .then(([data, res]) => {
      //       expect(res).to.have.status(200);
      //       expect(res).to.be.json;
      //       expect(res.body).to.be.a('array');
      //       expect(res.body).to.have.length(data.length);
      //     });

      return;
      [Note.find({ userId: user.id }), chai.request(app).get("/api/notes")]
        .set("Authorization", `Bearer ${token}`)
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a("array");
          expect(res.body).to.have.length(data.length);
        });
    });
  });

  describe("GET /api/notes/:id", function() {
    it("should return correct note", function() {
      let data;

      return Note.findOne({ userId: user.id })
        .then(_data => {
          data = _data;
          return chai
            .request(app)
            .get(`/api/notes/${data.id}`)
            .set("Authorization", `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an("object");
          expect(res.body).to.have.keys(
            "id",
            "title",
            "content",
            "tags",
            "createdAt",
            "updatedAt",
            "userId"
          );

          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          // expect(res.body.folderId).to.equal(data.folderId);
          // expect(res.body.tags).to.equal(data.tags);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  describe("POST /api/notes", function() {
    it("should create and return a new item when provided valid data", function() {
      const newItem = {
        title: "The best article about cats ever!",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor..."
      };

      let res;

      return chai
        .request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send(newItem)
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header("location");
          expect(res).to.be.json;
          expect(res.body).to.be.a("object");
          expect(res.body).to.have.keys(
            "id",
            "title",
            "content",
            "createdAt",
            "updatedAt",
            "tags",
            "userId"
          );

          return Note.findOne({ _id: res.body.id, userId: user.id });
        })

        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  describe("PUT /api/notes", function() {
    it("should update fields you send over", function() {
      const updateData = {
        title: "sadfasdg",
        content: "hello"
      };

      return Note.findOne({ userId: user.id })
        .then(function(note) {
          updateData.id = note.id;

          return chai
            .request(app)
            .put(`/api/notes/${note.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          return Note.findOne({ _id: res.body.id, userId: user.id });
        })
        .then(function(note) {
          expect(note.title).to.equal(updateData.title);
          expect(note.content).to.equal(updateData.content);
        });
    });
  });

  describe("DELETE /api/notes/:id", function() {
    it("delete a note by id", function() {
      let note;

      return Note.findOne({ userId: user.id })
        .then(function(_note) {
          note = _note;
          return chai
            .request(app)
            .delete(`/api/notes/${note.id}`)
            .set("Authorization", `Bearer ${token}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Note.findOne({ _id: res.body.id, userId: user.id });
        })
        .then(function(_note) {
          expect(_note).to.be.null;
        });
    });
  });
});
