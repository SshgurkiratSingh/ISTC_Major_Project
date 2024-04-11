import React, { useEffect } from "react";
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
import API_BASE_URL from "@/APIconfig";
import { toast } from "react-toastify";
import { on } from "events";
interface LoginPageForKioskProps {
  loggedIn: boolean;
}
const LoginPageForKiosk = ({ loggedIn }: LoginPageForKioskProps) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  useEffect(() => {
    if (loggedIn) {
      onClose();
      // toast.success("Already logged in");
    }
  }, [loggedIn]);
  const onButtonPressed = () => {
    if (loggedIn) {
      try {
        fetch(`${API_BASE_URL}/api/v1/item/logout`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            toast.success("Logout successful");
            onClose();
          })
          .catch((error) => {
            console.error("Error:", error);
            toast.error(String(error));
          });
      } catch (error) {
        console.log(error);
      }
    } else {
      onOpen();
    }
  };
  return (
    <div>
      <Button color="default" variant="shadow" onClick={onButtonPressed}>
        {loggedIn ? "Logout" : "Login "}
      </Button>
      <Modal
        closeButton
        aria-labelledby="modal-title"
        isOpen={isOpen}
        onClose={onClose}
        className="dark min-w-[50%]"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Login Using RFID
              </ModalHeader>
              <ModalBody className="flex flex-row gap-4 justify-center items-center">
                <Image
                  src="./scan.gif/"
                  alt="RFID Scan"
                  width="400px"
                  height="400px"
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default LoginPageForKiosk;
