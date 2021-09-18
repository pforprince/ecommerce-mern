const User = require("./models/userModel");
const Order = require("./models/orderModel");
const Product = require("./models/productModel");
const Products = require("./data/products");
const Users = require("./data/users");
require("dotenv").config();
const connectDB = require("./config/db");
const colors = require("colors");

connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Order.deleteMany();
    await Product.deleteMany();

    const createdUsers = await User.insertMany(Users);
    const adminUser = createdUsers[0]._id;

    const sampleProducts = await Products.map((product) => {
      return { ...product, user: adminUser };
    });

    await Product.insertMany(sampleProducts);
    console.log("Data IMPORTED".green.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error ${error}`.red.inverse);
    process.exit(1);
  }
};
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Order.deleteMany();
    await Product.deleteMany();

    console.log("Data DESTROYED".green.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error ${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") destroyData();
else importData();
