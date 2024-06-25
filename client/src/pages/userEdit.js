import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../components/register.module.css";

const EditUser = () => {
  const { id } = useParams();
  const history = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Student",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(true); // State to track token validity

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/users/${id}`, {
          headers: {
            Authorization: token,
          },
        });
        setForm(res.data); // Make sure res.data matches the structure of form
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401) {
          setIsTokenValid(false); // Token is not valid
          localStorage.removeItem("token"); // Clear invalid token from localStorage
          alert("Your session has expired. Please log in again.");
          history("/login"); // Redirect to login page
        } else {
          setError(err.response?.data?.msg || "Failed to fetch user data");
        }
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, history]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/users/${id}`, form, {
        headers: {
          Authorization: token,
        },
      });

      

      history("/users"); // Navigate to user list page after successful update
    } catch (err) {
      if (err.response?.status === 401) {
        setIsTokenValid(false); // Token is not valid
        localStorage.removeItem("token"); // Clear invalid token from localStorage
        alert("Your session has expired. Please log in again.");
        history("/login"); // Redirect to login page
      } else {
        setError(err.response?.data?.msg || "Failed to update user");
      }
    }
  };

  if (!isTokenValid) {
    return null; // Redirecting to login page
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

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
              required
            />
            <br />
            <br />
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Institute">Institute</option>
            </select>
            <br />
            <br />
            <button type="submit">Update User</button>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
