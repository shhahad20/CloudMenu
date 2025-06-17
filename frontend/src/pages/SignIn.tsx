import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../styles/signup.scss";
import { signIn } from "../utils/authUtils";

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: Location } };

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const to = location.state?.from?.pathname || "/dashboard";
      navigate(to, { replace: true });
    } else {
      setIsCheckingAuth(false);
    }
  }, [navigate, location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(formData.email, formData.password);
      const to = location.state?.from?.pathname || "/dashboard";
      navigate(to, { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="signup-container">
        <div className="loading-container">
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="signup-container">
      {/* left image/noise panel */}
      <div className="gradient-section">
        <div className="inner-signup-header">
          <h1>Welcome Back!</h1>
          <p>Login to your account</p>
        </div>
      </div>

      {/* right form panel */}
      <div className="form-section">
        <h2 className="signup-header">Sign In</h2>
        <p className="signup-subheader">
          Enter your details to access your account
        </p>
        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="password">Password:</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={togglePassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  // eye-off icon
                  <svg id="open" width="25" height="25">
                    <g stroke="#1E1E1E" stroke-miterlimit="10">
                      <path
                        d="M21.632 12.5a9.759 9.759 0 01-18.264 0 9.759 9.759 0 0118.264 0z"
                        fill="none"
                      />
                      <circle cx="12.5" cy="12.5" r="3" fill="#1E1E1E" />
                      <path
                        fill="none"
                        d="M12.5 5v1-4M9.291 6.337L7.709 2.663M15.709 6.337l1.582-3.674"
                      />
                    </g>
                  </svg>
                ) : (
                  // eye icon
                  <svg id="close" width="25" height="25">
                    <g fill="none" stroke="#1E1E1E" stroke-miterlimit="10">
                      <path d="M21.632 12.5a9.759 9.759 0 01-18.264 0M12.5 19.5v-1 4M9.291 18.163l-1.582 3.674M15.709 18.163l1.582 3.674" />
                    </g>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <p className="forgot-password">
            <Link to="/forgot-password">Forgot your password?</Link>
          </p>
          <button type="submit" disabled={loading}>
            {" "}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="sign-in-note">
          Don’t have an account? <Link to="/sign-up">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
