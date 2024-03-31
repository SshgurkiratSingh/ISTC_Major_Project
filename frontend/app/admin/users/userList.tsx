"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  useDisclosure,
  ModalContent,
  Input,
  Textarea,
  Spacer,
  Chip,
  Progress,
  CardHeader,
  Select,
  SelectItem,
  CircularProgress,
  Tab,
  Tooltip,
  CardBody,
} from "@nextui-org/react";
import axios from "axios";
import API_BASE_URL from "@/APIconfig";
import Loading from "@/app/component/Loading";
import { APIData } from "@/app/user/CustomUserPage";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

function UserList() {
  const [users, setUsers] = useState<APIData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<APIData | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleViewDetails = (user: APIData) => {
    setSelectedUser(user);
    onOpen();
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/user/users`);
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error(String(error));
        // Handle error appropriately (e.g., display an error message)
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);
  const Router = useRouter();
  return (
    <div className="min-h-[80vh] flex-col items-center justify-between p-4 bg-black text-white bg-gradient-to-tl from-amber-500/80 to-purple-800/70">
      <Card
        className="py-4 bg-black/30 min-h-screen min-w-24 rounded-xl"
        style={{ backdropFilter: "blur(25px)" }}
      >
        {isLoading && <Loading />}

        <CardHeader className="pb-2 pt-0 px-4  flex-col items-start text-white">
          <h2 className="text-2xl font-bold">Users List</h2>
          <Divider className="my-2 bg-white" />
          <div>
            <Button
              className=" text-white m-2"
              // onClick={handleRefresh}
              variant="bordered"
              color="secondary"
              disabled={isLoading}
            >
              Refresh
            </Button>{" "}
            <Button
              className=" text-white m-2"
              onClick={() => {
                Router.push("/admin");
              }}
              variant="bordered"
              color="secondary"
              disabled={isLoading}
            >
              Admin Page
            </Button>{" "}
            <Button
              className=" text-white m-2"
              onClick={() => {
                Router.push("/admin/orderHistory");
              }}
              variant="bordered"
              color="secondary"
              disabled={isLoading}
            >
              Order History Page
            </Button>{" "}
          </div>
        </CardHeader>

        <CardBody>
          <Table
            aria-label="Orders History Table"
            className="w-full dark text-white text-md "
          >
            <TableHeader className="bg-gray-800 text-white dark text-xl">
              <TableColumn className="px-4 py-2">User ID</TableColumn>
              <TableColumn className="px-4 py-2">User Number</TableColumn>
              <TableColumn className="px-4 py-2">User RFID</TableColumn>
              <TableColumn className="px-4 py-2">User Name</TableColumn>
              <TableColumn className="px-4 py-2">Created At</TableColumn>
              <TableColumn className="px-4 py-2">Action</TableColumn>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="px-4 py-2 font-extrabold ">
                    {user.id}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    {user.phoneNumber}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    {user.rfidUID || "Not Available"}{" "}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    {user.name || "Not Set"}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    {format(new Date(user.createdAt), "dd MMM yyyy hh:mm") ||
                      "Not Set"}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <Button
                      className=" text-white m-2"
                      variant="bordered"
                      onClick={() => handleViewDetails(user)}
                      color="secondary"
                      disabled={isLoading}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>{" "}
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
                      <span className="font-bold">RFID UID:</span>{" "}
                      {selectedUser.rfidUID || "Not Available"}
                    </div>
                    <div>
                      <span className="font-bold">User Name:</span>{" "}
                      {selectedUser.name || "Not Set"}
                    </div>
                    <div>
                      <span className="font-bold">Created At:</span>{" "}
                      {format(
                        new Date(selectedUser.createdAt),
                        "dd MMM yyyy hh:mm"
                      ) || "Not Set"}
                    </div>
                    {/* Add more details as needed */}
                  </>
                )}
              </ModalBody>
              <ModalFooter className=" text-white">
                <Button
                  onClick={onClose}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md"
                >
                  Close
                </Button>
              </ModalFooter>{" "}
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default UserList;
