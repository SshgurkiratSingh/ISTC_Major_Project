import Image from "next/image";
import SearchPage from "./component/SearchPage";
import { Bounce, ToastContainer } from "react-toastify";
export default function Home() {
  return (
    <>
      {/* <ToastContainer theme="dark" closeOnClick transition={Bounce} /> */}
      <SearchPage />
    </>
  );
}
