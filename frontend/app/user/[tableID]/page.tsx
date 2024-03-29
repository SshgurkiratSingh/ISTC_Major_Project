import Image from "next/image";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomUserPage from "../CustomUserPage";
interface IParams {
  tableID: string;
}

export default function Home({ params }: { params: IParams }) {
  return (
    <div>
      <ToastContainer theme="dark" closeOnClick transition={Bounce} />
      <CustomUserPage tableId={params.tableID} />
    </div>
  );
}
