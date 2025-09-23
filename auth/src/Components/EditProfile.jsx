import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "host/authSlice";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user?.id) {
      alert("User not found!");
      return;
    }

    // ✅ Preserve password, cart, and orders when updating
    const updatedUser = {
      ...user,          // keep everything (password, cart, orders)
      ...formData,      // override with new values from form
    };

    dispatch(updateUser(updatedUser));
    alert("Profile updated successfully!");
    navigate("/");
  };

  return (
    <div className="edit-profile">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            readOnly // ✅ usually you don’t allow email change
          />
        </label>

        <label>
          Phone:
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </label>

        <label>
          Address:
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </label>

        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
}
