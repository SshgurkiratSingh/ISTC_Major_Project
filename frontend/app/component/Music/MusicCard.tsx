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
const MusicCard = () => {
  return (
    <Card
      isFooterBlurred
      radius="lg"
      className="border-none w-[320px] h-[320px] relative"
      isBlurred
    >
      <Image
        alt="Woman listing to music"
        className="object-cover"
        height={320}
        src="https://i.scdn.co/image/ab67616d0000b273318443aab3531a0558e79a4d"
        width={320}
      />
      <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
        <p className="text-tiny text-white/80">
          <p className="font-bold">
            {" "}
            All Too Well (10 Minute Version) (Taylor's Version) (From The Vault)
          </p>{" "}
          - Taylor Swift
        </p>
        <Button
          className="text-tiny text-white bg-black/20"
          variant="flat"
          color="default"
          radius="lg"
          size="md"
        >
          Add to Queue
        </Button>
      </CardFooter>
    </Card>
  );
};
export default MusicCard;
