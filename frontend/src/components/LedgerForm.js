"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {fetchGroups,} from "../store/slices/groupSlice";
import { createLedger, clearLedgerError,} from "../store/slices/ledgerSlice";

export default function LedgerForm() {

  const dispatch = useDispatch();

  // Groups from Redux
  const { groups,} = useSelector((state) => state.groups);

  // Ledger state
  const { loading, error,} = useSelector((state) => state.ledgers);

  const [formData, setFormData] = useState({name: "", group_id: "", });

  const [groupSearch, setGroupSearch] = useState("");

  const [showGroups, setShowGroups] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

//load groups
  useEffect(() => {
  dispatch(fetchGroups());
}, [dispatch]);


//filter gorups
  const filteredGroups = groups.filter((group) => {
  const search = groupSearch.toLowerCase();
  const groupName = group.name?.toLowerCase() || "";
  const parentName = group.parent_name?.toLowerCase() || "";
  return ( groupName.includes(search) || parentName.includes(search));
});

//select group
  const handleGroupSelect = (group) => {
    setFormData((prev) => ({...prev, group_id: group.id,}));
    setGroupSearch(group.name);
    setShowGroups(false);

    // Clear old error
    if (error) {
      dispatch(clearLedgerError());
    }
  };

//input change
  const handleChange = (e) => {
    const { name, value,  } = e.target;
    setFormData((prev) => ({...prev, [name]: value, }));

    if (error) {
      dispatch(clearLedgerError());
    }
  };

  //submit
  const handleSubmit = async (e) => {
  e.preventDefault();

  setSuccessMessage("");
  dispatch(clearLedgerError());

  if (!formData.group_id) {
    dispatch({
      type: "ledgers/setLedgerError",
      payload: "Please select a group",
    });
    return;
  }

  try {
    await dispatch(createLedger(formData)).unwrap();

    // Success message
    setSuccessMessage("Ledger created successfully");

    // Clear form
    setFormData({ name: "", group_id: "",});
    setGroupSearch("");
    setShowGroups(false);

    // Hide success after 3 seconds
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

  } catch (error) {
    console.error("Create ledger error:", error);
  }
};

//cancel
  const handleCancel = () => {
    setFormData({ name: "", group_id: "",});
   setGroupSearch("");
    setShowGroups(false);
    setSuccessMessage("");
    dispatch(clearLedgerError());
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white">
        <h5 className="mb-0"> Create Ledger </h5>
     </div>

      <div className="card-body">
        {/* SUCCESS */}
        {successMessage && (<div className="alert alert-success"role="alert" >
            {successMessage}
          </div>
        )}
        
        {/* ERROR */}
        {error && (<div className="alert alert-danger" role="alert" >
             {error}
          </div>
       )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Ledger Name
            </label>

            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              placeholder="Enter ledger name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3 position-relative">
            <label htmlFor="groupSearch" className="form-label">
              Under
            </label>
            {/* SEARCH INPUT */}
            <input
              type="text"
              id="groupSearch"
              className="form-control"
              placeholder="Search group..."
              value={groupSearch}
              onChange={(e) => {
                setGroupSearch(e.target.value);
                setShowGroups(true);
                // Clear selected group if user changes search
                setFormData((prev) => ({...prev, group_id: "", }));
              }}
              onFocus={() => {setShowGroups(true);}}
              autoComplete="off"
              required
            />
           
            {/* SELECTED GROUP */}
            {formData.group_id && (<div className="form-text">
                Selected group ID: {formData.group_id}
              </div>
            )}
            {/* GROUP DROPDOWN */}
            {showGroups && (
              <div className="position-absolute bg-white border rounded shadow-sm w-100"
                style={{ zIndex: 1000,maxHeight: "250px", overflowY: "auto",    }}>
              {filteredGroups.length > 0 ? (
                 filteredGroups.map((group) => (
  <button
    type="button"
    key={group.id}
    className="dropdown-item px-3 py-2"
    onMouseDown={(e) => {
      e.preventDefault();
      handleGroupSelect(group);
    }}
  >
    <div className="fw-semibold">
      {group.name}
    </div>

    <small className="text-muted">
      Under: {group.parent_name || "Primary"}
    </small>
  </button>
                  ))

                ) : (

                  <div className="px-3 py-2 text-muted">
                    No groups found
                  </div>

                )}

              </div>

            )}

          </div>

          {/* BUTTONS */}

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

              {loading
                ? "Saving..."
                : "Save"}

            </button>

          </div>


        </form>

      </div>

    </div>
  );
}