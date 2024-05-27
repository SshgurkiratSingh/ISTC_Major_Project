import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Avatar,
  Input,
  Spacer,
  Card,
  CardBody,
  Divider,
  Image,
  Accordion,
  AccordionItem,
  Chip,
  CardHeader,
} from "@nextui-org/react";
import { CheckoutPage } from "./CheckoutPage";
import API_BASE_URL from "@/APIconfig";
import { set } from "date-fns";
import NowPlaying from "@/app/component/MainPage/NowPlaying";
import { toast } from "react-toastify";

export interface FoodItem {
  id: string;
  name: string;
  misc?: string;
  description: string;
  className: string;
  price: number;
  category: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  addOns: AddOn[];
}

export interface AddOn {
  id: string;
  name: string;
  url?: string;
  price: number;
  foodItemId?: string;
  quantity?: number;
}

export interface CartItem {
  title: string;
  description?: string;
  misc?: string;
  imageUrl: string;
  price: number;
  quantity: number;
  addOnIds?: AddOn[]; // Optional array of AddOn objects
}

// Assuming your top-level structure is an object with category names as keys and arrays of FoodItems as values
export interface MenuData {
  [category: string]: FoodItem[];
}

interface LlmChatProps {
  cart: CartItem[];
  table: string;
  mobileNumber: string;
  itemData: MenuData;
}

interface ConversationTurn {
  role: "system" | "user" | "assistant";
  content: string;
}

interface LLMResponseType {
  user_reply: string;
  action_req:
    | "Suggest_Item"
    | "List_Cart"
    | "Order_History"
    | "Query"
    | "Req_Current_Song"
    | "Last_Order_Status"
    | "Current_Offers"
    | "error"
    | "New_Items";
  item_name: string[];
  add_ons: {
    [itemId: string]: string[];
  };
}

