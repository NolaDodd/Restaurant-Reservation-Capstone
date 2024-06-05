import React, { useEffect, useState } from "react";
import {useLocation, useNavigate, Link} from "react-router-dom"
import { updateReservationFinished, deleteTableAssignment, listReservations, listTables, cancelReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { today, previous, next } from "../utils/date-time";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({rootReservations}) {
  const [allReservations, setAllReservations] = useState([])
  const [reservations, setReservations] = useState([])
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([])

  let navigate = useNavigate()
  let location = useLocation()

  const query = new URLSearchParams(location.search);

  let date = query.get("date");
  if (!date) {
    date = today();
  }

  useEffect(() => {
    const abortController = new AbortController();
  
    async function loadDashboard() {
      try {
        setReservationsError(null);
        setAllReservations(rootReservations);
        const reservations = await listReservations({ date }, abortController.signal);
        
        if (reservations.length === 0) {
          setReservationsError({ message: "No reservations found" });
        } else {
          setReservations(reservations);
        }
      } catch (error) {
        setReservationsError(error);
      }
    }
    loadDashboard();

    return () => abortController.abort();
  }, [date, rootReservations]);
    
  useEffect(() => {
    const abortController = new AbortController();
  
    async function loadTables() {
      try {
        setReservationsError(null);
        const tables = await listTables(abortController.signal);
        setTables(tables);
      } catch (error) {
        setReservationsError(error);
      }
    }
  
    loadTables();
  
    return () => abortController.abort();
  }, []);
  

  const handleFinish = async (event) => {
    event.preventDefault()
    const confirm = window.confirm("Is this table ready to seat new guests? This cannot be undone.")

    if (confirm){
      try {
      console.log("handleSubmit")
      const selectedTableId = event.target.value
      const selectedTable = tables.find(table => table.table_id === Number(selectedTableId))
      const finishedReservation = allReservations.find(reservation => reservation.reservation_id === Number(selectedTable.reservation_id))
      console.log("finishedRes", selectedTableId, selectedTable, finishedReservation )

      await updateReservationFinished(finishedReservation)
      await deleteTableAssignment(selectedTable)
      navigate(0)
      } catch (error){
          setReservationsError(error)
      }
    }
  }

  const handleCancel = async (event) => {

    const confirm = window.confirm("Do you want to cancel this reservation? This cannot be undone.")

    if (confirm){

      const selectedTableId = event.target.value
      const finishedReservation = rootReservations.find(reservation => reservation.reservation_id === Number(selectedTableId))
      
      try {
        await cancelReservation(finishedReservation)
        navigate(0)
      } catch (error){
        setReservationsError(error)
      }
  }

}

  const reservationItems = reservations.map((reservation, index) => (
    <li key={index} style={{ listStyleType: "none" }}>
        <div className="card">
            <div className="card-body">
                <div className="card-header"><h5 className="card-title">Reservation {reservation.reservation_id}</h5></div>
                <p className="card-text"><b>Name:</b> {reservation.first_name} {reservation.last_name}</p>
                <p className="card-text"><b>Mobile Number:</b> {reservation.mobile_number}</p>
                <p className="card-text"><b>Reservation Time:</b> {reservation.reservation_time}</p>
                <p className="card-text"><b>Reservation Date:</b> {reservation.reservation_date}</p>
                <p className="card-text"><b>Number of People:</b> {reservation.people}</p>
                <p data-reservation-id-status={reservation.reservation_id}>
                  <b>Status:</b> {reservation.status}  {reservation.status === "booked" ? <>
                    <Link to={`/reservations/${reservation.reservation_id}/seat`} className="btn btn-primary" >Seat</Link>
                    <Link to={`/reservations/${reservation.reservation_id}/edit`} className="btn btn-secondary" >Edit</Link>
                    </>
                  : null} 

                </p> {reservation.status !== "cancelled" ?
                <button className="btn btn-danger" data-reservation-id-cancel={reservation.reservation_id} 
                  value={reservation.reservation_id} onClick={handleCancel}>Cancel</button> : null}
            </div>
        </div>
    </li>
  ));


  const tableItems = tables.map((table, index) => {
    const matchingReservation = rootReservations.find(reservation => reservation.reservation_id === table.reservation_id);
  
    return (
      <li key={index} style={{ listStyleType: "none" }} >
        <div className="card row" >
          <div className="card-body">
            <div className="card-header"><h5 className="card-title">{table.table_name}</h5></div>
            <p className="card-text"><b>Table Capacity:</b> {table.capacity}</p>
            <p data-table-id-status={table.table_id}>
              <b>Status: {table.reservation_id ? 
                <><span style={{color: "red"}}>Occupied</span>: 
                  Reservation {table.reservation_id} 
                    {matchingReservation ? <>
                      <div>{matchingReservation.first_name} {matchingReservation.last_name}</div>
                      <div>
                      {matchingReservation.reservation_time} {matchingReservation.reservation_date}
                      </div>
                      </>
                      : null}
                <button className="btn btn-info" value={table.table_id} onClick={handleFinish}>Finish</button></> 
                  : <span style={{color: "green"}}>Free</span>}
              </b>
            </p>
          </div>
        </div>
      </li>
    );
  });
  
  

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {date}</h4>
      </div>      
      <button onClick={() => navigate(`/dashboard?date=${previous(date)}`)}>Previous</button>
      <button onClick={() => navigate(`/dashboard?date=${today()}`)}>Today</button>
      <button onClick={() => navigate(`/dashboard?date=${next(date)}`)}>Next</button>
      <br/>
      <div>
      <h3>Today's Reservations</h3>
        <ErrorAlert error={reservationsError} />
        <ul>{reservationItems}</ul>
      </div>
      <div>
        <h3>Tables</h3>
        <ul>{tableItems}</ul>
      </div>
    </main>
  );

}

export default Dashboard
