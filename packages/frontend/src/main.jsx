import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { NotificationProvider } from "./components/Notification.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </NotificationProvider>
  </StrictMode>,
);
