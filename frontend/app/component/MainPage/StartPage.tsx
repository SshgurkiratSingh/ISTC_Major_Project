"use client";
import {
  Card,
  CardHeader,
  CardBody,
  Image,
  Divider,
  Button,
  Tabs,
  Tab,
} from "@nextui-org/react";
import NowPlaying from "./NowPlaying";

const HomePage = () => {
  return (
    <div className=" min-h-screen flex-col items-center justify-between  text-white p-4 ">
      <Card
        className="py-4 bg-black/30 min-h-screen min-w-24"
        style={{ backdropFilter: "blur(25px)" }}
      >
        <CardHeader className="pb-2 pt-0 px-4  flex-col items-start">
          <div className="flex flex-row justify-between items-start gap-1 w-full gradHead">
            <div>
              <h4 className="font-bold text-large text-gray-400">
                Collaborative Kitchen
              </h4>
            </div>
            <div>
              <NowPlaying />
            </div>
          </div>
          <Divider className="my-2 h-0.5 bg-white" />
        </CardHeader>
        <CardBody className="overflow-visible py-2">
          <div className="w-full flex flex-row  items-center gap-2 bg-black px-2 dark">
            <div className="flex w-full flex-col">
              <Tabs
                aria-label="Options"
                variant="bordered"
                color="secondary"
                radius="full"
              >
                <Tab key="photos" title="Burgers">
                  <Card className=" border-cyan-300 border-1">
                    <CardBody>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                      sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                      ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </CardBody>
                  </Card>
                </Tab>
                <Tab key="music" title="Pizza">
                  <Card>
                    <CardBody>
                      Ut enim ad minim veniam, quis nostrud exercitation ullamco
                      laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                      irure dolor in reprehenderit in voluptate velit esse
                      cillum dolore eu fugiat nulla pariatur.
                    </CardBody>
                  </Card>
                </Tab>
                <Tab key="s" title="Sides">
                  <Card>
                    <CardBody>
                      Excepteur sint occaecat cupidatat non proident, sunt in
                      culpa qui officia deserunt mollit anim id est laborum.
                    </CardBody>
                  </Card>
                </Tab>
                <Tab key="videos" title="Drinks">
                  <Card>
                    <CardBody>
                      Excepteur sint occaecat cupidatat non proident, sunt in
                      culpa qui officia deserunt mollit anim id est laborum.
                    </CardBody>
                  </Card>
                </Tab>
              </Tabs>
            </div>
          </div>

          <div className="fixed bottom-10 bg-black/30 p-2 rounded-md text-white w-full">
            <div className="flex flex-row gap-2">
              <Button color="primary" variant="shadow">
                View Cart
              </Button>
              <Button color="danger" variant="shadow">
                Checkout
              </Button>
              <Button color="success" variant="shadow">
                New Session
              </Button>
              <Button color="secondary" variant="shadow">
                Sync Cart
              </Button>
              <Button color="warning" variant="shadow">
                Add Item
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
export default HomePage;
