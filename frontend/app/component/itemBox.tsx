"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
  Button,
  Chip,
} from "@nextui-org/react";
interface ItemBoxProps {
  title: string;
  imageUrl: string;
  price: number;
  className?: string;
  onClick?: () => void;
  description?: string;
  misc?: string;
}
const ItemBox = ({
  title = "",
  imageUrl = "",
  price = 0,
  className = "bg-gradient-to-r from-blue-400/50 to-green-600/50",
  onClick,
  misc = "new",
  description = "a",
}: ItemBoxProps) => {
  return (
    <div
      className={`w-full max-w-sm  ${className} border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700`}
    >
      <div className="relative top-2 left-4">
        <Chip className="p-2">{misc}</Chip>
      </div>

      <img className="p-8 rounded-full" src={imageUrl} alt="product image" />

      <div className="px-5 pb-5">
        <a href="#">
          <h5 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h5>
        </a>
        <div className="flex items-center mt-2.5 mb-5">{description}</div>
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            ₹{price}
          </span>
          <Button color="warning">Customise</Button>
        </div>
      </div>
    </div>
  );
};
export default ItemBox;
