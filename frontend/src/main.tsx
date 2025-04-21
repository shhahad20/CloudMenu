import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { Provider } from "react-redux";
import App from "./App.tsx";
import "./index.css";
import store from "./redux/store.ts";
import MenuTemplates from "./pages/MenuTemplates.tsx";
import Signup from "./pages/Signup.tsx";


// import Logout from './pages/Logout.tsx';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/home" element={<Home />} />
            <Route path="/menus" element={<MenuTemplates />} />
            <Route path="/signup" element={<Signup />} />

          </Routes>
        </BrowserRouter>
    </Provider>
  </StrictMode>
);
