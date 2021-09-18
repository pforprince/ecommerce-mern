const bcrypt = require("bcryptjs");

const users = [
  {
    name: "Admin user",
    isAdmin: true,
    password: bcrypt.hashSync("123456", 10), // 10 is the default
    email: "admin@example.com",
  },
  {
    name: "Jane",
    isAdmin: false,
    password: bcrypt.hashSync("123456", 10), // 10 is the default
    email: "jane@example.com",
  },
  {
    name: "John",
    isAdmin: false,
    password: bcrypt.hashSync("123456", 10), // 10 is the default
    email: "john@example.com",
  },
];

module.exports = users;
