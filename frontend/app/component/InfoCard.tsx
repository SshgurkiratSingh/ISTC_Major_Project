import React from "react";
interface Props {
  name?: string;
  mobile?: string;
  createdOn?: string;
}
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/react";
function UserInfoCard({ name, mobile, createdOn }: Props) {
  return (
    <Card className="dark bg-transparent border m-2 p-1">
      <h2 className="text-white text-xl font-bold">User Info: </h2>

      <p>Name: {name}</p>

      <p>Mobile: {mobile}</p>
    </Card>
  );
}

export default UserInfoCard;
