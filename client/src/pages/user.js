import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import styles from "./user.module.css";
import { setLogin } from "../state";
const UserList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user);
  // console.log(user.role);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !user || !user.id) {
          alert("User is not authorized. Please log in.");
          navigate("/login");
          return;
        }

        const res = await axios.get("http://localhost:5000/users", {
          headers: {
            Authorization: token,
          },
        });
        setUsers(res.data);

        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401) {
          alert("Your session has expired. Please log in again.");
          navigate("/login");
        } else {
          setError(err.response?.data?.msg || "Failed to fetch users");
          setLoading(false);
        }
      }
    };

    fetchUsers();

    // Initialize socket connection if user and user.id are defined
    if (user && user.id) {
      const newSocket = io("http://localhost:5000");
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Connected to server");
        // Send user id to server
        newSocket.emit("add-user", user.id);
      });

      newSocket.on("online-users", (data) => {
        fetchUsers();
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from server");
      });

      // Clean up the socket connection on unmount
      return () => newSocket.close();
    }
  }, [user, navigate]);

  

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const userToDelete = users.find((u) => u.id === id);

      if (userToDelete && (user.role === "Institute" || user.id === id)) {
        await axios.delete(`http://localhost:5000/users/${id}`, {
          headers: {
            Authorization: token,
          },
        });
        setUsers(users.filter((u) => u.id !== id));
      } else {
        setError("Unauthorized to delete this user");
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to delete user");
    }
  };

  const clearError = () => {
    setError(null);
  };

  const handleEdit = (id) => {
    console.log(`Editing user with id: ${id}`);
    navigate(`/edit-user/${id}`);
  };

  if (!user || !user.id) {
    // Redirect to login page if user data is missing
    return <p>Please log in.</p>;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {error && (
        <div className="error">
          <p>{error}</p>
          <button onClick={clearError}>Close</button>
        </div>
      )}

      <h1 style={{ textAlign: "center" }}>{user.name}</h1>
      <h3 style={{ textAlign: "center", marginTop: "-25px" }}>({user.role})</h3>

      <h2 style={{ textAlign: "center" }}>User List</h2>
      <table
        style={{ textAlign: "center", wordWrap: "normal" }}
        className={styles.table}
      >
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Phone no.</th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
            <th scope="col">Edit \ Delete</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td scope="row">{u.name}</td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td>{u.role}</td>
              <td>{u.status}</td>
              <td>
                {(user.role === "Institute" || user.id === u.id) && (
                  <>
                    <button onClick={() => handleEdit(u.id)}>Edit</button>
                    <br />
                    <button onClick={() => handleDelete(u.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default UserList;
