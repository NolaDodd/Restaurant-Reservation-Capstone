import React, { useEffect, useState } from "react";
import {useNavigate, useParams} from "react-router-dom"
import { updateReservationSeated, loadReservation, listTables, updateTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function AssignTable() {
  const [reservation, setReservation] = useState([])
  const [reservationsError, setReservationsError] = useState(null);
  
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  console.log(selectedTable)

  let navigate = useNavigate()
  const { reservationId } = useParams();

  useEffect(() => {
    loadReservation(reservationId, null)
      .then((result) => setReservation(result))
      .catch(error => {
        console.error(`Error loading reservation: ${error}`);
      });
  }, [reservationId]);

useEffect(() => {
    function loadDashboard(){
        const abortController = new AbortController()
        setReservationsError(null)
        listTables(abortController.signal)
            .then((tables) => {
                setTables(tables)
                if (tables.length > 0){
                    setSelectedTable(tables[0])
                }
            })
        return () => abortController.abort()
    }
    loadDashboard()
}, [])

  const handleUpdateSubmit = async (event) => {
    console.log("handleSubmit")
    event.preventDefault()

    try {
        await updateTable(selectedTable, reservation)
        await updateReservationSeated(reservation)
        
        navigate(`/dashboard`)
    } catch (error){
        setReservationsError(error)
    }
}  

const handleChange = (event) => {
    const selectedTableId = event.target.value;
    const selectedTable = tables.find(table => table.table_id === Number(selectedTableId));
    setSelectedTable(selectedTable)
}

  const reservationCard =
  reservation ?
    <div>
    <li style={{ listStyleType: "none" }}>
        <div className="card">
            <div className="card-body">
                <div className="card-header"><h5 className="card-title">Reservation {reservation.reservation_id}</h5></div>
                <p className="card-text"><b>Name:</b> {reservation.first_name} {reservation.last_name}</p>
                <p className="card-text"><b>Mobile Number:</b> {reservation.mobile_number}</p>
                <p className="card-text"><b>Reservation Time:</b> {reservation.reservation_time}</p>
                <p className="card-text"><b>Number of People:</b> {reservation.people}</p>
            </div>
        </div>
    </li>
    </div> : null

  const tableItems = tables.map((table, index) => (
    <li key={index} style={{ listStyleType: "none" }}>
      <div className="card row" >
        <div className="card-body">
          <div className="card-header"><h5 className="card-title">{table.table_name}</h5></div>
          <p className="card-text"><b>Table Capacity:</b> {table.capacity}</p>
          <p data-table-id-status={table.table_id}>
            <b>Status:</b> {table.reservation_id ? 
            <><span style={{color: "red"}}>Occupied</span>: Reservation {table.reservation_id}</> 
            : <span style={{color: "green"}}>Free</span>}
          </p>
        </div>
      </div>
    </li>
  ));
  



  const tableOptions = 
    <div>
    <label for="table_id" ><span style={{fontSize: "20px", fontWeight: "bold"}}>Table Number:</span></label>
    <select name="table_id" onChange={handleChange}>
        {tables.map((table, index) => (
        <option key={index} value={table.table_id}>{table.table_name} - {table.capacity}</option>
        ))}
    </select>
    <button onClick={handleUpdateSubmit} className="btn btn-primary">Assign Table</button >
    </div>

  return (
    <main>
    <br />
    <div>
        <h2>Assign Reservation {reservation.reservation_id} to Table</h2>        
        <button onClick={() => navigate(-1)} className= "btn btn-secondary">Cancel</button>
    </div>
    <br />
    <div>
        {reservationCard}
    </div>
    <br />
        {tableOptions}
        <ErrorAlert error={reservationsError} />
    <br />
        <div className="col-6">
        <ul>{tableItems}</ul>
        </div>
    </main>
  );
}

export default AssignTable;
