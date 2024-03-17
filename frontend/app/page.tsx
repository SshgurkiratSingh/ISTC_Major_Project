import Image from "next/image";
import HomePage from "./component/MainPage/StartPage";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  return (
    <div>
      <HomePage />
      <ToastContainer theme="dark" closeOnClick transition={Bounce} />
    </div>
  );
}
