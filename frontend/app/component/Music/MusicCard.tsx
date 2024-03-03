"use client";
import React, { useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Image,
  CardFooter,
  Button,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import API_BASE_URL from "@/APIconfig";
interface MusicCardProps {
  link?: string;
  artist?: string;
  title?: string;
  onClick?: () => void;
  id?: string;
}
const MusicCard = ({
  link = "",
  artist = "",
  title = "",
  onClick,
  id = "",
}: MusicCardProps) => {
  useEffect(() => {
    toast.success("Track added to queue");
  }, []);
  const handleAddToQueue = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/spotify/addToQueue`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }), // Send the track ID in the request body
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Handle the success response here, e.g., a confirmation message
      toast.success("Track added to queue");
    } catch (error) {
      console.error("Error adding track to queue:", error);
    }
  };

  return (
    <Card
      isFooterBlurred
      radius="lg"
      className="border-none w-[320px] h-[320px] relative"
      isBlurred
    >
      <Image
        alt="thubnail"
        className="object-cover"
        height={320}
        src={link}
        width={320}
      />
      <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
        <p className="text-tiny text-white/95">
          <p className="font-bold">
            {" "}
            {title.length > 20 ? title.substring(0, 29) + "..." : title}
          </p>{" "}
          - {artist}
        </p>
        <Button
          className="text-tiny text-white bg-black/20"
          variant="flat"
          color="default"
          radius="lg"
          size="md"
          onClick={handleAddToQueue}
        >
          Add to Queue
        </Button>
      </CardFooter>
    </Card>
  );
};
export default MusicCard;
