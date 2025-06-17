import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { Provider } from "react-redux";
import App from "./App.tsx";
import "./index.css";
import "./styles/UI/listControls.scss";

import store from "./redux/store.ts";
import MenuTemplates from "./pages/MenuTemplates.tsx";
import Signup from "./pages/Signup.tsx";
import SignIn from "./pages/SignIn.tsx";
import FAQ from "./pages/FAQ.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import ConfirmEmailSent from "./pages/ConfirmEmail.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import HeaderImageBuilder from "./components/TemplateBuilder.tsx";
import DashboardMenus from "./pages/DashboardMenus.tsx";
import PricingPage from "./pages/PricingPage.tsx";
import CartPage from "./pages/CartPage.tsx";
import { CartProvider } from "./context/CartContext.tsx";
import LetsTalk from "./pages/LetsTalk.tsx";
import InvoicesPage from "./pages/InvoicesPage.tsx";
import InvoiceDetails from "./pages/InvoiceDetails.tsx";
import CheckoutSuccess from "./pages/CheckoutSuccess.tsx";
import SettingsPage from "./pages/SettingPage.tsx";
import TemplateQRCode from "./pages/TemplateQRCode.tsx";
import TemplateRenderer from "./pages/TemplateRenderer.tsx";
import CheckoutPage2 from "./pages/CheckoutPage2.tsx";
import { RequireAuth } from "./components/RequireAuth.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <CartProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/home" element={<Home />} />
              <Route path="/menus" element={<MenuTemplates />} />
              {/* <Route
              path="/breakfast"
              element={<MoriningRituals />}
            /> */}
              <Route path="/menus/:id" element={<TemplateRenderer />} />
              <Route path="/templates/qr/:id" element={<TemplateQRCode />} />
              <Route path="/sign-up" element={<Signup />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/confirm-email" element={<ConfirmEmailSent />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              <Route path="/faqs" element={<FAQ />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<LetsTalk />} />

              {/* AUTHENTICATION PROTECTION */}
              <Route element={<RequireAuth />}>
              <Route path="/builder/:id" element={<HeaderImageBuilder />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/menus" element={<DashboardMenus />} />
              <Route
                path="/dashboard/upgrade/pricing"
                element={<PricingPage />}
              />
              <Route path="/dashboard/invoices" element={<InvoicesPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage2 />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route
                path="/checkout/cancel"
                element={<h1>Checkout canceled.</h1>}
              />
              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/invoices/:id" element={<InvoiceDetails />} />
              <Route path="dashboard/settings" element={<SettingsPage />} />
              </Route>
              {/* END OF AUTHENTICATION PROTECTION */}

              
            </Routes>
          </BrowserRouter>
          </AuthProvider>
      </CartProvider>
    </Provider>
  </StrictMode>
);
