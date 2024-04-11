import Image from "next/image";

import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./Dashboard";

export default function Home() {
  return (
    <div className="bg-black">
      <Dashboard />
      <ToastContainer theme="dark" closeOnClick transition={Bounce} />
    </div>
  );
}
