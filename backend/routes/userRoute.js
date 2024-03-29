const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const cors = require("cors");
var uuid = require("uuid-random");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/mobile/:mobile", async (req, res) => {
  try {
    const user = await prisma.userCart.findUnique({
      where: { phoneNumber: req.params.mobile },
    });
    if (user) {
      res.json(user);
    } else {
      // create the user
      const newUser = await prisma.userCart.create({
        data: { phoneNumber: req.params.mobile, rfidUID: uuid() },
      });
      res.json(newUser);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/rfid/:id", async (req, res) => {
  try {
    const user = await prisma.userCart.findUnique({
      where: { rfidUID: req.params.id },
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post("/cart/mobile/:mobile", async (req, res) => {
  
  try {
    const updatedUser = await prisma.userCart.update({
      where: { phoneNumber: req.params.mobile },
      data: { cart: req.body.newCart }, // Assuming 'newCart' is the updated JSON
    });
    res.json(updatedUser);
  } catch (error) {
    if (error.code === "P2025") {
      // User not found
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});
router.get("/users", async (req, res) => {
  // Add query parameters for pagination, filtering, etc, if needed
  // Example: /users?limit=10&skip=20

  const users = await prisma.userCart.findMany(); // Adjust for your actual User model
  res.json(users);
});
router.post("/users", async (req, res) => {
  try {
    // Assuming required fields like 'phoneNumber' and potentially 'name' are present in req.body
    const newUser = await prisma.user.create({
      data: req.body,
    });
    res.json(newUser);
  } catch (error) {
    // You can add specific error handling for validation errors here
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
