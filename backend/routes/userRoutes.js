const express = require("express");
const router = express.Router();
const {
  authUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  registerUser,
  getUsers,
  getUserById,
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/login", authUser);
router.route("/").post(registerUser).get(protect, admin, getUsers);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route("/:id").delete(deleteUser).get(protect, getUserById);

module.exports = router;
