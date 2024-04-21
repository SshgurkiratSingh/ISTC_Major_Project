import { CircularProgress } from "@nextui-org/react";
import React from "react";

function Loading() {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <CircularProgress size="lg" color="primary" label="Loading..." />
    </div>
  );
}

export default Loading;
