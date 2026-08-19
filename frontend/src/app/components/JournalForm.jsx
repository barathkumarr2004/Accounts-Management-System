"use client";

import { useEffect, useState } from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  fetchLedgers,
} from "../store/slices/ledgerSlice";

import {
  createJournal,
  clearJournalError,
} from "../store/slices/journalSlice";


export default function JournalForm() {

  const dispatch = useDispatch();


  /*
  |--------------------------------------------------------------------------
  | Redux
  |--------------------------------------------------------------------------
  */

  const {
    ledgers,
  } = useSelector(
    (state) => state.ledgers
  );


  const {
    loading,
    error,
    success,
  } = useSelector(
    (state) => state.journals
  );


  /*
  |--------------------------------------------------------------------------
  | Form
  |--------------------------------------------------------------------------
  */

  const [formData, setFormData] = useState({

    voucher_no: "",

    voucher_date: new Date()
      .toISOString()
      .split("T")[0],

    narration: "",

    lines: [
      {
        account_id: "",
        debit: "",
        credit: "",
        description: "",
      },
      {
        account_id: "",
        debit: "",
        credit: "",
        description: "",
      },
    ],

  });


  /*
  |--------------------------------------------------------------------------
  | Load Ledgers
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (ledgers.length === 0) {

      dispatch(fetchLedgers());

    }

  }, [dispatch, ledgers.length]);


  /*
  |--------------------------------------------------------------------------
  | Header Change
  |--------------------------------------------------------------------------
  */

  const handleHeaderChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));


    if (error) {
      dispatch(clearJournalError());
    }

  };


  /*
  |--------------------------------------------------------------------------
  | Line Change
  |--------------------------------------------------------------------------
  */

  const handleLineChange = (
    index,
    field,
    value
  ) => {

    const updatedLines =
      [...formData.lines];


    updatedLines[index] = {
      ...updatedLines[index],
      [field]: value,
    };


    // If debit entered, clear credit
    if (
      field === "debit" &&
      Number(value) > 0
    ) {

      updatedLines[index].credit = "";

    }


    // If credit entered, clear debit
    if (
      field === "credit" &&
      Number(value) > 0
    ) {

      updatedLines[index].debit = "";

    }


    setFormData((prev) => ({
      ...prev,
      lines: updatedLines,
    }));


    if (error) {
      dispatch(clearJournalError());
    }

  };


  /*
  |--------------------------------------------------------------------------
  | Add Line
  |--------------------------------------------------------------------------
  */

  const addLine = () => {

    setFormData((prev) => ({

      ...prev,

      lines: [
        ...prev.lines,

        {
          account_id: "",
          debit: "",
          credit: "",
          description: "",
        },

      ],

    }));

  };


  /*
  |--------------------------------------------------------------------------
  | Remove Line
  |--------------------------------------------------------------------------
  */

  const removeLine = (index) => {

    if (formData.lines.length <= 2) {
      return;
    }


    setFormData((prev) => ({

      ...prev,

      lines: prev.lines.filter(
        (_, i) => i !== index
      ),

    }));

  };


  /*
  |--------------------------------------------------------------------------
  | Totals
  |--------------------------------------------------------------------------
  */

  const totalDebit =
    formData.lines.reduce(
      (total, line) =>
        total + Number(line.debit || 0),
      0
    );


  const totalCredit =
    formData.lines.reduce(
      (total, line) =>
        total + Number(line.credit || 0),
      0
    );


  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (e) => {

    e.preventDefault();

    dispatch(clearJournalError());


    if (
      totalDebit <= 0 ||
      totalDebit !== totalCredit
    ) {

      return;

    }


    try {

      await dispatch(
        createJournal(formData)
      ).unwrap();


      setFormData({

        voucher_no: "",

        voucher_date:
          new Date()
            .toISOString()
            .split("T")[0],

        narration: "",

        lines: [
          {
            account_id: "",
            debit: "",
            credit: "",
            description: "",
          },
          {
            account_id: "",
            debit: "",
            credit: "",
            description: "",
          },
        ],

      });

    } catch (error) {

      console.error(
        "Create journal error:",
        error
      );

    }

  };


  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (

    <div className="card shadow-sm">

      <div className="card-header bg-white">

        <h5 className="mb-0">
          Journal Voucher
        </h5>

      </div>


      <div className="card-body">


        {/* SUCCESS */}

        {success && (

          <div className="alert alert-success">

            ✓ Journal voucher created
            successfully

          </div>

        )}


        {/* ERROR */}

        {error && (

          <div className="alert alert-danger">

            ❌ {error}

          </div>

        )}


        <form onSubmit={handleSubmit}>


          {/* Voucher details */}

          <div className="row">


            <div className="col-md-4 mb-3">

              <label className="form-label">
                Voucher No
              </label>

              <input
                type="text"
                name="voucher_no"
                className="form-control"
                placeholder="JV001"
                value={formData.voucher_no}
                onChange={handleHeaderChange}
                required
              />

            </div>


            <div className="col-md-4 mb-3">

              <label className="form-label">
                Voucher Date
              </label>

              <input
                type="date"
                name="voucher_date"
                className="form-control"
                value={formData.voucher_date}
                onChange={handleHeaderChange}
                required
              />

            </div>


            <div className="col-md-4 mb-3">

              <label className="form-label">
                Narration
              </label>

              <input
                type="text"
                name="narration"
                className="form-control"
                placeholder="Enter narration"
                value={formData.narration}
                onChange={handleHeaderChange}
              />

            </div>

          </div>


          <hr />


          {/* Lines */}

          <div className="table-responsive">

            <table className="table table-bordered">

              <thead className="table-light">

                <tr>

                  <th style={{ width: "25%" }}>
                    Ledger
                  </th>

                  <th style={{ width: "20%" }}>
                    Description
                  </th>

                  <th style={{ width: "15%" }}>
                    Debit
                  </th>

                  <th style={{ width: "15%" }}>
                    Credit
                  </th>

                  <th style={{ width: "10%" }}>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {formData.lines.map(
                  (line, index) => (

                    <tr key={index}>


                      {/* Ledger */}

                      <td>

                        <select
                          className="form-select"
                          value={
                            line.account_id
                          }
                          onChange={(e) =>
                            handleLineChange(
                              index,
                              "account_id",
                              e.target.value
                            )
                          }
                          required
                        >

                          <option value="">
                            Select Ledger
                          </option>


                          {ledgers.map(
                            (ledger) => (

                              <option
                                key={ledger.id}
                                value={ledger.id}
                              >
                                {ledger.name}
                              </option>

                            )
                          )}

                        </select>

                      </td>


                      {/* Description */}

                      <td>

                        <input
                          type="text"
                          className="form-control"
                          value={
                            line.description
                          }
                          onChange={(e) =>
                            handleLineChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                        />

                      </td>


                      {/* Debit */}

                      <td>

                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          value={
                            line.debit
                          }
                          onChange={(e) =>
                            handleLineChange(
                              index,
                              "debit",
                              e.target.value
                            )
                          }
                        />

                      </td>


                      {/* Credit */}

                      <td>

                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          value={
                            line.credit
                          }
                          onChange={(e) =>
                            handleLineChange(
                              index,
                              "credit",
                              e.target.value
                            )
                          }
                        />

                      </td>


                      {/* Remove */}

                      <td>

                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            removeLine(index)
                          }
                          disabled={
                            formData.lines.length <= 2
                          }
                        >
                          Remove
                        </button>

                      </td>


                    </tr>

                  )
                )}

              </tbody>


              <tfoot>

                <tr>

                  <th
                    colSpan="2"
                    className="text-end"
                  >
                    Total
                  </th>


                  <th>
                    {totalDebit.toFixed(2)}
                  </th>


                  <th>
                    {totalCredit.toFixed(2)}
                  </th>


                  <th></th>

                </tr>

              </tfoot>

            </table>

          </div>


          {/* Add line */}

          <button
            type="button"
            className="btn btn-secondary mb-3"
            onClick={addLine}
          >
            + Add Line
          </button>


          {/* Balance */}

          <div className="mb-3">

            {totalDebit === totalCredit &&
            totalDebit > 0 ? (

              <div className="alert alert-success">
                ✓ Journal is balanced
              </div>

            ) : (

              <div className="alert alert-warning">
                Debit and Credit must be equal
              </div>

            )}

          </div>


          {/* Buttons */}

          <div className="d-flex justify-content-end gap-2">

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                setFormData({
                  voucher_no: "",
                  voucher_date:
                    new Date()
                      .toISOString()
                      .split("T")[0],
                  narration: "",
                  lines: [
                    {
                      account_id: "",
                      debit: "",
                      credit: "",
                      description: "",
                    },
                    {
                      account_id: "",
                      debit: "",
                      credit: "",
                      description: "",
                    },
                  ],
                })
              }
            >
              Cancel
            </button>


            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                loading ||
                totalDebit <= 0 ||
                totalDebit !== totalCredit
              }
            >

              {loading
                ? "Saving..."
                : "Save Journal"}

            </button>

          </div>


        </form>

      </div>

    </div>

  );

}