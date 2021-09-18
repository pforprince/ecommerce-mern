const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");

// @desc     Auth user & get token
// @route    post /api/users/login
// @access   public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      // password:user.password,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or password");
  }
});

// @desc    register user
// @route    post /api/users/
// @access   public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });
  if (user) {
    console.log("inside 45");
    console.log(user);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc     get user profile
// @route    post /api/users/profile
// @access   private
const getUserProfile = asyncHandler(async (req, res) => {
  if (req.user) {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or password");
  }
});

// @desc     Update user profile
// @route    put /api/users/profile
// @access   private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }
    const updatedUser = await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or password");
  }
});

// @desc     get all user
// @route    post /api/users/
// @access   private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});

// @desc     delete user by admin
// @route    Delete /api/users/:id
// @access   private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const user = await User.findById(id);
  if (user) {
    await user.remove();
    res.status(200).json({ message: "User removed successfully" });
  } else {
    throw new Error("User not found");
  }
});

// @desc     get user by id
// @route    get /api/users/:id
// @access   private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  console.log("fun hit");
  const user = await User.findById(id).select("-password");
  if (user) {
    res.status(200).json({ message: "User", user });
  } else {
    throw new Error("User not found");
  }
});

module.exports = {
  authUser,
  registerUser,
  getUserById,
  getUserProfile,
  deleteUser,
  getUsers,
  updateUserProfile,
};
