"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {fetchGroups,createGroup,clearGroupError,} from "../store/slices/groupSlice";

export default function GroupForm() {
  const dispatch = useDispatch();

  const {groups,loading, error,} = useSelector((state) => state.groups);

  const [formData, setFormData] = useState({ name: "", parent_id: "",});

  const [successMessage, setSuccessMessage] = useState("");

  // Load existing groups
  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  // Input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value, }));

    // Remove old errors
    if (error) {
      dispatch(clearGroupError());
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setSuccessMessage("");
    dispatch(clearGroupError());

    try {
      await dispatch(createGroup(formData)).unwrap();

      setSuccessMessage("Group created successfully");

      // Clear form
      setFormData({name: "", parent_id: "",});

      // Hide success message 
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    } catch (error) {
      // Redux errors
      console.error("Create group error:", error);
    }
  };

  // Cancel
  const handleCancel = () => {
    setFormData({name: "", parent_id: "",});
    setSuccessMessage("");
    dispatch(clearGroupError());
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white">
        <h5 className="mb-0">Create Group</h5>
      </div>

      <div className="card-body">
        {/* SUCCESS MESSAGE */}
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert" >
            {successMessage}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="alert alert-danger" role="alert"  >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* GROUP NAME */}
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Group Name
            </label>

            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              placeholder="Enter group name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* UNDER */}
          <div className="mb-3">
            <label htmlFor="parent_id" className="form-label">
              Under
            </label>

            <select
              id="parent_id"
              name="parent_id"
              className="form-select"
              value={formData.parent_id}
              onChange={handleChange}
            >
              <option value="">
                Primary
              </option>

              {groups.map((group) => (
                <option
                  key={group.id}
                  value={group.id}
                >
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}