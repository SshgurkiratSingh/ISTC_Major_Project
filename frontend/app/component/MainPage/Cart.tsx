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
import { motion, AnimatePresence } from "framer-motion";
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
  status: string;
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
    <div className="dark">
      <Button
        disabled={cart.length === 0}
        variant="shadow"
        onClick={onOpen}
        className="px-8 py-4 rounded-full text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 shadow-lg hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 transition-colors duration-300"
      >
        View Cart - ₹{cart.reduce((a, b) => a + b.price, 0)}
      </Button>
      <AnimatePresence>
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          scrollBehavior="inside"
          classNames={{
            body: "py-6",
            backdrop: "bg-black/60 backdrop-blur-sm",
            base: "border border-gray-700 bg-gray-800 rounded-2xl shadow-xl",
            header: "border-b border-gray-700",
            footer: "border-t border-gray-700",
            closeButton: "hover:bg-gray-700 active:bg-gray-600",
          }}
          backdrop="blur"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1 text-gray-200 font-bold px-6 py-4">
                  {topText}
                </ModalHeader>
                <ModalBody className="px-6 py-4">
                  {step === STEPS.CARTPAGE && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div>
                        <AnimatePresence>
                          {cart.map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                              className="mb-4"
                            >
                              <Card
                                isBlurred
                                className="bg-gray-700 rounded-lg shadow-md overflow-hidden"
                              >
                                <CardBody className="grid grid-cols-3 gap-4 p-4">
                                  <div className="col-span-2 flex flex-col justify-between">
                                    <h4 className="font-bold text-lg text-gray-200">
                                      {item.title}
                                    </h4>
                                    <div>
                                      {item.addOnIds &&
                                        item.addOnIds.length > 0 && (
                                          <p className="font-semibold text-gray-400 mb-2">
                                            Add-ons:
                                          </p>
                                        )}
                                      {item.addOnIds &&
                                        item.addOnIds.map((addOnId) => (
                                          <motion.div
                                            key={addOnId.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                            className="text-gray-400"
                                          >
                                            {addOnId.name}
                                          </motion.div>
                                        ))}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-center justify-between">
                                    <Image
                                      src={item.imageUrl}
                                      width={80}
                                      height={80}
                                      className="rounded-full"
                                    />
                                    <div className="flex flex-row items-center gap-2">
                                      <motion.span
                                        className="text-xl font-bold text-gray-200"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.3 }}
                                      >
                                        ₹{item.price}
                                      </motion.span>
                                      <Button
                                        size="sm"
                                        color="warning"
                                        onClick={async () => {
                                          try {
                                            const response = await fetch(
                                              `${API_BASE_URL}/api/v1/item/cart/${index}`,
                                              {
                                                method: "DELETE",
                                                headers: {
                                                  "Content-Type":
                                                    "application/json",
                                                },
                                              }
                                            );

                                            if (!response.ok) {
                                              throw new Error(
                                                `Failed to delete item: ${response.statusText}`
                                              );
                                            }

                                            toast.success(
                                              "Item removed from cart"
                                            );
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
                                        className="px-4 py-2 rounded-full text-white bg-yellow-500 hover:bg-yellow-600 transition-colors duration-300 font-bold"
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <Divider />
                        <Divider className="my-4" />
                        <motion.div
                          className="flex flex-row justify-between items-center"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="text-lg font-bold text-gray-200">
                            Total
                          </span>
                          <span className="text-2xl font-bold text-gray-200">
                            ₹{cart.reduce((a, b) => a + b.price, 0)}
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {step === STEPS.PAYMENT && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div>
                        {/* Payment options and instructions */}
                        <Tabs aria-label="Options" className="dark">
                          <Tab key="UPI" title="UPI">
                            <Card className="dark">
                              <CardBody>
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <Image
                                    src={upiImage}
                                    width={400}
                                    height={400}
                                  />
                                </motion.div>
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
                    </motion.div>
                  )}
                  {step === STEPS.ORDER && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
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
                    </motion.div>
                  )}
                  {step === STEPS.DONE && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div>
                        {/* Order confirmation */}
                        <h3>Thank you for your order!</h3>
                        <p>Your order has been placed successfully.</p>
                      </div>
                    </motion.div>
                  )}
                </ModalBody>
                <ModalFooter className="px-6 py-4 flex justify-between">
                  <Button
                    color="warning"
                    variant="light"
                    onPress={() => {
                      onClose();
                      setStep(STEPS.CARTPAGE);
                    }}
                    className="px-6 py-3 rounded-full text-white bg-red-500 hover:bg-red-600 transition-colors duration-300 font-bold"
                  >
                    Close
                  </Button>
                  <Button
                    color="primary"
                    onPress={onNext}
                    disabled={cart.length === 0}
                    className={`px-6 py-3 rounded-full text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300 font-bold ${
                      cart.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {buttonText}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </AnimatePresence>
    </div>
  );
};
export default Cart;
