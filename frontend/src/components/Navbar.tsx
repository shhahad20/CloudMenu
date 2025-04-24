import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.scss";
import { API_URL } from "../api/api";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // On mount, check if we have a token
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      // fallback if somehow no token
      setIsLoggedIn(false);
      return navigate("/", { replace: true });
    }

    try {
      // 1) call the backend
      const res = await fetch(`${API_URL}/auth/logout`, {
        method: "GET",                       // or POST if you wired it that way
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        // Optional: inspect the error body
        const err = await res.json();
        console.error("Logout failed:", err);
        // you can choose to still clear local state
      }
    } catch (e) {
      console.error("Network error during logout", e);
    } finally {
      // 2) clear client‐side session
      localStorage.removeItem("access_token");
      setIsLoggedIn(false);
      navigate("/", { replace: true });
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  // const toggleAccountMenu = () => setAccountMenuOpen(!accountMenuOpen);

  return (
    <nav className="navbar">
      <div className="container">
        {/* Logo */}
        {/* <div className="logo">CloudMenu</div> */}
        <Link to="/" className="logo">
          CloudMenu
        </Link>

        {/* Center Links */}
        <div className="center-links">
          <Link to="/">Home</Link>
          <Link to="/menus">Menus</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/faqs">FAQs</Link>
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="btn">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/sign-in" className="btn">
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Account Menu */}
        {/* <div className="account-menu">
          <button onClick={toggleAccountMenu} className="account-button">
            <p className="account-text">Sign Up</p>
          </button>

          {accountMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="account-dropdown"
            >
              <Link to="/profile">Profile</Link>
              <Link to="/settings">Settings</Link>
              <button>Logout</button>
            </motion.div>
          )}
        </div> */}

        <div className="contact-btn-wrapper">
          <button
            className="circle-arrow-btn"
            onClick={() => alert("Button Clicked!")}
          >
            <span className="btn-text">Let's Talk</span>
            <span className="icon-container">
              <span className="arrow">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-button" onClick={toggleMenu}>
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </motion.div>
        </button>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: isOpen ? "auto" : 0 }}
        transition={{ duration: 0.3 }}
        className="mobile-menu"
      >
        <div className="mobile-links">
          <Link to="/">Home</Link>
          <Link to="/">Sign up</Link>
          <Link to="/menus">Menus</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/faqs">FAQs</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;
