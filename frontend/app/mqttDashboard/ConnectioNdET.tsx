import React from "react";
import { Card, CardBody } from "@nextui-org/react";

const ConnectionDetails = () => {
  return (
    <Card className="max-w-md animated-border rounded-md">
      <CardBody>
        <div>
          <p className="font-bold">MQTT Server address:</p>
          <p className="bg-accents-7 rounded-sm py-2 px-3 block">
            244.178.44.111:1883
          </p>
        </div>
        <div>
          <p className="font-bold">Wifi SSID:</p>
          <p className="bg-accents-7 rounded-sm py-2 px-3 block">IoT-Club</p>
        </div>
        <div>
          <p className="font-bold">Wifi Password:</p>
          <p className="bg-accents-7 rounded-sm py-2 px-3 block">12345678</p>
        </div>
      </CardBody>
    </Card>
  );
};

export default ConnectionDetails;
