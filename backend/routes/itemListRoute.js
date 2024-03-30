const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
let tableStatus = [0, 0, 0];
router.get("/cart/checkOut", async (req, res) => {
  const availableTableIndex = tableStatus.findIndex(
    (status) => status === undefined
  );

  if (availableTableIndex !== -1) {
    try {
      const newOrder = await prisma.order.create({
        data: {
          tableNumber: availableTableIndex + 1,
          order: cart,
          date: new Date(),
          estimatedTime: 30 * 60 * 1000,
          status: "pending",
          currentStatus: "ordered",
          paymentStatus: "pending",
          paymentMethod: "cash",
          completed: false,
        },
      });

      tableStatus[availableTableIndex] = newOrder.id; // Store the order ID
      res.json(newOrder);
      cart = []; // Clear the cart
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(400).json({ error: "No tables available" });
  }
});

router.post("/table/checkOut", async (req, res) => {
  const tableNumber = req.body.tableNumber;
  const mobileNumber = req.body.mobileNumber;
  const paymentMethod = req.body.paymentMethod;
  console.log(tableNumber, mobileNumber, paymentMethod);
  if (!tableNumber || !mobileNumber || !paymentMethod) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  try {
    const order = await prisma.userCart.findUnique({
      where: {
        phoneNumber: mobileNumber,
      },
    });
    console.log(order);
    const newOrder = await prisma.order.create({
      data: {
        tableNumber: Number(tableNumber),
        order: order,
        date: new Date(),
        estimatedTime: 30 * 60 * 1000,
        status: "pending",
        currentStatus: "ordered",
        paymentStatus: "pending",
        paymentMethod: paymentMethod,
        completed: false,
        rating: null,
        mobileNumber: mobileNumber,
      },
    });

    tableStatus[tableNumber - 1] = newOrder.id; // Store the order ID

    await prisma.userCart.update({
      where: {
        phoneNumber: mobileNumber,
      },
      data: {
        cart: [],
      },
    });

    res.json({
      message: "Table checked out successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  const data = await prisma.foodItem.findMany({
    include: {
      addOns: true, // Include the "addOns" relation in the query
    },
  });

  res.send(groupByCategory(data));
});
let cart = [];
/**
 * Groups the input data by category.
 *
 * @param {Array} data - The input data to be categorized
 * @return {Object} An object with categories as keys and items as values
 */
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
// Purpose: Get the Cart
router.get("/cart", (req, res) => {
  res.send(cart);
});
// Purpose: Add an item to the Cart
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
// Purpose: Update the Cart
router.post("/updateCart", (req, res) => {
  const newCart = req.body;
  cart = newCart;
  res.json({ message: "Cart updated" });
});
// Purpose: Remove an item from the Cart by ID
router.delete("/cart/:id", (req, res) => {
  const id = req.params.id;
  // remove the item with index id
  cart.splice(id, 1);
  res.json({ message: "Item removed from cart" });
});
// Purpose : Get all orders
router.get("/orders", async (req, res) => {
  const status = req.query.status; // Filter by status (optional)
  const skip = parseInt(req.query.skip) || 0;
  const take = parseInt(req.query.take) || 10;

  try {
    const where = status ? { status } : {};

    const orders = await prisma.order.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" }, // Example: Order by creation date
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Purpose: Update an order's status (e.g., 'pending', 'preparing', 'ready', 'completed')
router.put("/orders/:id/status", async (req, res) => {
  const allowedStatuses = ["pending", "preparing", "ready", "completed"];
  const newStatus = req.body.status;

  if (!allowedStatuses.includes(newStatus)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: newStatus },
    });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Purpose : Update an order's table number
router.put("/orders/:id/table", async (req, res) => {
  const newTableNumber = req.body.tableNumber;

  if (!isTableAvailable(newTableNumber)) {
    res.status(400).json({ error: "Table is not available" });
    return;
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: { tableNumber: newTableNumber },
    });

    const oldTableNumber = updatedOrder.tableNumber - 1; // Adjust for array index
    tableStatus[oldTableNumber] = undefined; // Clear old table status
    tableStatus[newTableNumber - 1] = updatedOrder.id; // Set new table status

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//
// (Add authorization to protect this route)
router.delete("/orders/:id", async (req, res) => {
  try {
    const deletedOrder = await prisma.order.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Purpose: Update an order's payment status (e.g., 'pending', 'paid', 'failed').

router.put("/orders/:id/payment-status", async (req, res) => {
  const allowedStatuses = ["pending", "paid", "failed"];
  const newStatus = req.body.status;

  if (!allowedStatuses.includes(newStatus)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: { paymentStatus: newStatus },
    });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Purpose: Get a list of orders grouped by their table number.
router.get("/orders/tables", async (req, res) => {
  try {
    const ordersByTable = {};

    const orders = await prisma.order.findMany({
      where: { completed: false }, // Assuming you want current orders
    });

    for (const order of orders) {
      if (!ordersByTable[order.tableNumber]) {
        ordersByTable[order.tableNumber] = [];
      }
      ordersByTable[order.tableNumber].push(order);
    }

    res.json(ordersByTable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Purpose: Allows cancellation of an order, typically if it hasn't reached a certain stage of preparation.
router.post("/orders/:id/cancel", async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Allow cancellation only within a certain timeframe or before a specific status
    if (order.status !== "pending") {
      res
        .status(400)
        .json({ error: "Order cannot be cancelled at this stage" });
      return;
    }

    const cancelledOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: "cancelled" },
    });

    res.json(cancelledOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const moment = require("moment"); // Assuming you've installed moment.js
const _ = require("lodash"); // Assuming you've installed lodash

router.get("/orders/reports", async (req, res) => {
  const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
  const reportType = req.query.reportType;

  try {
    const whereClause = {
      status: "completed", // Only consider completed orders
    };

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    switch (reportType) {
      case "sales":
        const salesReport = await prisma.order.aggregate({
          where: whereClause,
          _sum: {
            // Replace 'subtotal' with the field representing an item's total
            subtotal: true,
          },
        });
        res.json(salesReport);
        break;

      case "topItems":
        const topItemsReport = await prisma.order.groupBy({
          by: ["order"], // Group by the 'order' JSON field
          where: whereClause,
          orderBy: {
            _count: {
              order: "desc",
            },
          },
          _count: {
            order: true, // Count occurrences of each item
          },
          take: 10, // Fetch the top 10
        });

        const formattedReport = topItemsReport.map((result) => {
          // Format the data as needed
          return { items: result.order, count: result._count.order };
        });

        res.json(formattedReport);
        break;

      // ... add more cases for additional report types ...

      default:
        res.status(400).json({ error: "Invalid report type" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
