import Image from "next/image";

const NowPlaying = () => {
  return (
    <div className="flex flex-row items-center gap-2">
      <Image
        isZoomed
        width={80}
        height={80}
        className="rounded-full"
        alt="Current sonf"
        src="https://i.scdn.co/image/ab67616d0000b273318443aab3531a0558e79a4d"
      />{" "}
      <div className="flex flex-col">
        <h4 className="- ">Now Playing</h4>
        <h5 className="text-large font-extrabold">Timeless</h5>
        <small className="font-bold text-default-800">Taylor Swift</small>
      </div>
    </div>
  );
};
export default NowPlaying;
