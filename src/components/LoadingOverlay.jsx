import React from "react";
import { Loading } from "./Loading.jsx";

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Loading />
    </div>
  );
}
