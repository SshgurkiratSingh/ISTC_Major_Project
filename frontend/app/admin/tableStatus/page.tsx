import Image from "next/image";

import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TablePage from "./TablePage";

export default function Home() {
  return (
    <div>
      <ToastContainer theme="dark" closeOnClick transition={Bounce} />
      <TablePage />
    </div>
  );
}
