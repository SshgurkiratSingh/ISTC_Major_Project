"use client";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import React, { useState, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import ConnectionDetails from "./ConnectioNdET";
import API_BASE_URL from "@/APIconfig";

interface MQTTMessage {
  id: Date;
  topic: string;
  message: string;
}
import { VscDebugStart, VscDebugPause } from "react-icons/vsc"; // import relevant icons

type MQTTData = MQTTMessage[];

function Dashboard() {
  const [date, setDate] = useState<Date>(new Date());
  const [mqttData, setMqttData] = useState<MQTTData>([]);

  useEffect(() => {
    const interval = setInterval(() => setDate(new Date()), 1000);
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/mqtt/`);
        const data: MQTTData = await response.json();
        setMqttData(data);
      } catch (error) {
        console.error("Error fetching MQTT data:", error);
      }
    };
    fetchData();
    const dataInterval = setInterval(fetchData, 3000);
    return () => {
      clearInterval(interval);
      clearInterval(dataInterval);
    };
  }, []);

  const isWorkshopDay = (day: number): boolean => {
    const workshopStart = new Date(2024, 3, 24); // April 24, 2024
    const workshopEnd = new Date(2024, 3, 26); // April 26, 2024
    const currentDate = new Date();
    return (
      currentDate >= workshopStart &&
      currentDate <= workshopEnd &&
      currentDate.getDate() === day
    );
  };

  const getAgendaForDay = (day: number): string => {
    switch (day) {
      case 24:
        return "Electronics and IoT Basics";
      case 25:
        return "MQTT Communication";
      case 26:
        return "Project: IoT-Enabled Miniature Room";
      default:
        return "No Workshop";
    }
  };

  const day = date.getDate();
  const workshopDay = isWorkshopDay(day) ? `Day ${day - 23}` : "";
  const agenda = getAgendaForDay(day);
  const formattedDate = format(date, "EEEE, MMMM do, yyyy");
  const formattedTime = format(date, "h:mm:ss a");

  return (
    <div
      style={{ height: "100vh" }}
      className="p-4 bg-gradient-to-br from-red-800/30 via-yellow-500/15 to-purple-800/70"
    >
      <Card
        className="dark bg-black/40 border-2 border-white/30 backdrop-blur-lg neon-glass-effect overflow-x-hidden"
        style={{ height: "100%" }}
      >
        <CardHeader
          className="text-white text-2xl font-bold text-center justify-center items-center justify-content-center titBlock"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          <div className="flex flex-col items-center">
            <h1 className="text-3xl">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                ISTC IoT Club Dashboard
              </span>
            </h1>
            <p className="text-lg">
              {formattedDate} - {formattedTime}
            </p>
            <div className="flex items-center space-x-4 animate-pulse">
              <VscDebugStart className="text-2xl text-green-400" />
              <h2 className="text-2xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                  {workshopDay} - {agenda}
                </span>
              </h2>
              <VscDebugPause className="text-2xl text-red-400" />
            </div>
          </div>
        </CardHeader>
        <Divider />
        <CardBody
          style={{ fontFamily: "'Space Mono', monospace" }}
          className="text-white flex flex-col items-center w-full"
        >
          <div className="flex flex-row justify-center w-full m-2 p-2 gap-1">
            <ConnectionDetails />
            <Table
              aria-label="MQTT Data"
              className="bg-gradient-to-br from-red/80 to-yellow-900 border-2 border-blue-600/50 rounded-lg shadow-md text-white overflow-hidden "
            >
              <TableHeader className="bg-transparent ">
                <TableColumn className="text-white">Timestamp</TableColumn>
                <TableColumn className="text-white">Topic</TableColumn>
                <TableColumn className="text-white">Message</TableColumn>
              </TableHeader>
              <TableBody>
                {mqttData.map((data, index) => (
                  <TableRow
                    key={index}
                    className="hover:bg-gray-800  transition-all"
                  >
                    <TableCell className="text-white">
                      {" "}
                      {formatDistanceToNow(new Date(data.id), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-white">{data.topic}</TableCell>
                    <TableCell className="text-white">{data.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default Dashboard;
