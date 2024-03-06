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
module.exports = router;
