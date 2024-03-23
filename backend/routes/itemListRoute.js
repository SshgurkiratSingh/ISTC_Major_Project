const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
let tableStatus = [0, 0, 0];
router.get("/cart/checkOut", (req, res) => {
  const availableTableIndex = tableStatus.findIndex((status) => status === 0);

  if (availableTableIndex !== -1) {
    tableStatus[availableTableIndex] = 1; // Mark the table as occupied
    orderQuence.push({
      tableNumber: availableTableIndex + 1,
      order: cart,
      date: new Date(),
      estimatedTime: 30 * 60 * 1000,
      status: "pending",
      currentStatus: "ordered",
      paymentStatus: "pending",
      paymentMethod: "cash",
      completed: false,
      rating: null,
    });
    res.json(orderQuence[orderQuence.length - 1]); // Send the table number as response
    cart = []; // Clear the cart after checkout
    console.log(orderQuence);
  } else {
    res.status(400).json({ error: "No tables available" });
  }
});
const orderQuence = [];

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
      // Check if the category exists
      categorizedData[category] = []; // Create the array
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
router.delete("/cart/:id", (req, res) => {
  const id = req.params.id;
  // remove the item with index id
  cart.splice(id, 1);
  res.json({ message: "Item removed from cart" });
});

module.exports = router;
