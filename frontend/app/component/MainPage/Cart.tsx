"use client";
import React from "react";
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
interface CartProps {
  cart: CartItem[];
}
const Cart = ({ cart }: CartProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div>
      <Button color="primary" variant="shadow" onClick={onOpen}>
        View Cart
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{
          body: "py-6 ",
          backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
          base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3] min-w-[60%]",
          header: "border-b-[1px] border-[#292f46]",
          footer: "border-t-[1px] border-[#292f46]",
          closeButton: "hover:bg-white/5 active:bg-white/10",
        }}
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Your Cart
              </ModalHeader>
              <ModalBody>
                <div>
                  {cart.map((item, index) => (
                    <Card
                      isBlurred
                      className="border-none bg-white/10 dark:bg-default-100/50 m-1"
                      shadow="sm"
                    >
                      <CardBody className="grid grid-row-2 gap-2 p-2 text-white/80">
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
                            <Button
                              size="sm"
                              color="danger"
                              onClick={() => {
                                toast.error("Item removed from cart");
                              }}
                              className="duration-150 animate-appearance-in"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
                <Divider />
                <div className="flex flex-row justify-between">
                  <span>Total</span>
                  <span>₹{cart.reduce((a, b) => a + b.price, 0)}</span>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Checkout
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
