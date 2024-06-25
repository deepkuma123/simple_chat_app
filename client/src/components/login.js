import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setLogin } from "../state";
import { useDispatch } from "react-redux";
import styles from "./register.module.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Login failed. Please check your credentials.");
      }

      const data = await res.json();
      dispatch(
        setLogin({
          user: data.user,
        })
      );

      localStorage.setItem("token", data.token);
      navigate("/users");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.body}>
      <div id={styles.container}>
        <header className={styles.header}>Login Your Account</header>
        <form className={styles.form} onSubmit={handleSubmit}>
          <fieldset className={styles.fieldset}>
            <br />
            <br />
            <br />
            <br />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
            <br />
            <br />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
            <br />
            <br />
            <button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default Login;
