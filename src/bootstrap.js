import React from "react";
import { createRoot } from "react-dom/client"; // Updated import
import { BrowserRouter } from "react-router-dom";
import App from "./components/app";
import "./style/main.scss";


function main() {
  const container = document.querySelector(".app-wrapper");
  const root = createRoot(container); // Create a root.
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

document.addEventListener("DOMContentLoaded", main);

