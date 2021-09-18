const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");

// @desc     Fetch all products
// @route    Get /api/products
// @access   public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// @desc     Fetch single product
// @route    Get /api/product/:id
// @access   public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found!!");
  }
});

module.exports = {
  getProductById,
  getProducts,
};
