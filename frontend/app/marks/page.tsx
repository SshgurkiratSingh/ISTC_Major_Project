import Image from "next/image";

import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MarksPage from "./MarksPage";

export default function Home() {
  return (
    <div className="bg-black">
      <ToastContainer theme="dark" closeOnClick transition={Bounce} />
      <MarksPage />
    </div>
  );
}
