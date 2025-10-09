import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "host/authSlice";
import { useNavigate } from "react-router-dom";
import {
  TOAST_DURATION,
  HOME_ROUTE,
  VALIDATION_MESSAGES,
  EMAIL_REGEX,
  PHONE_REGEX,
} from "../Constant/EditProfileConst";
import "./EditProfile.css";

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

  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);

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
    const { name, value } = e.target;

    if (name === "phone") {
      const onlyDigits = value.replace(/\D/g, ""); 
      setFormData({ ...formData, [name]: onlyDigits });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = VALIDATION_MESSAGES.USERNAME_REQUIRED;
    }

    if (!formData.email) {
      newErrors.email = VALIDATION_MESSAGES.EMAIL_REQUIRED;
    } else if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = VALIDATION_MESSAGES.INVALID_EMAIL;
    }

    if (!formData.phone) {
      newErrors.phone = VALIDATION_MESSAGES.PHONE_REQUIRED;
    } else if (!PHONE_REGEX.test(formData.phone)) {
      newErrors.phone = VALIDATION_MESSAGES.INVALID_PHONE;
    }

    if (!formData.address.trim()) {
      newErrors.address = VALIDATION_MESSAGES.ADDRESS_REQUIRED;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    if (!user?.id) {
      setErrors({ general: VALIDATION_MESSAGES.USER_NOT_FOUND });
      return;
    }

    const updatedUser = { ...user, ...formData };
    dispatch(updateUser(updatedUser));

    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate(HOME_ROUTE);
    }, TOAST_DURATION);
  };

  return (
    <div className="edit-profile">
      <h2>Edit Profile</h2>

      {showToast && (
        <div className="toast">
          {VALIDATION_MESSAGES.PROFILE_UPDATED}
        </div>
      )}

      <form className="profile-form" onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && <p className="error">{errors.username}</p>}
        </label>

        <label>
          Email:
          <input type="email" name="email" value={formData.email} readOnly />
          {errors.email && <p className="error">{errors.email}</p>}
        </label>

        <label>
          Phone:
          <input
            type="text"
            name="phone"
            maxLength="10"
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && <p className="error">{errors.phone}</p>}
        </label>

        <label>
          Address:
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
          {errors.address && <p className="error">{errors.address}</p>}
        </label>

        <button type="submit" className="btn-save">
          Update Profile
        </button>
      </form>
    </div>
  );
}
