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
import SignIn from "./pages/SignIn.tsx";
import FAQ from "./pages/FAQ.tsx";
// import Pricing from "./pages/PricingPage.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import ConfirmEmailSent from "./pages/ConfirmEmail.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Template1 from "./components/Templates/Classic.tsx";
import HeaderImageBuilder from "./components/TemplateBuilder.tsx";
import Template1Renderer from "./components/Templates/ClassicRenderer.tsx";
import DashboardMenus from "./pages/DashboardMenus.tsx";
// import Upgrade from "./pages/Upgarde.tsx";
import PricingPage from "./pages/PricingPage.tsx";
import CartPage from "./pages/CartPage.tsx";
import CheckoutPage from "./pages/CheckoutPage.tsx";
import { CartProvider } from "./context/CartContext.tsx";

// import Logout from './pages/Logout.tsx';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
    <CartProvider>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/home" element={<Home />} />
          <Route path="/menus" element={<MenuTemplates />} />
          <Route
            path="/menus/15e74dd9-c765-477a-afc2-3b5b3b2e66c6"
            element={<Template1 />}
          />
          <Route path="/menus/:id" element={<Template1Renderer />} />
          <Route path="/builder/:id" element={<HeaderImageBuilder />} />
          <Route path="/sign-up" element={<Signup />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/confirm-email" element={<ConfirmEmailSent />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/faqs" element={<FAQ />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/menus" element={<DashboardMenus />} />
          <Route path="/dashboard/upgrade/pricing" element={<PricingPage />} />

          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

        </Routes>
      </BrowserRouter>
      </CartProvider>

    </Provider>
  </StrictMode>
);
