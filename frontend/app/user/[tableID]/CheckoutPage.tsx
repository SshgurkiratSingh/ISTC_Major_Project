import API_BASE_URL from "@/APIconfig";
import { CartItem } from "@/app/component/MainPage/StartPage";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Card,
  CardBody,
  Image,
  Divider,
} from "@nextui-org/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import upiqr from "upiqr";

interface CheckoutPageProps {
  cart: CartItem[];
  table: string;
  
  mobileNumber: string;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cart,
  table,
  mobileNumber,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [upiImage, setUpiImage] = useState("");
  const [upiLink, setUpiLink] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
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
        setUpiLink(upi.intent);
      })
      .catch((err) => {
        console.log(err);
      });
  });
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty! Add an item to continue");
      return;
    }

    try {
      const checkoutUrl = `${API_BASE_URL}/api/v1/item/table/checkOut`;

      const response = await fetch(checkoutUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include any necessary authorization headers
        },
        body: JSON.stringify({
          tableNumber: table,
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
      setOrderId("Order Placed Check the Table Display for More Details"); //
      toast.success("Order Placed Check the Table Display for More Details");
      onClose();
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("An error occurred during checkout. Please try again.");
    }
  };
  return (
    <div>
      <div className="list-group-item text-right font-bold">
        <Button color="primary" onClick={onOpen}>
          Checkout
        </Button>
        <Modal
          backdrop="opaque"
          placement="top"
          scrollBehavior="inside"
          className="dark"
          isOpen={isOpen} // Use isOpen from useDisclosure
          onClose={onClose} // Use onClose from useDisclosure
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1 dark">
              Checkout Page
            </ModalHeader>
            <ModalBody>
              {orderId.length > 2 ? (
                <div className="titBlock text-center text-2xl">{orderId}</div>
              ) : (
                <>
                  {cart.map((item, index) => (
                    <Card
                      isBlurred
                      className="border-none bg-white/10 dark:bg-default-100/50 m-1"
                      shadow="sm"
                      key={index}
                    >
                      <CardBody className="grid grid-row-2 gap-2 p-2 text-white/90">
                        <h4 className="font-bold text-large ">{item.title}</h4>
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
                  <Divider />
                  {upiLink && (
                    <Link
                      href={upiLink}
                      className="border max-w-[40%] rounded-lg shadow-xl text-center"
                    >
                      Click Me to Pay
                    </Link>
                  )}
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={handleCheckout}>
                Payment Done
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};
