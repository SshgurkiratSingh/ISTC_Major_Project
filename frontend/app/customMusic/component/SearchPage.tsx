"use client";
import NowPlaying from "@/app/component/MainPage/NowPlaying";
import {
  Card,
  CardHeader,
  CardBody,
  Image,
  Divider,
  Button,
  Tabs,
  Tab,
  Input,
} from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import MusicCard from "@/app/component/Music/MusicCard";
import { CiSearch } from "react-icons/ci";
import API_BASE_URL from "@/APIconfig";
const SearchPage = () => {
  const [currentPlaying, setCurrentPlaying] = useState({
    artist: "",
    title: "",
    link: "",
  });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSearchResults = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/spotify/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }), // Ensure the API expects the query in this format
      });
      const data = await response.json();
      setSearchResults(data.body.tracks.items); // Assuming the API returns an array of search results
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };
  const handleKeyPress = (e: { key: string }) => {
    if (e.key === "Enter") {
      fetchSearchResults(); // Call the search function when Enter key is pressed
    }
  };

  useEffect(() => {
    const fetchCurrentPlaying = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/spotify/currentQueue`
        );
        const data = await response.json();
        setCurrentPlaying({
          artist: data.body.item.artists[0].name,
          title: data.body.item.name,
          link: data.body.item.external_urls.spotify,
        });
      } catch (error) {
        console.error("Error fetching current playing track:", error);
      }
    };

    fetchCurrentPlaying();
  }, []); // Empty dependency array means this effect runs once on mount
  return (
    <div className=" min-h-screen flex-col items-center justify-between  text-white p-4 ">
      <Card
        className="py-4 bg-black/20 min-h-screen min-w-24 dark"
        style={{ backdropFilter: "blur(25px)" }}
      >
        <CardHeader className="pb-2 pt-0 px-4 gap-1 flex-col items-center">
          <NowPlaying
            artist={currentPlaying.artist}
            title={currentPlaying.title}
            link={currentPlaying.link}
          />
          <Input
            isClearable
            radius="lg"
            classNames={{
              label: "text-black/50 dark:text-white/90",
              input: [
                "bg-transparent",
                "text-black/90 dark:text-white/90",
                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                "rounded-lg",
              ],
              innerWrapper: "bg-transparent",
              inputWrapper: [
                "shadow-xl",
                "bg-default-200/50",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focused=true]:bg-default-200/50",
                "dark:group-data-[focused=true]:bg-default/60",
                "!cursor-text",
              ],
            }}
            placeholder="Type to search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={
              <CiSearch className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
            }
            onKeyPress={handleKeyPress}
            onClear={() => setSearchQuery("")}
          />
          <Button
            className="bg-default-700/50 dark:bg-default/60"
            onClick={fetchSearchResults}
          >
            Search
          </Button>
        </CardHeader>

        <CardBody className="overflow-visible py-2  grid md:grid-cols-1 xl:grid-cols-4 items-center justify-center gap-1 ">
          {searchResults.map((result, index) => (
            <MusicCard
              key={index}
              title={result.name}
              artist={result.artists[0].name}
              link={result.album.images[0].url}
              id={result.uri}
            />
          ))}
        </CardBody>
      </Card>
    </div>
  );
};
export default SearchPage;
