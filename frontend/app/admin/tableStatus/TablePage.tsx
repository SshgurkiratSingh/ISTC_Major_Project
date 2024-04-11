"use client";

import API_BASE_URL from "@/APIconfig";
import Loading from "@/app/component/Loading";
import {
  Accordion,
  AccordionItem,
  Button,
  Card,
  CardHeader,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import React from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Order } from "../orderHistory/OrderHistory";
import { format } from "date-fns";

type TableStatus = string[][];

const TablePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tableStatus, setTableStatus] = useState<TableStatus>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState<Order[]>([]);
  const Router = useRouter();

  useEffect(() => {
    fetchTableStatus();
  }, []);

  const fetchTableStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/item/tables/status`);
      const data = await response.json();
      setTableStatus(data);
    } catch (error) {
      console.error("Error fetching table status:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCompleteOrders = async (tableNumber: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/item/tables/${tableNumber}/orders/complete`,
        {
          method: "PUT",
        }
      );
      if (response.ok) {
        const updatedTableStatus = [...tableStatus];
        updatedTableStatus[tableNumber - 1] = []; // Clear orders for the table
        setTableStatus(updatedTableStatus);
        toast.success("All orders for the table marked as completed");
      } else {
        console.error("Error completing orders");
        toast.error("Error completing orders");
      }
    } catch (error) {
      console.error("Error completing orders:", error);
      toast.error("Error completing orders");
    } finally {
      setIsLoading(false);
    }
  };
  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchTableStatus();
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleTableStatusClear = async (tableNumber: number | String) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/item/tables/${tableNumber}/status`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        await fetchTableStatus();
        toast.success("Table status cleared successfully");
      } else {
        console.error("Error clearing table status");
        toast.error("Error clearing table status");
      }
    } catch (error) {
      console.error("Error clearing table status:", error);
      toast.error("Error clearing table status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrderDetails = async (orderId: Number | String) => {
    setIsLoading(true);
    onOpen();
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/item/tables/${orderId}/orders`
      );
      setSelectedOrder(response.data);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Error fetching order details");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex-col items-center justify-between p-4 bg-black text-white bg-gradient-to-tl from-amber-500/80 to-purple-800/70">
      <Card
        className="py-4 bg-black/30 min-h-screen min-w-24 rounded-xl"
        style={{ backdropFilter: "blur(25px)" }}
      >
        {isLoading && <Loading />}
        <CardHeader className="pb-2 pt-0 px-4 flex-col items-start text-white">
          <h2 className="text-2xl font-bold">Table Management</h2>
          <Divider className="my-2 bg-white" />
          <div>
            <Button
              className="text-white m-2"
              onClick={handleRefresh}
              variant="bordered"
              color="secondary"
              disabled={isLoading}
            >
              Refresh
            </Button>{" "}
            <Button
              className="text-white m-2"
              onClick={() => {
                Router.push("/admin");
              }}
              variant="bordered"
              color="secondary"
              disabled={isLoading}
            >
              Admin Page
            </Button>{" "}
          </div>
        </CardHeader>
        <Table
          aria-label="Orders History Table"
          className="w-full dark text-white"
        >
          <TableHeader className="bg-gray-800 text-white dark">
            <TableColumn>Table Number</TableColumn>
            <TableColumn>Order IDs</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody>
            {tableStatus.map((tableOrders, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="p-4 m-2 gap-2 flex-wrap flex-row ">
                  {tableOrders.length > 0 ? (
                    tableOrders.map((orderId) => (
                      <Button
                        key={orderId}
                        size="sm"
                        color="primary"
                        onClick={() => handleViewOrderDetails(index + 1)}
                        disabled={isLoading}
                      >
                        {orderId}
                      </Button>
                    ))
                  ) : (
                    <p>No orders</p>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    color="success"
                    onClick={() => handleCompleteOrders(index + 1)}
                    disabled={isLoading}
                  >
                    Complete All
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    onClick={() => handleTableStatusClear(index + 1)}
                    disabled={isLoading}
                  >
                    Clear
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        backdrop="blur"
        className="dark min-w-[80%]  bg-black/50 border"
      >
        <ModalContent className="bg-transparent">
          {(onClose) => (
            <>
              <ModalHeader className="text-white">
                <div>Order Details</div>
              </ModalHeader>

              <ModalBody className="text-white bg-black/20">
                {selectedOrder.length > 0 ? (
                  <Accordion>
                    {selectedOrder.map((order) => (
                      <AccordionItem
                        key={order.id}
                        title={`Order ID: ${order.id}`}
                        className="bg-gray-800 rounded-lg p-4 mb-2"
                      >
                        <div>
                          {/* Order Details */}
                          <p className="mb-2">
                            <span className="font-semibold">Table Number:</span>{" "}
                            {order.tableNumber}
                          </p>
                          <p className="mb-2">
                            <span className="font-semibold">Date:</span>{" "}
                            {format(new Date(order.date), "yyyy-MM-dd HH:mm")}
                          </p>
                          <p className="mb-2">
                            <span className="font-semibold">
                              Estimated Time:
                            </span>{" "}
                            {order.estimatedTime} minutes
                          </p>
                          <p className="mb-2">
                            <span className="font-semibold">Status:</span>{" "}
                            {order.status}
                          </p>
                          <p className="mb-2">
                            <span className="font-semibold">
                              Current Status:
                            </span>{" "}
                            {order.currentStatus}
                          </p>
                          <p className="mb-2">
                            <span className="font-semibold">
                              Payment Status:
                            </span>{" "}
                            {order.paymentStatus}
                          </p>
                          <p className="mb-2">
                            <span className="font-semibold">
                              Payment Method:
                            </span>{" "}
                            {order.paymentMethod}
                          </p>
                          {order.paymentAmount && (
                            <p className="mb-2">
                              <span className="font-semibold">
                                Payment Amount:
                              </span>{" "}
                              {order.paymentAmount}
                            </p>
                          )}
                          {order.rating && (
                            <p className="mb-2">
                              <span className="font-semibold">Rating:</span>{" "}
                              {order.rating}
                            </p>
                          )}
                          {order.mobileNumber && (
                            <p className="mb-2">
                              <span className="font-semibold">
                                Mobile Number:
                              </span>{" "}
                              {order.mobileNumber}
                            </p>
                          )}
                          {order.orderNotes && (
                            <p className="mb-2">
                              <span className="font-semibold">
                                Order Notes:
                              </span>{" "}
                              {order.orderNotes}
                            </p>
                          )}

                          {/* Order Items */}
                          <h4 className="font-bold mt-4 mb-2">Items:</h4>
                          <ul className="list-disc pl-4">
                            {order.order.cart.map((item) => (
                              <li
                                key={item.title}
                                className="flex justify-between mb-2"
                              >
                                <div>
                                  <span className="font-semibold">
                                    {item.title}
                                  </span>{" "}
                                  <span>x {item.quantity}</span>
                                  <p className="text-xs text-gray-400">
                                    {item?.misc || " "}
                                  </p>
                                </div>
                                <div>
                                  <p>Price: {item.price}</p>
                                  {item.addOnIds &&
                                    item.addOnIds.length > 0 && (
                                      <div>
                                        <p className="text-sm font-semibold">
                                          Add-ons:
                                        </p>
                                        <ul className="text-xs">
                                          {item.addOnIds.map((addOn) => (
                                            <li key={addOn.id}>
                                              {addOn.name} (+ {addOn.price})
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p>No orders found for this table.</p>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default TablePage;
