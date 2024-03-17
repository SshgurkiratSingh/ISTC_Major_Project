const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
router.get("/", async (req, res) => {
  const data = await prisma.foodItem.findMany({
    include: {
      addOns: true, // Include the "addOns" relation in the query
    },
  });

  res.send(groupByCategory(data));
});
let cart = [];
function groupByCategory(data) {
  const categorizedData = {};

  // Loop through each item
  for (const item of data) {
    const category = item.category; // Extract the category

    // If the category doesn't exist yet, create an empty array for it
    if (!categorizedData[category]) {
      categorizedData[category] = [];
    }

    // Push the item into its corresponding category array
    categorizedData[category].push(item);
  }

  // Return the object with categories as keys and items as values
  return categorizedData;
}
router.get("/cart", (req, res) => {
  res.send(cart);
});
router.post("/cart", (req, res) => {
  const item = req.body;
  cart.push(item);
  res.json({
    message: "Item added to cart",
  });
});
router.get("/clearCart", (req, res) => {
  cart = [];
  res.json({ message: "Cart cleared" });
});
router.post("/updateCart", (req, res) => {
  const newCart = req.body;
  cart = newCart;
  res.json({ message: "Cart updated" });
});
module.exports = router;