export default function LlmChat({
  cart,
  table,
  mobileNumber,
  itemData,
}: LlmChatProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState<LLMResponseType | null>(null);
  const [chatHistory, setChatHistory] = useState<ConversationTurn[]>([]);
  const [car, setCart] = useState<CartItem[]>([]);
  const [addToCartLoading, setAddToCartLoading] = useState<string | null>(null);
  const [currentPlaying, setCurrentPlaying] = useState<{
    artist: string;
    title: string;
    link: string;
  }>({ artist: "", title: "", link: "" });
  useEffect(() => {
    setCart(cart);
  });
  useEffect(() => {
    const fetchCurrentPlaying = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/spotify/currentQueue`
        );
        const data = await response.json();
        setCurrentPlaying({
          artist: data.body.item.artists[0].name,
          title: data.body.item.name,
          link: data.body.item.external_urls.spotify,
        });
      } catch (error) {
        console.error("Error fetching current playing track:", error);
      }
    };

    fetchCurrentPlaying();
  }, []);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await axios.post("/api/api/v1/llm", {
        username: table,
        mobileNumber: mobileNumber,
        userUtterance: userInput,
        conversationHistory: JSON.stringify(chatHistory),
      });

      const { llmResponse, updatedHistory } = data;

      if (llmResponse) {
        try {
          const parsedResponse: LLMResponseType = JSON.parse(llmResponse);
          setResponse(parsedResponse);
          console.log("LLM Response:", parsedResponse);
        } catch (error) {
          console.error("Error parsing LLM response:", error);
          setResponse({
            user_reply: "Error parsing LLM response. Please try again.",
            action_req: "error",
            item_name: [],
            add_ons: {},
          });
        }
      } else {
        setResponse({
          user_reply: "No response received from the LLM.",
          action_req: "error",
          item_name: [],
          add_ons: {},
        });
      }

      setChatHistory(
        updatedHistory.filter(
          (turn: ConversationTurn) => turn.role !== "system"
        )
      );
    } catch (error) {
      console.error("Error:", error);
      setResponse({
        user_reply: "Error occurred. Please try again.",
        action_req: "error",
        item_name: [],
        add_ons: {},
      });
    } finally {
      setIsLoading(false);
      setUserInput("");
    }
  };

  const handleAddToCart = async (itemId: string) => {
    console.log("Adding to cart:", itemId);
    setAddToCartLoading(itemId);
    try {
      const item = Object.values(itemData)
        .flat()
        .find((item) => item.id === itemId);

      if (!item) {
        console.error(`Item with id ${itemId} not found in itemData`);
        setAddToCartLoading(null);
        return;
      }

      const addOns = (response?.add_ons[itemId] || [])
        .map((addOnId) => item.addOns.find((addOn) => addOn.id === addOnId))
        .filter(Boolean) as AddOn[];

      const cartItem: CartItem = {
        title: item.name,
        description: item.description,
        imageUrl: item.imageUrl || "https://via.placeholder.com/150",
        price: item.price,
        quantity: 1,
        addOnIds: addOns,
      };
      console.log(cartItem);
      setCart((prevCart) => {
        const updatedCart = [...prevCart, cartItem];
        console.log("Cart updated:", updatedCart);
        return updatedCart;
      });
      console.log(cart);

      // Uncomment the following line if you want to send the updated cart to the server
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/user/cart/mobile/${mobileNumber}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ car }), // Send the flat cart directly
          }
        );

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const updatedCart = await response.json();
        setCart(updatedCart.cart);
      } catch (error) {
        console.error("Error updating cart:", error);
        toast.error("An error occurred while updating the cart.");
      }

      setAddToCartLoading(null);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setAddToCartLoading(null);
    }
  };
  const renderContent = (messageContent: string) => {
    try {
      const parsedContent = JSON.parse(messageContent);
      return parsedContent.user_reply || messageContent;
    } catch (error) {
      return messageContent; // Return original content if parsing fails
    }
  };

  return (
    <div>
      <div className="list-group-item text-right font-bold">
        <Button color="danger" onClick={onOpen}>
          Chat
        </Button>
        <Modal
          backdrop="opaque"
          placement="top"
          scrollBehavior="inside"
          className="dark h-full w-full min-w-full"
          isOpen={isOpen}
          onClose={onClose}
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1 dark">
              Chat with LLM
            </ModalHeader>
            <ModalBody>
              <div style={{ overflowY: "auto" }} className="p-2">
                {chatHistory.map((message, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection:
                        message.role === "user" ? "row-reverse" : "row",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                    className="border-blue-500/10 border-1 rounded-lg p-2"
                  >
                    <Avatar
                      className="m-0.5"
                      color="secondary"
                      size="sm"
                      src={
                        message.role === "user" ? "/user.jpeg" : "/pcKit.jpeg"
                      }
                    />
                    <Spacer x={0.5} />

                    {index === chatHistory.length - 1 ? (
                      <div>
                        <h3>{response?.user_reply}</h3>
                        {response?.action_req === "error" && (
                          <p className="text-red-500">
                            Error: {response?.user_reply}
                          </p>
                        )}
                        {response?.action_req === "List_Cart" && (
                          <div className="flex flex-col gap-1">
                            <CheckoutPage
                              cart={car}
                              mobileNumber={mobileNumber}
                              table={table}
                            />
                          </div>
                        )}
                        {response?.action_req === "Req_Current_Song" && (
                          <NowPlaying title={currentPlaying.title} artist={currentPlaying.artist} link={currentPlaying.link}  />
                        )}
                        {(response?.action_req === "Suggest_Item" ||
                          response?.action_req === "New_Items") &&
                          (response.item_name || []).map((itemId) => {
                            const item = Object.values(itemData)
                              .flat()
                              .find((item) => item.id === itemId);
                            if (!item) return null;

                            return (
                              <Card
                                key={item.id}
                                className="m-4 rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
                              >
                                {response?.action_req === "New_Items" && (
                                  <CardHeader className="flex flex-col items-center justify-center p-6">
                                    <Chip color="secondary">New</Chip>
                                  </CardHeader>
                                )}
                                <CardBody className="flex flex-col items-center justify-center p-6">
                                  <div className="relative w-48 h-48 mb-4">
                                    <Image
                                      src={`/food/${item.imageUrl}` || ""}
                                      alt={item.name}
                                      className="rounded-full"
                                    />
                                  </div>
                                  <h2 className="text-2xl font-bold text-center mb-2">
                                    {item.name}
                                  </h2>
                                  <p className="text-lg text-gray-600 mb-4">
                                    Rs. {item.price}
                                  </p>
                                  <Divider className="w-full mb-4" />
                                  <h3 className="text-lg font-semibold mb-2">
                                    Add-Ons:
                                  </h3>
                                  <div className="flex flex-wrap justify-center">
                                    {response.add_ons != null &&
                                      response.add_ons[itemId] &&
                                      (response.add_ons[itemId] || []).map(
                                        (addOnId) => {
                                          const addOn = item.addOns.find(
                                            (addOn) => addOn.id === addOnId
                                          );
                                          return addOn ? (
                                            <div
                                              key={addOn.id}
                                              className="flex flex-col items-center justify-center mx-2 mb-4"
                                            >
                                              <div className="relative w-16 h-16 mb-2">
                                                <Image
                                                  src={
                                                    `/food/${addOn.url}` || ""
                                                  }
                                                  alt={addOn.name}
                                                  className="rounded-full"
                                                />
                                              </div>
                                              <p className="text-sm text-gray-600 text-center">
                                                {addOn.name} - Rs.
                                                {addOn.price}
                                              </p>
                                            </div>
                                          ) : null;
                                        }
                                      )}
                                  </div>
                                  <Divider className="w-full my-4" />
                                  <Button
                                    color={
                                      addToCartLoading === item.id
                                        ? "success"
                                        : "primary"
                                    }
                                    onClick={() => handleAddToCart(item.id)}
                                    disabled={addToCartLoading === item.id}
                                    className="w-full py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                                  >
                                    {addToCartLoading === item.id
                                      ? "Adding..."
                                      : "Add to Cart"}
                                  </Button>
                                </CardBody>
                              </Card>
                            );
                          })}
                      </div>
                    ) : (
                      <div>{renderContent(message.content)}</div>
                    )}
                  </div>
                ))}
                <Input
                  fullWidth
                  color="primary"
                  size="lg"
                  placeholder="Type your query..."
                  disabled={isLoading}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit(e);
                    }
                  }}
                />

                <Button
                  disabled={isLoading}
                  className="m-2"
                  variant="shadow"
                  color="primary"
                  onClick={handleSubmit}
                >
                  {isLoading ? "Loading..." : "Send"}
                </Button>

                {response && (
                  <Accordion>
                    <AccordionItem
                      key="1"
                      aria-label="Accordion 1"
                      title="Debugging Log"
                    >
                      <div>
                        <h3>LLM Response:</h3>
                        <p>{response.user_reply}</p>
                        <p>Action Requested: {response.action_req}</p>
                        <p>Item Names: {response.item_name?.join(", ")}</p>
                      </div>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}