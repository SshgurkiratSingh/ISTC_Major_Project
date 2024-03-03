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

const ItemBox = () => {
  return (
    <div className="w-full max-w-sm bg-gradient-to-r from-yellow-400/50 to-orange-600/30  border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <div className="relative top-2 left-4">
        <Chip className="p-2 fixed ">Most Popular</Chip>
      </div>

      <img
        className="p-8 rounded-full"
        src="/food/frenchFries.webp"
        alt="product image"
      />

      <div className="px-5 pb-5">
        <a href="#">
          <h5 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
            French Fries
          </h5>
        </a>
        <div className="flex items-center mt-2.5 mb-5">
          Immerse yourself in the crispy perfection of hand-cut, golden
          potatoes, artfully seasoned to savory perfection. Each bite unveils a
          symphony of textures the satisfying crunch giving way to a fluffy
          interior that melts in your mouth
        </div>
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            ₹90
          </span>
          <Button color="warning">Customise</Button>
        </div>
      </div>
    </div>
  );
};
export default ItemBox;
