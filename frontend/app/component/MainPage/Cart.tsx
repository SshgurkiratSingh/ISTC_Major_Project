"use client";
import React, { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Image,
  Divider,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tabs,
  Tab,
  useDisclosure,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import { CartItem } from "./StartPage";
import API_BASE_URL from "@/APIconfig";
import { Tabs as NextUiTabs, TabsProps } from "@nextui-org/react";

import upiqr from "upiqr";
import { usePathname } from "next/navigation";
enum STEPS {
  CARTPAGE = 0,
  PAYMENT = 1,
  ORDER = 2,
  DONE = 3,
}
interface CartProps {
  cart: CartItem[];
  onRemove: () => void;
}
export interface Order {
  tableNumber: number;

  date: string; // ISO 8601 date string format is recommended
  estimatedTime: string; // Same as above
  status: string; // Consider using an enum for order statuses
  currentStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  completed: boolean;
  rating: number | null;
}

const Cart = ({ cart, onRemove }: CartProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [upiImage, setUpiImage] = useState<string>("");
  const [step, setStep] = useState(STEPS.CARTPAGE);
  const [PaymentSelected, setPaymentSelected] = useState("upi");
  const [APIresponse, setAPIresponse] = useState<Order>();

  const onCheckout = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty! Add an item to continue");
      return;
    }
    toast.success("Checkout successful");
    setStep(STEPS.PAYMENT);
    upiqr({
      payeeVPA: "9855041454@kotak",
      payeeName: "Gurkirat Singh",
      amount: String(cart.reduce((a, b) => a + b.price, 0)),
      transactionNote: "ISTC MAJOR PROJECT",
      transactionRefUrl: "https://istc-minor-project.vercel.app/",
    })
      .then((upi) => {
        setUpiImage(upi.qr);
        console.log(upi.intent); // upi://pay?pa=bhar4t@upi&pn=Bharat..
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onPayment = async () => {
    setStep(STEPS.ORDER);
    // make a get request to /api/v1/order
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/item/cart/checkout`);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setAPIresponse(data);
      if (response.status === 400) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error fetching order data:", error);
      toast.error("Error fetching order data. Please try again later.");
    }
  };

  const onPlaceOrder = () => {
    // Place the order logic
    toast.success("Order placed successfully!");
    setStep(STEPS.DONE);
  };
  const topText = useMemo(() => {
    switch (step) {
      case STEPS.CARTPAGE:
        return "Your Cart";
      case STEPS.PAYMENT:
        return "Payment";
      case STEPS.ORDER:
        return "Order";
      case STEPS.DONE:
        return "Done";
    }
  }, [step]);
  const buttonText = useMemo(() => {
    switch (step) {
      case STEPS.CARTPAGE:
        return "Checkout";
      case STEPS.PAYMENT:
        return "Pay";
      case STEPS.ORDER:
        return "Next";
      case STEPS.DONE:
        return "Done";
    }
  }, [step]);
  const onBack = () => {
    setStep((v) => v - 1);
  };

  const onNext = () => {
    switch (step) {
      case STEPS.CARTPAGE:
        onCheckout();
        break;
      case STEPS.PAYMENT:
        onPayment();
        break;
      case STEPS.ORDER:
        onPlaceOrder();
        break;
      case STEPS.DONE:
        setStep(STEPS.CARTPAGE);
        onRemove();
        break;
    }
  };
  const pathname = usePathname();

  return (
    <div>
      <Button color="primary" variant="shadow" onClick={onOpen}>
        View Cart - ₹{cart.reduce((a, b) => a + b.price, 0)}
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
        classNames={{
          body: "py-6 ",
          backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
          base: "border-[#292f46] bg-gradient-to-b  from-red-500 to-purple-800 text-[#a8b0d3] min-w-[60%]",
          header: "border-b-[1px] border-[#292f46]",
          footer: "border-t-[1px] border-[#292f46]",
          closeButton: "hover:bg-white/5 active:bg-white/10",
        }}
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-black">
                {topText}
              </ModalHeader>
              <ModalBody>
                {step === STEPS.CARTPAGE && (
                  <div>
                    {cart.map((item, index) => (
                      <Card
                        isBlurred
                        className="border-none bg-white/10 dark:bg-default-100/50 m-1"
                        shadow="sm"
                      >
                        <CardBody className="grid grid-row-2 gap-2 p-2 text-white/90">
                          <h4 className="font-bold text-large ">
                            {item.title}
                          </h4>
                          <div className="flex flex-col-3 gap-2 items-center justify-between">
                            <Image src={item.imageUrl} width={80} height={80} />
                            <div>
                              {item.addOnIds && item.addOnIds.length > 0 && (
                                <b>Add-ons:</b>
                              )}
                              {item.addOnIds &&
                                item.addOnIds.map((addOnId) => (
                                  <div key={addOnId.id}>{addOnId.name}</div>
                                ))}
                            </div>

                            <div className="flex flex-row gap-2 items-center">
                              <span className="text-lg font-bold">
                                ₹{item.price}
                              </span>
                              <Button
                                size="sm"
                                color="danger"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(
                                      `${API_BASE_URL}/api/v1/item/cart/${index}`,
                                      {
                                        method: "DELETE",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                      }
                                    );

                                    if (!response.ok) {
                                      throw new Error(
                                        `Failed to delete item: ${response.statusText}`
                                      );
                                    }

                                    toast.success("Item removed from cart");
                                  } catch (error) {
                                    console.error(
                                      "Error deleting item:",
                                      error
                                    );
                                    toast.error(
                                      "An error occurred. Please try again later."
                                    );
                                  }
                                  onRemove();
                                }}
                                className="duration-150 animate-appearance-in font-bold text-sm"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                    <Divider />
                    <div className="flex flex-row justify-between">
                      <span>Total</span>
                      <span>₹{cart.reduce((a, b) => a + b.price, 0)}</span>
                    </div>
                  </div>
                )}
                {step === STEPS.PAYMENT && (
                  <div>
                    {/* Payment options and instructions */}
                    <Tabs aria-label="Options" className="dark">
                      <Tab key="UPI" title="UPI">
                        <Card className="dark">
                          <CardBody>
                            <Image src={upiImage} width={400} height={400} />
                            <p>Please scan the QR code </p>
                          </CardBody>
                        </Card>
                      </Tab>
                      <Tab key="Card" title="Card">
                        <Card className="dark">
                          <CardBody>Looking for Card Scan</CardBody>
                        </Card>
                      </Tab>
                    </Tabs>
                  </div>
                )}
                {step === STEPS.ORDER && (
                  <div>
                    {/* Order summary */}
                    <h3 className="font-extrabold text-2xl text-black">
                      Order Summary
                    </h3>
                    <div className="flex flex-col font-semibold text-lg text-black">
                      <p>Items: {cart.length}</p>
                      <p>Total: ₹{cart.reduce((a, b) => a + b.price, 0)}</p>
                      <p>Table Assigned: {APIresponse?.tableNumber}</p>
                      <p>
                        Estimated Time Arrival:{" "}
                        {new Date(
                          new Date().getTime() +
                            Number(APIresponse?.estimatedTime)
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}
                {step === STEPS.DONE && (
                  <div>
                    {/* Order confirmation */}
                    <h3>Thank you for your order!</h3>
                    <p>Your order has been placed successfully.</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    onClose();
                    setStep(STEPS.CARTPAGE);
                  }}
                >
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={onNext}
                  disabled={cart.length == 0}
                >
                  {buttonText}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
export default Cart;
