"use client";
import React, { useState } from "react";
import {
  Card,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Image,
  Button,
  Chip,
  useDisclosure,
  Switch,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import { AddOn } from "./MainPage/StartPage";
import API_BASE_URL from "@/APIconfig";
interface ItemBoxProps {
  title: string;
  imageUrl: string;
  price: number;
  className?: string;
  onClk: () => void;
  description?: string;
  misc?: string;
  addOn?: AddOn[];
}
const ItemBox = ({
  title = "",
  imageUrl = "",
  price = 0,
  className = "bg-gradient-to-r from-blue-400/50 to-green-600/50",
  onClk,
  misc = "new",
  description = "a",
  addOn,
}: ItemBoxProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]); // State to track selected add-ons

  const handleAddOnSelection = (item: AddOn) => {
    setSelectedAddOns((prevSelected) => {
      const isSelected = prevSelected.some((addon) => addon.id === item.id); // Check if already selected
      return isSelected
        ? prevSelected.filter((addon) => addon.id !== item.id)
        : [...prevSelected, item];
    });
  };

  const calculateTotalPrice = () => {
    const selectedAddOnCost = selectedAddOns.reduce(
      (acc, curr) => acc + curr.price,
      0
    ); // Calculate total cost of selected add-ons
    return price + selectedAddOnCost;
  };
  const handleAddToCart = async () => {
    const selectedAddOnData = selectedAddOns.map((addon) => ({
      name: addon.name,
      id: addon.id,
      price: addon.price,
    }));
    const totalQuantity = 1; // Assuming default quantity of 1 for the item

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/item/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any necessary authorization headers if applicable
        },
        body: JSON.stringify({
          title, // Item title
          imageUrl, // Item image URL
          price: calculateTotalPrice(), // Total price with add-ons
          quantity: totalQuantity, // Total quantity (potentially include add-on quantities)
          addOnIds: selectedAddOnData, // Array of selected add-on IDs
        }),
      });

      if (response.status === 200) {
        toast.success("Item added to cart successfully!");
        onClose(); // Close the modal after successful addition
      } else {
        console.error("Failed to add item to cart:", response.statusText);
        toast.error(
          "An error occurred while adding the item to cart. Please try again."
        );
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error(
        "An error occurred while adding the item to cart. Please try again."
      );
    }
    onClk(); // Trigger the parent component's onClick handler to re-render the list of items
  };

  return (
    <div
      className={`w-full max-w-sm  ${className} border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700`}
    >
      <Modal
        closeButton
        aria-labelledby="modal-title"
        isOpen={title == "Frenc Fries" ? true : isOpen}
        onClose={onClose}
        className="dark min-w-[50%]"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Customise Your {title}
              </ModalHeader>
              <ModalBody className="flex flex-row gap-4">
                <Image
                  src={imageUrl}
                  alt="product image"
                  width={360}
                  className="min-w-[40%]"
                />

                {addOn !== null && (
                  <div className="flex flex-col gap-1 min-w-[30%] items-center justify-center max-w-[55%]">
                    <div>
                      <h3 className="text-md gap-1">{description}</h3>
                    </div>
                    <h3 className="text-xl gap-1 font-bold">Add On:</h3>
                    {addOn?.map((item) => (
                      <div
                        key={item.id || item.name} // Add unique key for each item (recommended)
                        className="flex flex-row gap-1 items-center justify-center min-w-[100px] w-max"
                      >
                        <Image
                          src={`/food${item.url}`}
                          width={64}
                          alt={item.name || "Add-On Image"}
                        />{" "}
                        {/* Add alt text */}
                        <h1>{item.name}</h1>
                        <Chip>{item.price}</Chip>
                        <Switch
                          aria-label={`${item.name} Add-On Selection`}
                          checked={selectedAddOns.some(
                            (addon) => addon.id === item.id
                          )} // Set checked state based on selection
                          onChange={() => handleAddOnSelection(item)}
                        />{" "}
                        {/* Set Switch label */}
                      </div>
                    ))}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <div>
                  <Chip>Total Price: ₹{calculateTotalPrice()}</Chip>
                </div>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    handleAddToCart();
                  }}
                >
                  Add to Cart
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="relative top-2 left-4">
        <Chip className="p-2">{misc}</Chip>
      </div>

      <img className="p-8 rounded-full" src={imageUrl} alt="product image" />

      <div className="px-5 pb-5">
        <a href="#">
          <h5 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h5>
        </a>
        <div className="flex items-center mt-2.5 mb-5">
          {description.slice(0, 120)}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            ₹{price}
          </span>
          <Button color="warning" onPress={onOpen}>
            Customise
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ItemBox;
