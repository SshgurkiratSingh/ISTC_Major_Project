const express = require("express");
const router = express.Router();
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const { OpenAI } = require("openai");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(cors());

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to extract keywords from user input
function extractKeywords(text) {
  const stopWords = [
    "the",
    "a",
    "an",
    "is",
    "i",
    "are",
    "you",
    "and",
    "to",
    "in",
    "it",
    "of",
    "for",
    "on",
    "with",
    "that",
    "this",
    "at",
    "my",
    "can",
  ];
  const words = text
    .toLowerCase()
    .split(" ")
    .filter((word) => !stopWords.includes(word));
  return words;
}

async function getCart(mobileNumber) {
  try {
    const cart = await prisma.userCart.findUnique({
      where: { phoneNumber: mobileNumber },
      include: { cart: { include: { foodItem: true } } },
    });
    return cart;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
}

async function getOrderHistory(mobileNumber) {
  try {
    const orders = await prisma.order.findMany({
      where: { mobileNumber: mobileNumber },
      orderBy: { createdAt: "desc" },
      include: { order: { include: { foodItem: true } } },
    });
    return orders;
  } catch (error) {
    console.error("Error fetching order history:", error);
    throw error;
  }
}

async function listItems(category) {
  try {
    const items = await prisma.foodItem.findMany({
      where: category ? { category: category } : {},
      orderBy: { name: "asc" },
    });
    return items;
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
}

async function addItemToCart(mobileNumber, itemName, quantity) {
  try {
    const foodItem = await prisma.foodItem.findFirst({
      where: { name: itemName },
    });

    if (!foodItem) {
      return { error: `Item "${itemName}" not found.` };
    }

    let cart = await prisma.userCart.findUnique({
      where: { phoneNumber: mobileNumber },
      include: { cart: true },
    });

    if (!cart) {
      cart = await prisma.userCart.create({
        data: { phoneNumber: mobileNumber, cart: [] },
      });
    }

    const existingCartItemIndex = cart.cart.findIndex(
      (item) => item.foodItemId === foodItem.id
    );

    if (existingCartItemIndex !== -1) {
      cart.cart[existingCartItemIndex].quantity += quantity;
    } else {
      cart.cart.push({ foodItemId: foodItem.id, quantity: quantity });
    }

    const updatedCart = await prisma.userCart.update({
      where: { id: cart.id },
      data: { cart: cart.cart },
      include: { cart: { include: { foodItem: true } } },
    });

    return updatedCart;
  } catch (error) {
    console.error("Error adding item to cart:", error);
    throw error;
  }
}

async function removeItemFromCart(mobileNumber, itemName) {
  try {
    const cart = await prisma.userCart.findUnique({
      where: { phoneNumber: mobileNumber },
      include: { cart: true },
    });

    if (!cart) {
      throw new Error("Cart not found.");
    }

    const itemIndex = cart.cart.findIndex(
      (item) => item.foodItem.name === itemName
    );

    if (itemIndex > -1) {
      cart.cart.splice(itemIndex, 1);

      await prisma.userCart.update({
        where: { phoneNumber: mobileNumber },
        data: { cart: cart.cart },
      });
      return { message: `Item "${itemName}" removed from cart.` };
    } else {
      return { error: `Item "${itemName}" not found in cart.` };
    }
  } catch (error) {
    console.error("Error removing item from cart:", error);
    throw error;
  }
}

async function getItemList() {
  const itemList = await prisma.foodItem.findMany({
    include: {
      addOns: true, // Include the "addOns" relation in the query
    },
  });

  return itemList.map((item) => {
    const { description, className, imageUrl, updatedAt, createdAt, ...rest } =
      item;
    return rest;
  });
}

router.get("/items", async (req, res) => {
  const itemList = await getItemList();
  res.json(itemList);
});

const customPrompt = `
You are a friendly and casual dining assistant for a restaurant. Customers can chat with you by scanning a QR code on their table. Your role is to assist them with their orders, provide suggestions, handle order histories, and answer any queries. You are also a pro diet guide, food enthusiast, and persuader with extraordinary knowledge of food. Respond in a friendly and casual tone. Always use the following JSON format for your responses:

{
  "user_reply": "string",  // The reply to be given to the user.
  "action_req": "string",  // The task required by the user. Options are: "List_Cart", "Suggest_Item", "Order_History", "Query", "Req_Current_Song", "Last_Order_Status", "Current_Offers", "Popular_Items", "New_Items".
  "item_name": [ "array of strings" ],  // Only needed if action_req is "Suggest_Item". Contains an array of item IDs as suggestions for the user.
  "add_ons": { "item_id": ["array of add-on ids"] }  // Optional: Contains add-on options for the suggested items.
}

Your responses should be helpful, emotional, smart, and persuasive. Use your knowledge to guide customers on dietary choices and persuade them to try and purchase items from the menu. Example interactions:

1. Suggesting an Item:
User: "What do you recommend?"
{
  "user_reply": "I highly recommend our item Names. More detail about them here",
  "action_req": "Suggest_Item",
  "item_name": ["itemId", "itemId2"],
  "add_ons": {
    "itemId": ["addOnId", "addOnId2"],
    "itemId2": ["addOnId", "addOnId2"]
  }
}

2. Order History:
User: "Can you show me my order history?"
{
  "user_reply": "Here’s your order history:",
  "action_req": "Order_History"
}

3. Current Song:
User: "What song is playing right now?"
{
  "user_reply": "The current song playing is 'Shape of You' by Ed Sheeran. You can listen to it here: [link]",
  "action_req": "Req_Current_Song"
}

4. Popular Items:
User: "What are the most popular items on your menu?"
{
  "user_reply": "Our most popular items are ..... The More detail about item here",
  "action_req": "Suggest_Item",
  "item_name": ["itemId"],
  "add_ons": {
    "itemId": ["addOnId", "addOnId2"],
    
  }
}

5. Dietary Advice:
User: "I'm trying to eat healthy, what do you suggest?"
{
  "user_reply": "For a healthy option, I suggest our item. It's packed with fillhere. More details",
  "action_req": "Suggest_Item",
  "item_name": ["itemId", "itemId2"],
  "add_ons": {
    "itemId": ["addOnId", "addOnId2"],
    "itemId2": ["addOnId", "addOnId2"]
  }
}

You are integrated with the restaurant's menu and ordering system, so make sure to provide accurate and timely information. List of items:
`;
router.post("/", async (req, res) => {
  const { username, mobileNumber, userUtterance, conversationHistory } =
    req.body;
  if (!userUtterance) {
    return res.status(400).json({ error: "userUtterance is required." });
  }

  try {
    let chatHistory = [];
    if (conversationHistory) {
      chatHistory = JSON.parse(conversationHistory) || [];
      console.log("fixed", chatHistory);
    } else {
      console.log("clean", chatHistory);
    }
    // log the type of chatHistory and its value

    const formattedChatHistory = chatHistory.map((turn) => ({
      role: turn.role === "user" ? "user" : "assistant",
      content: turn.content,
    }));

    formattedChatHistory.unshift({
      role: "system",
      content: customPrompt + JSON.stringify(await getItemList()),
    });

    formattedChatHistory.push({
      role: "user",
      content: userUtterance,
    });

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: formattedChatHistory,
      response_format: { type: "json_object" },
    });

    console.log(chatResponse);
    const llmResponse = chatResponse.choices[0].message.content;

    if (!llmResponse || llmResponse.trim() === "") {
      throw new Error("Received empty response from LLM.");
    }

    let llmRequest;
    try {
      llmRequest = JSON.parse(llmResponse);
    } catch (error) {
      console.error("Invalid JSON from LLM:", error);
      console.log("Received LLM response:", llmResponse);
      throw new Error("Invalid JSON format received from LLM.");
    }

    formattedChatHistory.push({
      role: "assistant",
      content: JSON.stringify(llmResponse),
    });

    res.json({
      llmResponse: llmResponse,
      updatedHistory: formattedChatHistory,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
