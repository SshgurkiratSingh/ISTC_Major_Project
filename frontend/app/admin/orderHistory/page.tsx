import Image from "next/image";

import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrderHistory from "./OrderHistory";

export default function Home() {
  return (
    <div>
      <ToastContainer theme="dark" closeOnClick transition={Bounce} />
      <OrderHistory />
    </div>
  );
}
