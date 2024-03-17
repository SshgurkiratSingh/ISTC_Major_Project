import React from "react";
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
const LoginPageForKiosk = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <div>
      <Button color="default" variant="shadow" onClick={onOpen}>
        Login
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
