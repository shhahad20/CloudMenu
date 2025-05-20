import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.scss";
import { API_URL } from "../api/api";
import { useCart } from "../context/CartContext";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { items } = useCart();
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
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
        method: "GET", // or POST if you wired it that way
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
          <Link to="/contact" className="circle-arrow-btn">
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
          </Link>
        </div>
        <div className="nav-links">
          {/* …other links… */}
          {itemCount > 0 && (
            <Link to="/cart" className="cart-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M1 1H1.26835C1.74213 1 1.97943 1 2.17267 1.08548C2.34304 1.16084 2.48871 1.28218 2.59375 1.43604C2.71269 1.61026 2.75564 1.8429 2.84137 2.30727L5.00004 14L15.4218 14C15.875 14 16.1023 14 16.29 13.9199C16.4559 13.8492 16.5989 13.7346 16.7051 13.5889C16.8252 13.4242 16.8761 13.2037 16.9777 12.7631L16.9785 12.76L18.5477 5.95996L18.5481 5.95854C18.7023 5.29016 18.7796 4.95515 18.6947 4.69238C18.6202 4.46182 18.4635 4.26634 18.2556 4.14192C18.0184 4 17.6758 4 16.9887 4H3.5M16 19C15.4477 19 15 18.5523 15 18C15 17.4477 15.4477 17 16 17C16.5523 17 17 17.4477 17 18C17 18.5523 16.5523 19 16 19ZM6 19C5.44772 19 5 18.5523 5 18C5 17.4477 5.44772 17 6 17C6.55228 17 7 17.4477 7 18C7 18.5523 6.55228 19 6 19Z"
                  stroke="#1E1E1E"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span className="cart-count">{itemCount}</span>
            </Link>
          )}

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
        {/* Mobile Menu Button */}

      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: isOpen ? "auto" : 0 }}
        transition={{ duration: 0.3 }}
        className={`mobile-menu${isOpen ? " open" : ""}`}
      >
        <div className="mobile-links">
          <Link to="/" onClick={toggleMenu}>
            Home
          </Link>

          {isLoggedIn ? (
            <>
              <Link to="/dashboard" onClick={toggleMenu}>
                Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
                className="logout-button"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/sign-in" onClick={toggleMenu}>
                Sign In
              </Link>
              {/* if you have a sign-up route: */}
              <Link to="/sign-up" onClick={toggleMenu}>
                Sign Up
              </Link>
            </>
          )}

          <Link to="/menus" onClick={toggleMenu}>
            Menus
          </Link>
          <Link to="/pricing" onClick={toggleMenu}>
            Pricing
          </Link>
          <Link to="/faqs" onClick={toggleMenu}>
            FAQs
          </Link>
          <Link to="/contact" onClick={toggleMenu}>
            Contact
          </Link>

          {itemCount > 0 && (
            <Link to="/cart" className="cart-icon" onClick={toggleMenu}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M1 1H1.26835C1.74213 1 1.97943 1 2.17267 1.08548C2.34304 1.16084 2.48871 1.28218 2.59375 1.43604C2.71269 1.61026 2.75564 1.8429 2.84137 2.30727L5.00004 14L15.4218 14C15.875 14 16.1023 14 16.29 13.9199C16.4559 13.8492 16.5989 13.7346 16.7051 13.5889C16.8252 13.4242 16.8761 13.2037 16.9777 12.7631L16.9785 12.76L18.5477 5.95996L18.5481 5.95854C18.7023 5.29016 18.7796 4.95515 18.6947 4.69238C18.6202 4.46182 18.4635 4.26634 18.2556 4.14192C18.0184 4 17.6758 4 16.9887 4H3.5M16 19C15.4477 19 15 18.5523 15 18C15 17.4477 15.4477 17 16 17C16.5523 17 17 17.4477 17 18C17 18.5523 16.5523 19 16 19ZM6 19C5.44772 19 5 18.5523 5 18C5 17.4477 5.44772 17 6 17C6.55228 17 7 17.4477 7 18C7 18.5523 6.55228 19 6 19Z"
                  stroke="#1E1E1E"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span className="cart-count">{itemCount}</span>
            </Link>
          )}
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;
