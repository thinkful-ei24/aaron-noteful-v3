const app = require("../server");
const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");

const { TEST_MONGODB_URI } = require("../config");

const User = require("../models/user");

const expect = chai.expect;

chai.use(chaiHttp);

describe("Noteful API - Users", function() {
  let username = "exampleUser";
  let password = "examplePass";
  let fullName = "Example User";

  before(function() {
    return mongoose
      .connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return User.createIndexes();
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  describe("/api/users", function() {
    describe("POST", function() {
      it("Should create a new user", function() {
        const testUser = { username, password, fullName };

        let res;
        return chai
          .request(app)
          .post("/api/users")
          .send(testUser)
          .then(_res => {
            res = _res;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys("id", "username", "fullName");
            expect(res.body.id).to.exist;
            expect(res.body.username).to.equal(testUser.username);
            expect(res.body.fullName).to.equal(testUser.fullName);
            return User.findOne({ username });
          })
          .then(user => {
            expect(user).to.exist;
            expect(user.id).to.equal(res.body.id);
            expect(user.fullName).to.equal(testUser.fullName);
            return user.validatePassword(password);
          })
          .then(isValid => {
            expect(isValid).to.be.true;
          });
      });
      it("Should reject users with missing username", function() {
        const testUser = { password, fullName };
        return chai
          .request(app)
          .post("/api/users")
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
          });
      });

      /**
       * COMPLETE ALL THE FOLLOWING TESTS
       */
      it("Should reject users with missing password", function() {
        const testUser = { fullName, username };
        return chai
          .request(app)
          .post("/api/users")
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.location).to.equal('password')
          });
      });
      it("Should reject users with non-string username", function() {
        username = 5;
        const testUser = { fullName, username, password };
        return chai
          .request(app)
          .post("/api/users")
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
          });
      });

      it("Should reject users with non-string password", function() {
        password = 5;
        const testUser = { fullName, username, password };
        return chai
          .request(app)
          .post("/api/users")
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
          });
      });
      it("Should reject users with non-trimmed username", function() {
        username = "nottrimmed  ";
        const testUser = { fullName, username, password };
        return chai
          .request(app)
          .post("/api/users")
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
          });
      });
      it("Should reject users with non-trimmed password", function() {
        password = "nottrimmed  ";
        const testUser = { fullName, username, password };
        return chai
          .request(app)
          .post("/api/users")
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
          });
      });
      it("Should reject users with empty username", function() {
        username = "";
        const testUser = { fullName, username, password };
        return chai
          .request(app)
          .post("/api/users")
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
          });
      });
      it("Should reject users with password less than 8 characters", function() {
        password = "lesst8";
        const testUser = { fullName, username, password };
        return chai
          .request(app)
          .post("/api/users")
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
          });
      });
      it("Should reject users with password greater than 72 characters", function() {
        password =
          "greaterthan72ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        const testUser = { fullName, username, password };
        return chai
          .request(app)
          .post("/api/users")
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
          });
      });
      it("Should reject users with duplicate username", function() {
        username = "msgreen";
        const testUser = { fullName, username, password };
        return chai
          .request(app)
          .post("/api/users")
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
          });
      });
      it("Should trim fullname", function() {
        fullName = "nottrimmed  ";
        const testUser = { fullName, username, password };
        return chai
          .request(app)
          .post("/api/users")
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
          });
      });
    });
  });
});
