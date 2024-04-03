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
} from "@nextui-org/react";
import axios from "axios";
import { CartItem } from "@/app/component/MainPage/StartPage";
import API_BASE_URL from "@/APIconfig";
import { format } from "date-fns";
import Image from "next/image";
import { toast } from "react-toastify";
import { stringify } from "querystring";
import Loading from "@/app/component/Loading";
import { useRouter } from "next/navigation";

interface UserCart {
  id: string;
  phoneNumber: string;
  name: string | null;
  rfidUID: string;
  cart: CartItem[];
  createdAt: string; // ISO 8601 formatted date string
}

interface Order {
  id: string;
  tableNumber: number;
  order: UserCart; // Replace with the actual type of the order data
  date: Date;
  estimatedTime: number;
  status: string;
  currentStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  completed: boolean;
  rating?: number;
  mobileNumber?: string;
  createdAt: Date;
  orderNotes?: string; // Optional order notes
  paymentAmount?: number; // Optional payment amount
}

function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [orderRating, setOrderRating] = useState<number | null>(null);
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [filterOrderId, setFilterOrderId] = useState("");
  const [filterMobileNumber, setFilterMobileNumber] = useState("");
  const [filterTableNumber, setFilterTableNumber] = useState("");
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  const filteredOrders = orders.filter((order) => {
    const matchesFilters =
      (filterOrderId === "" ||
        order.id.toLowerCase().includes(filterOrderId.toLowerCase())) &&
      (filterMobileNumber === "" ||
        (order.order &&
          typeof order.order.phoneNumber === "string" &&
          order.order.phoneNumber
            .toLowerCase()
            .includes(filterMobileNumber.toLowerCase()))) &&
      (filterTableNumber === "" ||
        order.tableNumber === parseInt(filterTableNumber));

    // Only include pending orders if the toggle is active
    return matchesFilters && (!showPendingOnly || order.status !== "completed");
  });

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null); // Clear any previous errors

    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/item/orders`);
      setOrders(response.data);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/item/orders`);
        setOrders(response.data);
      } catch (error) {
        setError(error);
        toast.error(String(error));
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderRating(order.rating || null);
    setOrderNotes(order.orderNotes || "");
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setOrderRating(null);
    setOrderNotes("");
    onOpenChange();
  };

  const handleOrderRatingChange = (value: number | null) => {
    setOrderRating(value);
  };

  const handleOrderNotesChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setOrderNotes(event.target.value);
  };

  const allowedStatuses = ["pending", "preparing", "ready", "completed"];

  const handleOrderStatusChange = async (
    orderId: string,
    newStatus: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/item/orders/${orderId}/status`,
        { status: newStatus }
      );

      // Update the order in the state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, currentStatus: newStatus } : order
        )
      );
      toast.success("Order status updated successfully");
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
      handleRefresh();
    }
  };
  const Router = useRouter();
  return (
    <div className="min-h-[80vh] flex-col items-center justify-between p-4 bg-black text-white bg-gradient-to-tl from-amber-500/80 to-purple-800/70">
      <Card
        className="py-4 bg-black/30 min-h-screen min-w-24 rounded-xl"
        style={{ backdropFilter: "blur(25px)" }}
      >
        {isLoading && <Loading />}

        <CardHeader className="pb-2 pt-0 px-4  flex-col items-start text-white">
          <h2 className="text-2xl font-bold">Order History</h2>
          <Divider className="my-2 bg-white" />
          <div>
            <Button
              className=" text-white m-2"
              onClick={handleRefresh}
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
                Router.push("/admin/users");
              }}
              variant="bordered"
              color="secondary"
              disabled={isLoading}
            >
              User List Page
            </Button>{" "}
          </div>
          <div className="mb-4 flex gap-4">
            <Input
              placeholder="Search Mobile Number..."
              value={filterMobileNumber}
              onChange={(e) => setFilterMobileNumber(e.target.value)}
              className="w-full"
              key="secondary"
              color="secondary"
              type="number"
            />
            <Select
              value={filterTableNumber}
              onChange={(e) => setFilterTableNumber(e.target.value)}
              defaultSelectedKeys={[""]}
              className="w-full dark text-black bg-black min-w-24 "
              color="secondary"
              placeholder="Table Number..."
            >
              <SelectItem
                value="1"
                key="1"
                className="text-white dark bg-purple-600/50"
              >
                Table 1
              </SelectItem>
              <SelectItem
                value="2"
                key="2"
                className="text-white dark bg-purple-600/50"
              >
                Table 2
              </SelectItem>
              <SelectItem
                value="3"
                key="3"
                className="text-white dark bg-purple-600/50"
              >
                Table 3
              </SelectItem>
            </Select>
            <Button
              className=" text-white m-2 w-52"
              onClick={() => setShowPendingOnly((prev) => !prev)}
              variant="bordered"
              color="secondary"
            >
              {showPendingOnly ? "Show All" : "Show Pending"}
            </Button>
          </div>
        </CardHeader>
        <Divider />
        <Table
          aria-label="Orders History Table"
          className="w-full dark text-white"
        >
          <TableHeader className="bg-gray-800 text-white dark">
            <TableColumn className="px-4 py-2">Order ID</TableColumn>
            <TableColumn className="px-4 py-2">Customer Table</TableColumn>
            <TableColumn className="px-4 py-2">Order Date</TableColumn>
            <TableColumn className="px-4 py-2 min-w-[100px]">
              Order Status
            </TableColumn>
            <TableColumn className="px-4 py-2">Total Amount</TableColumn>
            <TableColumn className="px-4 py-2">Payment Method</TableColumn>
            <TableColumn className="px-4 py-2">Rating</TableColumn>
            <TableColumn className="px-4 py-2">Actions</TableColumn>
            <TableColumn className="px-4 py-2">Ordered Using</TableColumn>
            <TableColumn className="px-4 py-2">Item List</TableColumn>
            <TableColumn className="px-4 py-2">Payment Status</TableColumn>
          </TableHeader>
          <TableBody className="bg-gray-700 text-white">
            {filteredOrders.map((order) => (
              <TableRow
                key={order.id}
                className="hover:bg-gray-600 transition-colors duration-300"
              >
                <TableCell className="px-4 py-2">{order.id}</TableCell>
                <TableCell className="px-4 py-2">
                  <Chip color="primary" variant="flat">
                    {order.tableNumber}
                  </Chip>
                </TableCell>

                <TableCell className="px-4 py-2">
                  {format(order.date, "yyyy-MM-dd HH:mm")}
                </TableCell>
                <TableCell className="px-4 py-2 min-w-[100px]  text-white">
                  <Select
                    className="text-white "
                    color={
                      order.status === "completed"
                        ? "success"
                        : order.status === "ready"
                        ? "warning"
                        : order.status === "preparing"
                        ? "secondary"
                        : "danger"
                    }
                    defaultSelectedKeys={[order.status] || ["pending"]}
                    onChange={(e) =>
                      handleOrderStatusChange(order.id, e.target.value)
                    }
                  >
                    {allowedStatuses.map((status) => (
                      <SelectItem
                        key={status}
                        value={status}
                        className="text-white dark bg-black/50"
                      >
                        {status}
                      </SelectItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell className="px-4 py-2">
                  {order.order.cart
                    .map((orderItem) => orderItem.quantity * orderItem.price)
                    .reduce((a, b) => a + b, 0)}
                </TableCell>
                <TableCell className="px-4 py-2">
                  <Chip color="primary" variant="flat">
                    {order.paymentMethod}
                  </Chip>
                </TableCell>
                <TableCell className="px-4 py-2">
                  {order.rating ? (
                    <Chip color="success" variant="flat">
                      {order.rating}
                    </Chip>
                  ) : (
                    <Chip color="warning" variant="flat">
                      Not Rated
                    </Chip>
                  )}
                </TableCell>
                <TableCell className="px-4 py-2">
                  <Button
                    onClick={() => handleViewDetails(order)}
                    className="bg-blue-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
                  >
                    View Details
                  </Button>
                </TableCell>
                <TableCell className="px-4 py-2">
                  {order.order.phoneNumber || "Kiosk Non Login"}
                </TableCell>
                <TableCell className="px-4 py-2">
                  {" "}
                  <Tooltip
                    className="dark"
                    content={
                      <div className="px-1 py-2 dark">
                        <div className=" font-bold">Items</div>
                        <div className="text-small">
                          {order.order.cart.map((item) => (
                            <div key={item.title}>
                              {item.quantity} x {item.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    }
                  >
                    <Button variant="bordered">
                      {" "}
                      {order.order.cart
                        .map((orderItem) => orderItem.quantity)
                        .reduce((a, b) => a + b, 0)}
                    </Button>
                  </Tooltip>
                </TableCell>
                <TableCell className="px-4 py-2">
                  {order.paymentStatus == "paid" ? (
                    <Chip color="success" variant="flat">
                      Paid
                    </Chip>
                  ) : (
                    <Chip color="warning" variant="flat">
                      Not Paid
                    </Chip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Modal
          isOpen={isOpen}
          onClose={handleCloseModal}
          backdrop="blur"
          placement="top"
          scrollBehavior="inside"
          className="dark min-w-[80%]  bg-black/50 border"
        >
          <ModalContent className="bg-transparent">
            {(onClose) => (
              <>
                <ModalHeader className=" text-white">
                  <div>Order Details</div>
                </ModalHeader>
                <ModalBody className=" text-white bg-black/20">
                  {selectedOrder && (
                    <>
                      <div>
                        <span className="font-bold">Order ID:</span>{" "}
                        {selectedOrder.id}
                      </div>
                      <div>
                        <span className="font-bold">Table Number:</span>{" "}
                        <Chip color="primary" variant="flat">
                          {selectedOrder.tableNumber}
                        </Chip>
                      </div>
                      <div>
                        <span className="font-bold">Order Date:</span>{" "}
                        {format(selectedOrder.date, "yyyy-MM-dd HH:mm")}
                      </div>
                      <div>
                        <span className="font-bold">Order Status:</span>{" "}
                        <Chip
                          color={
                            selectedOrder.status === "completed"
                              ? "success"
                              : selectedOrder.status === "Pending"
                              ? "warning"
                              : "danger"
                          }
                          variant="flat"
                        >
                          {selectedOrder.status}
                        </Chip>
                      </div>
                      <div>
                        <span className="font-bold">Payment Method:</span>{" "}
                        <Chip color="primary" variant="flat">
                          {selectedOrder.paymentMethod}
                        </Chip>
                      </div>
                      <div>
                        <span className="font-bold">Payment Status:</span>{" "}
                        <Chip
                          color={
                            selectedOrder.paymentStatus === "paid"
                              ? "success"
                              : "danger"
                          }
                          variant="flat"
                        >
                          {selectedOrder.paymentStatus}
                        </Chip>
                      </div>
                      <div>
                        <span className="font-bold">Total Amount:</span>{" "}
                        {selectedOrder.order.cart
                          .map(
                            (orderItem) => orderItem.quantity * orderItem.price
                          )
                          .reduce((a, b) => a + b, 0)}
                      </div>
                      <div>
                        <span className="font-bold">Rating:</span>{" "}
                        {selectedOrder.rating ? (
                          <Chip color="success" variant="flat">
                            {selectedOrder.rating}
                          </Chip>
                        ) : (
                          <Chip color="warning" variant="flat">
                            Not Rated
                          </Chip>
                        )}
                      </div>
                      <Spacer y={1} />
                      <div>
                        <span className="font-bold">Rate Order:</span>
                        <Input
                          type="number"
                          min={1}
                          max={5}
                          value={String(orderRating) || ""}
                          onChange={(e) =>
                            handleOrderRatingChange(
                              e.target.value
                                ? parseInt(e.target.value, 10)
                                : null
                            )
                          }
                          placeholder="Enter rating (1-5)"
                          className="w-full"
                        />
                      </div>
                      <Spacer y={1} />
                      <div>
                        <span className="font-bold">Order Items:</span>
                        <ul>
                          {selectedOrder.order.cart.map((item) => (
                            <li
                              key={item.title}
                              className="flex items-center gap-2"
                            >
                              <Image
                                src={item.imageUrl}
                                alt={item.title}
                                width={50}
                                height={50}
                                objectFit="cover"
                                className="rounded-md"
                              />
                              <div>
                                <div>{item.title}</div>
                                <div>Quantity: {item.quantity}</div>
                                <div>Price: {item.price}</div>
                                {item.addOnIds && item.addOnIds.length > 0 && (
                                  <div>
                                    Add-ons:
                                    <ul>
                                      {item.addOnIds.map((addOn) => (
                                        <li key={addOn.id}>
                                          {addOn.name} ({addOn.price})
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
                    </>
                  )}
                </ModalBody>
                <ModalFooter className=" text-white">
                  {selectedOrder?.paymentStatus !== "paid" && (
                    <Button
                      onClick={() => {
                        axios
                          .put(
                            `${API_BASE_URL}/api/v1/item/orders/${selectedOrder?.id}/payment-status`,
                            {
                              status: "paid",
                            }
                          )
                          .then(() => {
                            toast.success("Order marked as paid successfully");
                            onClose();
                            handleRefresh();
                          })
                          .catch((err) => {
                            toast.error(String(err));
                          });
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md"
                    >
                      Mark as Paid
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      axios
                        .delete(
                          `${API_BASE_URL}/api/v1/item/orders/${selectedOrder?.id}`
                        )
                        .then(() => {
                          toast.success("Order canceled successfully");
                          onClose();
                          handleRefresh();
                        })
                        .catch((err) => {
                          toast.error(String(err));
                        });
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md"
                  >
                    Cancel Order
                  </Button>
                  <Button
                    onClick={handleCloseModal}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md"
                  >
                    Close
                  </Button>
                </ModalFooter>{" "}
              </>
            )}
          </ModalContent>
        </Modal>
      </Card>
    </div>
  );
}

export default OrderHistory;
