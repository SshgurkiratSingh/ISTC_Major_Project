"use client";
import {
  Card,
  CardHeader,
  CardBody,
  Image,
  Divider,
  Button,
  Tabs,
  Tab,
} from "@nextui-org/react";
import NowPlaying from "./NowPlaying";
import ItemBox from "../itemBox";
import Cart from "./Cart";
import LoginPageForKiosk from "./Login";
import { useEffect, useState } from "react";
import API_BASE_URL from "@/APIconfig";import { motion, AnimatePresence } from "framer-motion";
// import toast, { toastConfig } from "react-simple-toasts";
import "react-simple-toasts/dist/theme/ocean-wave.css";
import { Bounce, ToastContainer, toast } from "react-toastify";
// toastConfig({
//   theme: "ocean-wave",
//   position: "top-right",
//   clickClosable: true,
//   className: "rounded-lg",
// });

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
  imageUrl: string;
  price: number;
  quantity: number;
  addOnIds?: AddOn[]; // Optional array of AddOn objects
}

// Assuming your top-level structure is an object with category names as keys and arrays of FoodItems as values
export interface MenuData {
  [category: string]: FoodItem[];
}

const HomePage = () => {
  const clearCart = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/item/clearCart`, {
        method: "GET",
        headers: {
          // Add any necessary headers for authentication or authorization (if applicable)
          // "Authorization": `Bearer ${accessToken}`, // Example for token-based auth
        },
      });

      if (response.status === 200) {
        setCart([]); // Clear the local cart state immediately for a responsive UI
        toast.success("Cart cleared successfully!"); // Show success toast notification
        refreshCart(); // Refresh the cart data after clearing it
      } else {
        console.error("Failed to clear cart:", response.statusText);
        // Handle error scenario (e.g., display an error message to the user)
        toast.error("Error clearing cart. Please try again later.");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      // Handle potential errors during fetch operation
      toast.error(
        "An error occurred while clearing your cart. Please try again."
      );
    }
  };

  const refreshCart = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/item/cart`, {
        method: "GET",
        headers: {
          // Add any necessary headers for authentication or authorization (if applicable)
          // "Authorization": `Bearer ${accessToken}`, // Example for token-based auth
        },
      });

      if (response.status === 200) {
        const cartData = await response.json();
        // console.log(cartData); // Log the fetched cart data for debugging purposes
        console.log("Cart data refreshed successfully!");
        setCart(cartData); // Update cart state with fetched data
      } else {
        console.error("Failed to fetch cart data:", response.statusText);
        // Handle error scenario (e.g., display an error message to the user)
        toast.error("Error fetching cart data. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
      // Handle potential errors during fetch operation
      toast.error(
        "An error occurred while fetching your cart. Please try again."
      );
    }
  };

  const [itemData, setItemData] = useState<MenuData>();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentPlaying, setCurrentPlaying] = useState({
    artist: "",
    title: "",
    link: "",
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/item`);
        if (response.status === 200) {
          const data = await response.json();
          setItemData(data);
        } else {
          // Handle error scenario (e.g., display an error message)
          console.error("Failed to fetch data:", response.statusText);
        }
      } catch (error) {
        // Handle potential errors during fetch operation
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    refreshCart();
  }, []);
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
  
  return (
    <AnimatePresence>
      <motion.div
        className="min-h-[80vh] flex-col items-center justify-between text-white p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          className="py-4 bg-black/30 min-h-screen min-w-24"
          style={{ backdropFilter: "blur(25px)" }}
        >
          <CardHeader className="pb-2 pt-0 px-4 flex-col items-start">
            <motion.div
              className="flex flex-row justify-between items-start gap-1 w-full gradHead"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div>
                <h4 className="font-bold text-large text-gray-400">
                  Collaborative Kitchen
                </h4>
              </div>
              <div>
                <NowPlaying
                  title={currentPlaying.title}
                  artist={currentPlaying.artist}
                  link={
                    currentPlaying.link ||
                    "http://localhost:2500/api/v1/spotify/login1"
                  }
                />
              </div>
            </motion.div>
            <Divider className="my-2 h-0.5 bg-white" />
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            <div className="w-full flex flex-row items-center gap-2 bg-black px-2 dark">
              <motion.div
                className="flex w-full flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Tabs
                  aria-label="Options"
                  variant="bordered"
                  color="secondary"
                  radius="full"
                >
                  {Object.keys(itemData ?? {}).map((category) => (
                    <Tab key={category} title={category}>
                      <Card className=" duration-150 animate-appearance-in">
                        <CardBody className="flex flex-row gap-5">
                          <AnimatePresence>
                            {itemData?.[category]?.map((item) => (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.3 }}
                              >
                                <ItemBox
                                  title={item.name}
                                  imageUrl={`/food/${item.imageUrl}`}
                                  price={item.price}
                                  misc={item.misc}
                                  description={item.description}
                                  className={item.className}
                                  addOn={item.addOns}
                                  onClk={() => {
                                    refreshCart();
                                  }}
                                />
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </CardBody>
                      </Card>
                    </Tab>
                  ))}
                </Tabs>
              </motion.div>
            </div>
            <div className="bg-gradient-to-r from-yellow-400/50 to-orange-600/30  from-amber-200/50 to-amber-900/30 to-orange-900/30 from-green-200/50 to-orange-600/80 to-blue-600/30 from-green-500/80"></div>
            <motion.div
              className="fixed bottom-10 bg-black/30 p-2 rounded-md text-white w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex flex-row gap-2">
                <LoginPageForKiosk />

                <Button
                  color="success"
                  variant="shadow"
                  onClick={async () => {
                    clearCart();
                  }}
                >
                  New Session
                </Button>
                <Button color="secondary" variant="shadow">
                  Sync Cart
                </Button>

                <Cart cart={cart} onRemove={refreshCart} />
              </div>
            </motion.div>
          </CardBody>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default HomePage;
