"use client";
import { Card, CardHeader, CardBody, Image, Divider } from "@nextui-org/react";
import NowPlaying from "./NowPlaying";

const HomePage = () => {
  return (
    <div className=" min-h-screen flex-col items-center justify-between  text-black p-4 ">
      <Card
        className="py-4 bg-transparent min-h-screen min-w-24"
        style={{ backdropFilter: "blur(10px)" }}
      >
        <CardHeader className="pb-2 pt-0 px-4  flex-col items-start">
          <div className="flex flex-row justify-between items-start gap-1 w-full ">
            <div>
              <h4 className="font-bold text-large">Collaborative Kitchen</h4>
            </div>
            <div>
              <NowPlaying />
            </div>
          </div>
          <Divider className="my-2 h-0.5 bg-black" />
          <div className="flex flex-row items-start gap-1 w-full min-h-[60%]">
            <p className="text-default-800">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum
            </p>
            <Divider orientation="vertical" className="h-24 bg-black" />
            <p className="text-default-800">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum
            </p>
          </div>
          <Divider className="my-2 h-0.5 bg-black" />
          <div>
            <p className="text-default-800">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum
            </p>
          </div>
        </CardHeader>
        <CardBody className="overflow-visible py-2"></CardBody>
      </Card>
    </div>
  );
};
export default HomePage;
