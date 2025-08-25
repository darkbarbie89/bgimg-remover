import React from "react";
import { createRoot } from "react-dom/client";
import BackgroundRemoverApp from "./components/BackgroundRemoverApp.tsx";

// Find the embed container in embed.html
const container = document.getElementById("bgimg-embed");

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <BackgroundRemoverApp />
    </React.StrictMode>
  );
}
