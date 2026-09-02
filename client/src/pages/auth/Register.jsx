/**
 * pages/Register.jsx
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { registerUser, clearError } from "../../redux/slices/authSlice";
import AuthCard, {
  authInputClass,
  authButtonClass,
  authLinkClass,
} from "../../components/auth/AuthCard";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(result)) {
      toast.success("OTP sent! Verify to complete registration.");
      navigate("/verify-otp", {
        state: {
          email: result.payload.email,
          purpose: "register",
        },
      });
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start tracking your expenses in minutes"
      footer={
        <p className="text-center text-sm text-textSecondary">
          Already have an account?{" "}
          <Link to="/login" className={authLinkClass}>
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-textPrimary">
            Full name
          </label>
          <input
            name="name"
            type="text"
            required
            autoComplete="name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, [e.target.name]: e.target.value })
            }
            className={authInputClass}
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-textPrimary">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, [e.target.name]: e.target.value })
            }
            className={authInputClass}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-textPrimary">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, [e.target.name]: e.target.value })
            }
            className={authInputClass}
            placeholder="At least 6 characters"
          />
        </div>

        <button type="submit" disabled={loading} className={authButtonClass}>
          {loading ? "Sending OTP..." : "Continue"}
        </button>
      </form>
    </AuthCard>
  );
};

export default Register;
