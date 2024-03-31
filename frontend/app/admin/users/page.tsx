import Image from "next/image";

import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserList from "./userList";

export default function Home() {
  return (
    <div>
      <ToastContainer theme="dark" closeOnClick transition={Bounce} />
      <UserList />
    </div>
  );
}
