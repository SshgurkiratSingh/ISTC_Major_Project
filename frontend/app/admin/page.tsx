"use client";
import { Card, CardBody } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-purple-500 to-pink-500">
      <Card
        className="dark bg-transparent border-none shadow-lg rounded-xl"
        style={{
          backgroundImage: "linear-gradient(to bottom right, #6366F1, #EC4899)",
        }}
      >
        <CardBody>
          <ToastContainer theme="dark" closeOnClick transition={Bounce} />
          <AnimatePresence>
            <motion.div
              className="flex flex-col space-y-4"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
            >
              {" "}
              <Link href="/">
                <motion.p
                  className="text-white hover:text-gray-300 transition-colors duration-300"
                  whileHover={{
                    scale: 1.1,
                    transition: { duration: 0.2 },
                  }}
                >
                  Home Page
                </motion.p>
              </Link>
              <Link href="/admin/tableStatus">
                <motion.p
                  className="text-white hover:text-gray-300 transition-colors duration-300"
                  whileHover={{
                    scale: 1.1,
                    transition: { duration: 0.2 },
                  }}
                >
                  Table Status
                </motion.p>
              </Link>
              <Link href="/admin/users">
                <motion.p
                  className="text-white hover:text-gray-300 transition-colors duration-300"
                  whileHover={{
                    scale: 1.1,
                    transition: { duration: 0.2 },
                  }}
                >
                  User Page
                </motion.p>
              </Link>
              <Link href="/admin/orderHistory">
                <motion.p
                  className="text-white hover:text-gray-300 transition-colors duration-300"
                  whileHover={{
                    scale: 1.1,
                    transition: { duration: 0.2 },
                  }}
                >
                  Order History Page
                </motion.p>
              </Link>
              <Link href="/user/1">
                <motion.p
                  className="text-white hover:text-gray-300 transition-colors duration-300"
                  whileHover={{
                    scale: 1.1,
                    transition: { duration: 0.2 },
                  }}
                >
                  Order Page 1
                </motion.p>
              </Link>
              <Link href="/user/2">
                <motion.p
                  className="text-white hover:text-gray-300 transition-colors duration-300"
                  whileHover={{
                    scale: 1.1,
                    transition: { duration: 0.2 },
                  }}
                >
                  Order Page 2
                </motion.p>
              </Link>
              <Link href="/user/3">
                <motion.p
                  className="text-white hover:text-gray-300 transition-colors duration-300"
                  whileHover={{
                    scale: 1.1,
                    transition: { duration: 0.2 },
                  }}
                >
                  Order Page 3
                </motion.p>
              </Link>
            </motion.div>
          </AnimatePresence>
        </CardBody>
      </Card>
    </div>
  );
}
