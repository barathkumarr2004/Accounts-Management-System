"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGroups } from "../../store/slices/groupSlice";
import { createLedger, clearLedgerError } from "../../store/slices/ledgerSlice";

export default function Ledgers() {
  const dispatch = useDispatch();

  const { groups } = useSelector((state) => state.groups);
  const { loading, error } = useSelector((state) => state.ledgers);

  const [formData, setFormData] = useState({ name: "", group_id: "" });
  const [groupSearch, setGroupSearch] = useState("");
  const [showGroups, setShowGroups] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  const filteredGroups = groups.filter((group) => {
    const search = groupSearch.toLowerCase();
    const groupName = group.name?.toLowerCase() || "";
    const parentName = group.parent_name?.toLowerCase() || "";

    return (
      groupName.includes(search) ||
      parentName.includes(search)
    );
  });

  const handleGroupSelect = (group) => {
    setFormData((prev) => ({
      ...prev,
      group_id: group.id,
    }));

    setGroupSearch(group.name);
    setShowGroups(false);

    if (error) {
      dispatch(clearLedgerError());
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      dispatch(clearLedgerError());
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

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

      setSuccessMessage("Ledger created successfully.");

      setFormData({
        name: "",
        group_id: "",
      });

      setGroupSearch("");
      setShowGroups(false);

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Create ledger error:", err);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      group_id: "",
    });

    setGroupSearch("");
    setShowGroups(false);
    setSuccessMessage("");

    dispatch(clearLedgerError());
  };

  return (
    <>
      <div className="ledger-page">
        <div className="ledger-container">

          <div className="page-header">
            <div className="header-title">
              <div className="header-icon">LA</div>

              <div>
                <h1>Ledger Accounts</h1>
                <p>Create and manage your accounting ledger accounts</p>
              </div>
            </div>

            <div className="header-badge">
              ACCOUNTING MASTER
            </div>
          </div>

          <div className="info-bar">
            <div className="info-icon">+</div>

            <div>
              <h2>Create New Ledger</h2>
              <p>
                Create a ledger account and assign it to the appropriate group.
              </p>
            </div>
          </div>

          {successMessage && (
            <div className="message success-message">
              <span className="message-icon">✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="message error-message">
              <span className="message-icon">!</span>
              <span>{error}</span>
            </div>
          )}

          <div className="form-card">

            <div className="card-header">
              <div>
                <h2>Ledger Details</h2>
                <p>Enter ledger information below</p>
              </div>

              <span className="required-text">
                * Required
              </span>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                <div className="form-group">
                  <label htmlFor="name">
                    Ledger Name
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter ledger name"
                    autoComplete="off"
                    required
                  />

                  <small>
                    Enter the name of the ledger account.
                  </small>
                </div>

                <div className="form-group group-field">
                  <label htmlFor="groupSearch">
                    Under
                    <span>*</span>
                  </label>

                  <div className="search-wrapper">

                    <input
                      type="text"
                      id="groupSearch"
                      value={groupSearch}
                      onChange={(e) => {
                        setGroupSearch(e.target.value);
                        setShowGroups(true);

                        setFormData((prev) => ({
                          ...prev,
                          group_id: "",
                        }));
                      }}
                      onFocus={() => setShowGroups(true)}
                      placeholder="Search group..."
                      autoComplete="off"
                      required
                    />

                    {showGroups && (
                      <div className="group-dropdown">

                        {filteredGroups.length > 0 ? (
                          filteredGroups.map((group) => (
                            <button
                              type="button"
                              key={group.id}
                              className="group-option"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleGroupSelect(group);
                              }}
                            >
                              <strong>{group.name}</strong>

                              <small>
                                Under: {group.parent_name || "Primary"}
                              </small>
                            </button>
                          ))
                        ) : (
                          <div className="no-groups">
                            No groups found
                          </div>
                        )}

                      </div>
                    )}

                  </div>

                  <small>
                    Select the parent group for this ledger.
                  </small>
                </div>

              </div>

              <div className="selected-card">

                <div className="selected-header">
                  SELECTED GROUP
                </div>

                <div className="selected-content">

                  <div>
                    <span>Ledger Name</span>
                    <strong>
                      {formData.name || "Not entered"}
                    </strong>
                  </div>

                  <div>
                    <span>Parent Group</span>
                    <strong>
                      {formData.group_id
                        ? groups.find(
                            (group) =>
                              String(group.id) ===
                              String(formData.group_id)
                          )?.name || "Selected Group"
                        : "Not selected"}
                    </strong>
                  </div>

                </div>
              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      Save Ledger
                    </>
                  )}
                </button>

              </div>

            </form>
          </div>

        </div>
      </div>

      <style>{`

        * { box-sizing:border-box; }

        body { margin:0; background:#07111f; }

        .ledger-page { min-height:100vh; padding:24px; background:radial-gradient(circle at 85% 0%,#152c55 0,transparent 30%),#07111f; color:#e8f1f7; font-family:Arial,Helvetica,sans-serif; }

        .ledger-container { width:100%; max-width:1250px; margin:0 auto; }

        .page-header { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:22px 24px; margin-bottom:15px; border:1px solid #2a6fa0; border-radius:10px; background:linear-gradient(110deg,#0d1e35,#193a78); box-shadow:0 10px 30px rgba(0,0,0,.25); }

        .header-title { display:flex; align-items:center; gap:13px; }

        .header-icon { width:45px; height:45px; display:flex; align-items:center; justify-content:center; border:1px solid #2c789d; border-radius:7px; background:#102e46; color:#62c9ed; font-family:Consolas,monospace; font-size:11px; font-weight:900; }

        .page-header h1 { margin:0; color:#fff; font-size:25px; font-weight:800; }

        .page-header p { margin:5px 0 0; color:#a8c9dd; font-size:10px; }

        .header-badge { padding:7px 10px; border:1px solid #2c6d8a; border-radius:5px; background:#0d2b3b; color:#63c8eb; font-size:7px; font-weight:800; letter-spacing:.8px; }

        .info-bar { display:flex; align-items:center; gap:13px; padding:15px 18px; margin-bottom:15px; border:1px solid #1d405a; border-left:3px solid #27a5d2; border-radius:8px; background:#0b1b2d; }

        .info-icon { width:34px; height:34px; display:flex; align-items:center; justify-content:center; border-radius:6px; background:#12334a; color:#63c9ed; font-size:18px; font-weight:700; }

        .info-bar h2 { margin:0; color:#e9f2f7; font-size:13px; font-weight:800; }

        .info-bar p { margin:4px 0 0; color:#637e90; font-size:9px; }

        .message { display:flex; align-items:center; gap:10px; padding:12px 15px; margin-bottom:15px; border-radius:7px; font-size:10px; font-weight:700; }

        .success-message { border:1px solid #236a55; background:#0d2d25; color:#5ee0ad; }

        .error-message { border:1px solid #753c45; background:#321c22; color:#ff8f8f; }

        .message-icon { width:22px; height:22px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:rgba(255,255,255,.08); font-weight:900; }

        .form-card { overflow:visible; border:1px solid #1c405b; border-radius:9px; background:#0b1b2d; box-shadow:0 10px 28px rgba(0,0,0,.2); }

        .card-header { display:flex; align-items:center; justify-content:space-between; padding:18px 20px; border-bottom:1px solid #19354b; border-radius:9px 9px 0 0; background:#0d2135; }

        .card-header h2 { margin:0; color:#edf5f9; font-size:16px; font-weight:800; }

        .card-header p { margin:5px 0 0; color:#607a8c; font-size:9px; }

        .required-text { color:#6a8595; font-size:8px; }

        form { padding:20px; }

        .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; }

        .form-group { display:flex; flex-direction:column; }

        .form-group label { margin-bottom:8px; color:#9bb7c7; font-size:10px; font-weight:700; }

        .form-group label span { margin-left:3px; color:#ff7777; }

        .form-group input { width:100%; height:45px; padding:0 13px; outline:none; border:1px solid #29465d; border-radius:6px; background:#071326; color:#eaf2f7; font-family:Arial,Helvetica,sans-serif; font-size:11px; transition:.2s; }

        .form-group input::placeholder { color:#50697a; }

        .form-group input:focus { border-color:#2c9bc8; box-shadow:0 0 0 2px rgba(44,155,200,.1); }

        .form-group small { margin-top:6px; color:#526c7d; font-size:8px; }

        .group-field { position:relative; }

        .search-wrapper { position:relative; }

        .group-dropdown { position:absolute; top:49px; left:0; z-index:1000; width:100%; max-height:250px; overflow-y:auto; border:1px solid #29506a; border-radius:6px; background:#0a1929; box-shadow:0 12px 30px rgba(0,0,0,.45); }

        .group-option { display:flex; flex-direction:column; width:100%; padding:11px 13px; border:0; border-bottom:1px solid #183448; background:transparent; color:#dceaf0; text-align:left; cursor:pointer; }

        .group-option:hover { background:#12304a; }

        .group-option strong { color:#e8f4f8; font-size:10px; font-weight:700; }

        .group-option small { margin-top:4px; color:#58788a; font-size:8px; }

        .no-groups { padding:13px; color:#607b8b; font-size:9px; }

        .selected-card { margin-top:20px; padding:14px 16px; border:1px solid #1b3a52; border-radius:7px; background:#081728; }

        .selected-header { margin-bottom:12px; color:#537488; font-size:7px; font-weight:900; letter-spacing:1px; }

        .selected-content { display:grid; grid-template-columns:1fr 1fr; gap:15px; }

        .selected-content > div { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:11px 12px; border:1px solid #19364c; border-radius:5px; background:#0b1d30; }

        .selected-content span { color:#577386; font-size:8px; }

        .selected-content strong { overflow:hidden; color:#dceaf0; font-size:9px; text-overflow:ellipsis; white-space:nowrap; }

        .form-actions { display:flex; justify-content:flex-end; gap:9px; padding-top:20px; margin-top:20px; border-top:1px solid #19354b; }

        .form-actions button { min-width:110px; height:40px; padding:0 16px; border:0; border-radius:6px; font-size:10px; font-weight:800; cursor:pointer; transition:.2s; }

        .form-actions button:disabled { opacity:.55; cursor:not-allowed; }

        .cancel-button { background:#26394c; color:#b5c5ce; }

        .cancel-button:hover:not(:disabled) { background:#324a60; }

        .save-button { display:flex; align-items:center; justify-content:center; gap:7px; background:#19a875; color:#fff; }

        .save-button:hover:not(:disabled) { background:#20bd88; transform:translateY(-1px); }

        .spinner { width:12px; height:12px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }

        @keyframes spin { to { transform:rotate(360deg); } }

        .summary-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:15px; }

        .summary-card { display:flex; align-items:center; gap:12px; padding:14px; border:1px solid #1b3853; border-radius:8px; background:#0b1b2d; }

        .summary-icon { width:38px; height:38px; display:flex; align-items:center; justify-content:center; flex-shrink:0; border-radius:6px; font-family:Consolas,monospace; font-size:8px; font-weight:900; }

        .summary-icon.blue { border:1px solid #285e82; background:#102d48; color:#62c8ed; }

        .summary-icon.cyan { border:1px solid #286c7e; background:#102e39; color:#60d0e8; }

        .summary-icon.purple { border:1px solid #58457b; background:#29213e; color:#c4a5ff; }

        .summary-card span { display:block; margin-bottom:4px; color:#587385; font-size:8px; }

        .summary-card strong { color:#dceaf0; font-family:Consolas,monospace; font-size:13px; }

        @media (max-width:800px) { .ledger-page { padding:15px; } .page-header { align-items:flex-start; flex-direction:column; } .header-badge { align-self:flex-end; margin-top:-45px; } .form-grid { grid-template-columns:1fr; } .selected-content { grid-template-columns:1fr; } .summary-grid { grid-template-columns:1fr; } }

        @media (max-width:500px) { .ledger-page { padding:9px; } .page-header { padding:17px; } .page-header h1 { font-size:21px; } .header-icon { width:40px; height:40px; } .header-badge { display:none; } .info-bar { align-items:flex-start; } form { padding:15px; } .card-header { padding:15px; } .form-actions { flex-direction:column-reverse; } .form-actions button { width:100%; } }

      `}</style>
    </>
  );
}