import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  ModalContent,
} from "@nextui-org/react";
import axios from "axios";
import { APIData } from "@/app/user/CustomUserPage";
import { toast } from "react-toastify";
import { format } from "date-fns";
import API_BASE_URL from "@/APIconfig";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: APIData | null;
  refreshUsers: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  selectedUser,
  refreshUsers,
}) => {
  const [editedName, setEditedName] = useState(selectedUser?.name || "");
  const [editedRfidUID, setEditedRfidUID] = useState(
    selectedUser?.rfidUID || ""
  );
  useEffect(() => {
    if (selectedUser) {
      setEditedName(selectedUser?.name || "");
      setEditedRfidUID(selectedUser?.rfidUID || "");
    }
  }, [selectedUser]);
  const handleUpdateName = async () => {
    try {
      if (selectedUser) {
        const response = await axios.put(
          `${API_BASE_URL}/api/v1/user/users/${selectedUser.id}`,
          {
            name: editedName,
          }
        );
        // Handle successful response
        console.log(response.data);
        onClose();
        refreshUsers();
      }
    } catch (error) {
      // Handle error
      console.error("Error updating user name:", error);
      toast.error(String(error));
    }
  };
  const handleDeleteUser = async () => {
    try {
      if (selectedUser) {
        const response = await axios.delete(
          `${API_BASE_URL}/api/v1/user/users/${selectedUser.id}`
        );

        // Handle successful response
        console.log(response.data);
        onClose(); // Close the modal
        toast.success("User deleted successfully"); // Show a success toast message
        // Refresh the user list to reflect the changes
        refreshUsers(); // Refresh the user list
      }
    } catch (error) {
      // Handle error
      console.error("Error deleting user:", error);
      toast.error(String(error));
    }
  };
  const handleUpdateRfidUID = async () => {
    try {
      if (selectedUser) {
        const response = await axios.put(
          `${API_BASE_URL}/api/v1/user/users/${selectedUser.id}/rfid`,
          {
            newRfidUID: editedRfidUID,
          }
        );
        // Handle successful response
        console.log(response.data);
        onClose();
        refreshUsers();
      }
    } catch (error) {
      // Handle error
      console.error("Error updating user RFID UID:", error);
      toast.error(String(error));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      backdrop="blur"
      placement="top"
      scrollBehavior="inside"
      className="dark min-w-[80%]  bg-black/50 border "
    >
      <ModalContent className="bg-transparent">
        {(onClose) => (
          <>
            <ModalHeader className=" text-white bg-black/40">
              <div>User Details</div>
            </ModalHeader>
            <ModalBody className=" text-white bg-black/40">
              {selectedUser && (
                <>
                  <div>
                    <span className="font-bold">User ID:</span>{" "}
                    {selectedUser.id}
                  </div>
                  <div>
                    <span className="font-bold">Phone Number:</span>{" "}
                    {selectedUser.phoneNumber}
                  </div>
                  <div>
                    <span className="font-bold">RFID UID:</span>
                    <Input
                      value={editedRfidUID}
                      onChange={(e) => setEditedRfidUID(e.target.value)}
                      placeholder="Enter RFID UID"
                    />
                  </div>
                  <div>
                    <span className="font-bold">User Name:</span>
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      placeholder="Enter user name"
                    />
                  </div>
                  <div>
                    <span className="font-bold">Created At:</span>{" "}
                    {format(
                      new Date(selectedUser.createdAt),
                      "dd MMM yyyy hh:mm"
                    ) || "Not Set"}
                  </div>
                </>
              )}
            </ModalBody>
            <ModalFooter className=" text-white">
              <Button
                onClick={handleDeleteUser}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md"
              >
                Delete User
              </Button>
              <Button
                onClick={handleUpdateName}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md"
              >
                Update Name
              </Button>
              <Button
                onClick={handleUpdateRfidUID}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
              >
                Update RFID UID
              </Button>
              <Button
                onClick={onClose}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md"
              >
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default UserDetailsModal;
