const { assert } = require('chai');

const  findUserByEmail  = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail(testUsers,"user@example.com");
    const expectedUserID = "user@example.com";
    // Write your assert statement here
    assert.equal(user.email,expectedUserID,'Checks if it is a valid email');
  });
  it('should return undefined if email not in database', function() {
    const user = findUserByEmail(testUsers,"user1@example.com");
    const expectedUserID = undefined;
    // Write your assert statement here
    assert.equal(user,expectedUserID,'Checks if email is in the database');
  });
});