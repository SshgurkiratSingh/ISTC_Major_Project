import Image from "next/image";

interface Props {
  title?: string;
  artist?: string;
  link?: string;
}
const NowPlaying = (
  { title, artist, link }: Props = { title: "", artist: "", link: "" }
) => {
  return (
    <div className="recent-track bg-blue-900/10 p-2 rounded-lg">
      <div className="recent-track__icon">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="recent-track__body js-track text-xl text-gray-500">
        <a href={link}>
          <h4 className="recent-track__name font-semibold">{title}</h4>
        </a>
        <p className="recent-track__artist"> - {artist}</p>
      </div>
    </div>
  );
  // return (
  //   <div className="flex items-center justify-between bg-white bg-opacity-10 p-4 rounded-xl shadow-lg backdrop-filter backdrop-blur-lg">
  //     <div className="flex items-center">
  //       <Image
  //         alt="image"
  //         width={80}
  //         height={80}
  //         className="rounded-full"
  //         src="https://i.scdn.co/image/ab67616d0000b273318443aab3531a0558e79a4d"
  //       />{" "}
  //       <div className="flex flex-col ml-3">
  //         <span className="text-sm font-semibold text-white">Now Playing</span>
  //         <span className="text-xl font-bold text-white">Timeless</span>
  //         <span className="text-md font-medium text-white">Taylor Swift</span>
  //       </div>
  //     </div>
  //   </div>
  // );
};
export default NowPlaying;
