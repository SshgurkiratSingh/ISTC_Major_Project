"use client";
import React, { useEffect, useState } from "react";
interface AddOn {
  name: string;
  id: string;
  price: number;
  quantity: number;
  url?: string; // Optional image URL
}

interface FoodItem {
  title: string;
  imageUrl: string;
  description: string;
  misc: string;
  className: string;
  category: string;
  itemPrice: number;
  price: number;
  quantity: number;
  addOnIds: AddOn[];
  id: string;
}

interface APIData {
  id: string;
  phoneNumber: string;
  name: string;
  rfidUID: string;
  cart: FoodItem[]; // Array of arrays of FoodItem (to represent multiple orders within the cart)
  createdAt: string; // ISO 8601 date string format
}

import {
  Card,
  CardHeader,
  CardBody,
  Image,
  Divider,
  Button,
  Tabs,
  Tab,
  Tooltip,
  User,
  Spacer,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import API_BASE_URL from "@/APIconfig";
import UserInfoCard from "../component/InfoCard";
import { CartItem, MenuData } from "../component/MainPage/StartPage";
import ItemBox from "../component/itemBox";
import { CheckoutPage } from "./[tableID]/CheckoutPage";
interface CustomUserPageProps {
  tableId: string;
}

export default function CustomUserPage({ tableId }: CustomUserPageProps) {
  const [mobileNumber, setMobileNumber] = useState("9855041454");
  const [showItemList, setShowItemList] = useState(false);
  const [userData, setUserData] = useState<APIData | undefined>(undefined);
  const [cart, setCart] = useState<FoodItem[]>([]);
  const [itemData, setItemData] = useState<MenuData>();
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [upiImage, setUpiImage] = useState("");

  const [selectedAddOns, setSelectedAddOns] = useState<{
    [itemId: string]: string[];
  }>({}); // Object to map item IDs to selected add-on IDs
  const handleAddOnChange = (itemId: string, addOnId: string) => {
    console.log(selectedAddOns);
    setSelectedAddOns((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || []).includes(addOnId)
        ? prev[itemId].filter((id) => id !== addOnId) // Remove if exists
        : [...(prev[itemId] || []), addOnId], // Add if new
    }));
  };

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
  }, []);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty! Add an item to continue");
      return;
    }

    try {
      const checkoutUrl = `${API_BASE_URL}/api/v1/user/table/checkOut`;

      const response = await fetch(checkoutUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include any necessary authorization headers
        },
        body: JSON.stringify({
          tableNumber: tableId,
          items: cart,
          totalPrice: cart.reduce((a, b) => a + b.price, 0),
          paymentMethod: "upi",
          mobileNumber,
          // ...other data
        }),
      });
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setOrderId("Order Placed"); // Assuming the API returns an order ID

      // Generate UPI QR code
      // upiqr({
      //   payeeVPA: "your_upi_vpa", // Replace with your UPI VPA
      //   payeeName: "Your Name", // Replace with your name
      //   amount: String(cart.reduce((a, b) => a + b.price, 0)),
      //   transactionNote: "ISTC MAJOR PROJECT",
      //   transactionRefUrl: "https://your_website_url", // Replace with your website URL
      // })
      //   .then((upi) => {
      //     setUpiImage(upi.qr);
      //     setCheckoutModalOpen(false);
      //     setPaymentModalOpen(true);
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //     toast.error("Error generating UPI QR code.");
      //   });
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("An error occurred during checkout. Please try again.");
    }
  };

  const refreshCart = async () => {
    if (!mobileNumber) return; // Don't refresh if no mobile number is set

    try {
      setIsLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/user/mobile/${mobileNumber}`
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data: APIData = await response.json();
      setCart(data.cart);
    } catch (error) {
      console.error("Error refreshing cart:", error);
      toast.error("An error occurred while refreshing the cart.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateCart = async (newCart: FoodItem[]) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/user/cart/mobile/${mobileNumber}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newCart }), // Send the flat cart directly
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
  };

  const handleSkip = () => {
    setShowItemList(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMobileNumber(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mobileNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    } else {
      try {
        setIsLoading(true); // Show loading state

        const response = await fetch(
          `${API_BASE_URL}/api/v1/user/mobile/${mobileNumber}`
        );

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data: APIData = await response.json();
        setUserData(data);
        setCart(data.cart); // Assuming your API returns the cart
        console.log(data.cart);
        setShowItemList(true);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("An error occurred while fetching user data.");
      } finally {
        setIsLoading(false);
      }

      setShowItemList(true);
    }
  };
  const deleteCartItem = async (itemToDelete: FoodItem) => {
    try {
      const updatedCart = cart.filter((item) => item !== itemToDelete);

      setCart(updatedCart); // Update the cart state locally

      await updateCart(updatedCart); // Send the update to the server
    } catch (error) {
      console.error("Error deleting cart item:", error);
      toast.error("An error occurred while deleting the item.");
      setCart(cart); // Restore cart state if the API call failed
    }
  };
  const addItemToCart = (item: any) => {
    const selectedAddOnsForItem = selectedAddOns[item.id] || [];
    const addOnsToInclude: AddOn[] = [];

    if (
      selectedAddOnsForItem.length > 0 &&
      item.addOns &&
      item.addOns.length > 0
    ) {
      addOnsToInclude.push(
        ...item.addOns.filter((addOn: AddOn) =>
          selectedAddOnsForItem.includes(addOn.id)
        )
      );
    }

    console.log(item.addOns);
    const cartItem: FoodItem = {
      title: item.name, // Use item.title for the title
      imageUrl: `/food${item.imageUrl}`,
      description: item.description,
      misc: item.misc,
      className: item.className,
      category: item.category,
      itemPrice: item.price,
      price:
        item.price +
        addOnsToInclude.reduce((sum, addOn) => sum + addOn.price, 0),
      quantity: 1,
      addOnIds: addOnsToInclude, // Include the selected add-ons
      id: item.id,
    };

    setCart((prevCart) => [...prevCart, cartItem]);
    updateCart([...cart, cartItem]);
  };

  return (
    <div className="min-h-[100vh] flex-col items-center justify-between text-white p-4 ">
      <div className="fixed right-1 z-10  top-[50vh] ">
        <CheckoutPage cart={cart} mobileNumber={mobileNumber} table={tableId} />
        <Popover placement="bottom" showArrow={true}>
          <PopoverTrigger>
            <Button color="secondary" variant="shadow">
              Cart
            </Button>
          </PopoverTrigger>
          <PopoverContent className="bg-gray-800/50 p-4 rounded-md">
            {cart !== undefined && cart !== null ? (
              cart?.length > 0 ? (
                <ul className="space-y-2">
                  {cart.flat().map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between"
                    >
                      {" "}
                      <div className="flex items-center">
                        {/* Add image if available */}
                        {item.imageUrl && (
                          <Image
                            src={item.imageUrl}
                            width={40}
                            height={40}
                            className="mr-2 rounded"
                            alt={item.title}
                          />
                        )}
                        <span>{item.title} x </span>
                      </div>
                      {/* Calculate and display item price */}
                      <span>₹{item.price * item.quantity}</span>
                      {/* ... item display ... */}
                      <button onClick={() => deleteCartItem(item)}>
                        <svg // Add an appropriate delete icon here
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-trash"
                          viewBox="0 0 16 16"
                        >
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                          <path
                            fillRule="evenodd"
                            d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                          />
                        </svg>
                      </button>
                    </li>
                  ))}
                  <Divider className="bg-white" /> {/* Add a divider */}
                  <li className="text-right font-bold">
                    {/* Calculate and display total */}
                    Total: ₹
                    {cart
                      .flat()
                      .reduce(
                        (acc, item) => acc + item.price * item.quantity,
                        0
                      )}
                  </li>
                </ul>
              ) : (
                <p>Your cart is empty.</p>
              )
            ) : null}
          </PopoverContent>
        </Popover>
      </div>
      {!showItemList ? (
        <div className="bg-gray-800/50 p-4 rounded-md space-y-2 m-3">
          <h2 className="text-xl font-bold">Enter Mobile Number</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="tel"
              // pattern="[0-9]{10}" // Enforce 10-digit pattern
              value={mobileNumber}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white p-2 rounded"
              placeholder="10-digit number"
              required
            />
            <div className="flex justify-between m-2 p-1">
              <button
                type="button"
                onClick={handleSkip}
                className="text-gray-500"
              >
                Skip
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      ) : (
        <Card
          className="py-4 bg-black/30 min-h-screen min-w-24 text-slate-50"
          style={{ backdropFilter: "blur(25px)" }}
        >
          <CardHeader className="w-full">
            <h2 className="text-xl font-bold">
              Order Item From Table {tableId}
            </h2>
          </CardHeader>
          <Divider className="bg-white" />
          {mobileNumber.length === 10 ? (
            <div className="m-1">
              <Spacer x={1} y={1} />
              <User name={userData?.name} description={mobileNumber} />
            </div>
          ) : (
            <div></div>
          )}
          <CardBody>
            <div className="flex w-full flex-col">
              <Tabs
                aria-label="Options"
                variant="bordered"
                color="secondary"
                radius="full"
              >
                {Object.keys(itemData ?? {}).map((category) => (
                  <Tab key={category} title={category}>
                    <Card className=" duration-150 animate-appearance-in dark">
                      <CardBody className="flex xl:flex-row flex-col justify-content-center gap-5">
                        {itemData?.[category]?.map((item) => (
                          <div
                            key={item.id}
                            className="p-4 rounded-md bg-gray-800/50 shadow-md"
                          >
                            {/* Item Image (if applicable) */}
                            {item.imageUrl && (
                              <img
                                src={`/food${item.imageUrl}`}
                                alt={item.name}
                                className="w-24 h-24 rounded-md mb-2"
                              />
                            )}

                            {/* Item Name and Description */}
                            <h2 className="text-lg font-bold mb-1">
                              {item.name}
                            </h2>
                            <p className="text-gray-400">{item.description}</p>

                            {/* Price */}
                            <p className="text-xl font-medium mt-2">
                              ₹{item.price}
                            </p>

                            {/* Add-ons Section */}
                            <h3 className="text-lg font-semibold mt-3">
                              Add-ons:
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.addOns.map((addOn, index) => (
                                <div key={index + addOn.id}>
                                  <input
                                    type="checkbox"
                                    id={addOn.id}
                                    value={addOn.id}
                                    checked={
                                      selectedAddOns[item.id]?.includes(
                                        addOn.id
                                      ) || false
                                    }
                                    onChange={() =>
                                      handleAddOnChange(item.id, addOn.id)
                                    }
                                    className="mr-1"
                                  />
                                  <label
                                    htmlFor={addOn.id}
                                    className="text-gray-300"
                                  >
                                    {addOn.name} (+₹{addOn.price})
                                  </label>
                                </div>
                              ))}
                            </div>

                            {/* Add to Cart Button */}
                            <button
                              className="bg-blue-600 text-white px-4 py-2 rounded mt-3 hover:bg-blue-700"
                              onClick={() => addItemToCart(item)}
                            >
                              Add to Cart
                            </button>
                          </div>
                        ))}
                      </CardBody>
                    </Card>
                  </Tab>
                ))}
              </Tabs>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
