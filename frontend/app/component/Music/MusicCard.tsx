"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Image,
  CardFooter,
  Button,
} from "@nextui-org/react";
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
        <p className="text-tiny text-black/95">
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
          onClick={onClick}
        >
          Add to Queue
        </Button>
      </CardFooter>
    </Card>
  );
};
export default MusicCard;
