import React, { useEffect, useState } from "react";
import {useLocation, useNavigate, Link} from "react-router-dom"
import { updateReservationFinished, updateReservationSeated, deleteTableAssignment, listReservations, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { today, previous, next } from "../utils/date-time";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard() {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([])

  let navigate = useNavigate()
  let location = useLocation()

  const query = new URLSearchParams(location.search);

  let date = query.get("date");
  if (!date) {
    date = today();
  }

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listTables(abortController.signal)
      .then(setTables)
      .catch(error => {
        if (error.name === 'AbortError') {
          console.log('Fetch request for tables cancelled');
        } else {
          throw error;
        }
      });
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(error => {
        if (error.name === 'AbortError') {
          console.log('Fetch request for reservations cancelled');
        } else {
          throw error;
        }
      });
    return () => abortController.abort();
  }
  

  const handleFinish = async (event) => {
    console.log("handleSubmit")
    event.preventDefault()
    const confirm = window.confirm("Is this table ready to seat new guests? This cannot be undone.")

    if (confirm){
      const selectedTableId = event.target.value;
      const selectedTable = tables.find(table => table.table_id === Number(selectedTableId))
      const finishedReservation = reservations.find(reservation => reservation.reservation_id === Number(selectedTable.reservation_id))
        console.log("finishedRes", finishedReservation, selectedTable, selectedTableId)

      try {
          await deleteTableAssignment(selectedTable)
          await updateReservationFinished(finishedReservation)
          navigate(0)
      } catch (error){
          setReservationsError(error)
      }
    }
  }

  const validReservations = reservations.filter((reservation) =>
      reservation.reservation_date === date && reservation.status !== "Finished"
  );

  const reservationItems = validReservations.map((reservation, index) => (
    <li key={index} style={{ listStyleType: "none" }}>
        <div className="card">
            <div className="card-body">
                <div className="card-header"><h5 className="card-title">Reservation {reservation.reservation_id}</h5></div>
                <p className="card-text"><b>Name:</b> {reservation.first_name} {reservation.last_name}</p>
                <p className="card-text"><b>Mobile Number:</b> {reservation.mobile_number}</p>
                <p className="card-text"><b>Reservation Time:</b> {reservation.reservation_time}</p>
                <p className="card-text"><b>Number of People:</b> {reservation.people}</p>
                <p data-reservation-id-status={reservation.reservation_id}>
                  <b>Status:</b> {reservation.status}  {reservation.status === "Booked" ? 
                    <Link to={`/reservations/${reservation.reservation_id}/seat`} className="btn btn-primary" >Seat</Link>
                  : null}
                </p>
                <button className="btn btn-secondary">Edit</button>
                <button className="btn btn-danger">Delete</button>
            </div>
        </div>
    </li>
  ));

  const tableItems = tables.map((table, index) => (
    <li key={index} style={{ listStyleType: "none" }} >
      <div className="card row" >
        <div className="card-body">
          <div className="card-header"><h5 className="card-title">{table.table_name}</h5></div>
          <p className="card-text"><b>Table Capacity:</b> {table.capacity}</p>
          <p data-table-id-status={table.table_id}>
            <b>Status: {table.reservation_id ? 
              <><span style={{color: "red"}}>Occupied</span>: Reservation {table.reservation_id} 
              <button className="btn btn-info" value={table.table_id} onClick={handleFinish}>Finish</button></> 
                : <span style={{color: "green"}}>Free</span>}
            </b>
          </p>
        </div>
      </div>
    </li>
  ));
  

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {date}</h4>
      </div>      
      <button onClick={() => navigate(`/dashboard?date=${previous(date)}`)}>Previous</button>
      <button onClick={() => navigate(`/dashboard?date=${today()}`)}>Today</button>
      <button onClick={() => navigate(`/dashboard?date=${next(date)}`)}>Next</button>
      <ErrorAlert error={reservationsError} />
      <br/>
      <div>
      <h3>Today's Reservations</h3>
        <ul>{reservationItems}</ul>
      </div>
      <div>
        <h3>Tables</h3>
        <ul>{tableItems}</ul>
      </div>
    </main>
  );
}

export default Dashboard;
