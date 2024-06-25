import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./register.module.css";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Student",
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
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      console.log(res.msg);
      if (res.status == 400) {
        throw new Error("email already exist");
      }

      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
   
    <div className={styles.body}>
      <div id={styles.container}>
        <header className={styles.header}>Register new account</header>
        <form className={styles.form} onSubmit={handleSubmit}>
          <fieldset className={styles.fieldset}>
            <br />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              className={styles.input}
              required
            />
            <br />
            <br />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className={styles.input}
              required
            />
            <br />
            <br />
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone"
              className={styles.input}
              required
            />
            <br />
            <br />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Institute">Institute</option>
            </select>
            <br />
            <br />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className={styles.input}
              required
            />
            <br />
            <br />
            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? "Loading..." : "Register"}
            </button>
            {error && <p className={styles.error}>{error}</p>}
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default Register;
