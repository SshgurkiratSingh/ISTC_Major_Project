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
import ReactMarkdown from "react-markdown";

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
  refreshCart: () => void;
  currentSongPlaying: {
    artist: string;
    title: string;
    link: string;
  };
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
    | "New_Items"
    | "Skip_Song"
    | "Add_Song_to_Quence";
  item_name: string[];
  add_ons: {
    [itemId: string]: string[];
  };
  spotify_id?: string;
}

export default function LlmChat({
  cart,
  table,
  mobileNumber,
  itemData,
  refreshCart,
  currentSongPlaying,
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
    setCurrentPlaying(currentSongPlaying);
  }, [currentPlaying, currentSongPlaying]);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await axios.post("/api/api/v1/llm", {
        username: table,
        mobileNumber: mobileNumber,
        userUtterance: userInput,
        conversationHistory: JSON.stringify(chatHistory),
        songDetails: JSON.stringify(currentPlaying),
      });

      const { llmResponse, updatedHistory } = data;

      if (llmResponse) {
        try {
          const parsedResponse: LLMResponseType = JSON.parse(llmResponse);
          setResponse(parsedResponse);
          if (parsedResponse.action_req === "Skip_Song") {
            axios.get("/api/api/v1/spotify/nextSong");
          }

          if (parsedResponse.action_req === "Add_Song_to_Quence") {
            axios
              .post("/api/api/v1/spotify/addToQueue", {
                id: parsedResponse.spotify_id,
              })
              .then(() => {
                toast.success("Song added to queue");
              });
          }

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

        try {
          const updateCartOnServer = async (updatedCart: CartItem[]) => {
            const response = await fetch(
              `${API_BASE_URL}/api/v1/user/cart/mobile/${mobileNumber}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newCart: updatedCart }), // Send the updated cart directly
              }
            );

            if (!response.ok) {
              throw new Error(
                `API request failed with status ${response.status}`
              );
            }

            const result = await response.json();
            setCart(result.cart);
          };

          updateCartOnServer(updatedCart);
          refreshCart();
        } catch (error) {
          console.error("Error updating cart:", error);
          toast.error("An error occurred while updating the cart.");
        }

        return updatedCart;
      });

      setAddToCartLoading(null);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setAddToCartLoading(null);
    }
  };
  const renderContent = (messageContent: string) => {
    try {
      // Clean up the string by removing newline characters and trimming extra spaces
      const cleanedContent = messageContent
        .replace(/\\n/g, "")
        .replace(/\n/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();
      // Parse the cleaned string
      const parsedContent = JSON.parse(cleanedContent) as LLMResponseType;
      return parsedContent.user_reply || messageContent;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return messageContent; // Return original content if parsing fails
    }
  };

  return (
    <div className="flex justify-end">
      <Button color="danger" onClick={onOpen} className="rounded-full">
        <span className="material-icons">chat</span>
      </Button>
      <Modal
        placement="top"
        scrollBehavior="inside"
        className="dark h-full w-full min-w-full bg-transparent border-1  rounded-lg"
        isOpen={isOpen}
        onClose={onClose}
        backdrop="blur"
      >
        <ModalContent className="bg-transparent rounded-lg shadow-lg ">
          <ModalHeader className="flex flex-col gap-1 dark text-white">
            Chat with LLM
          </ModalHeader>
          <ModalBody className="p-4">
            <div
              style={{ overflowY: "auto" }}
              className="p-2 rounded-lg bg-transparent "
            >
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection:
                      message.role === "user" ? "row-reverse" : "row",
                    alignItems: "flex-start",
                    marginBottom: "10px",
                  }}
                  className={`rounded-lg p-2 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-sky-600 to-indigo-800 text-white"
                      : "bg-gradient-to-r from-red-800 to-purple-600 text-white"
                  }`}
                >
                  <Spacer x={0.5} />

                  {index === chatHistory.length - 1 ? (
                    <div>
                      <ReactMarkdown className="text-white">
                        {response?.user_reply}
                      </ReactMarkdown>
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
                        <NowPlaying
                          title={currentPlaying.title}
                          artist={currentPlaying.artist}
                          link={currentPlaying.link}
                        />
                      )}
                      {response?.action_req === "Skip_Song" && (
                        <Chip color="warning">Skip the current song</Chip>
                      )}
                      {response?.action_req === "Add_Song_to_Quence" && (
                        <Chip color="secondary">
                          Adding the current song to queue
                        </Chip>
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
                              className="m-4 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 bg-gray-800 text-white"
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
                                <p className="text-lg text-gray-400 mb-4">
                                  Rs. {item.price}
                                </p>
                                <Divider className="w-full mb-4 bg-gray-600" />
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
                                                src={`/food/${addOn.url}` || ""}
                                                alt={addOn.name}
                                                className="rounded-full"
                                              />
                                            </div>
                                            <p className="text-sm text-gray-400 text-center">
                                              {addOn.name} - Rs.{addOn.price}
                                            </p>
                                          </div>
                                        ) : null;
                                      }
                                    )}
                                </div>
                                <Divider className="w-full my-4 bg-gray-600" />
                                <Button
                                  color={
                                    addToCartLoading === item.id
                                      ? "success"
                                      : "primary"
                                  }
                                  onClick={() => handleAddToCart(item.id)}
                                  disabled={addToCartLoading === item.id}
                                  className="w-full py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105 bg-blue-500 text-white hover:bg-blue-600"
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
                    <div className="text-white">
                      {renderContent(message.content)}
                    </div>
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
                className="bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <Button
                disabled={isLoading}
                className="m-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300"
                variant="shadow"
                color="primary"
                onClick={handleSubmit}
              >
                {isLoading ? "Loading..." : "Send"}
              </Button>

              {response && (
                <Accordion className="bg-gray-800 rounded-lg shadow-lg">
                  <AccordionItem
                    key="1"
                    aria-label="Accordion 1"
                    title="Debugging Log"
                    className="text-white"
                  >
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">
                        LLM Response:
                      </h3>
                      <p className="text-gray-300 mb-2">
                        {response.user_reply}
                      </p>
                      <p className="text-gray-300 mb-2">
                        Action Requested: {response.action_req}
                      </p>
                      <p className="text-gray-300">
                        Item Names: {response.item_name?.join(", ")}
                      </p>
                    </div>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={onClose}
              className="rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-300"
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
