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
  
    const loadData = async () => {
      try {
        setReservationsError(null);
  
        const [reservationsData, tablesData] = await Promise.all([
          listReservations({ date }, abortController.signal),
          listTables(abortController.signal)
        ]);
        
        setReservations(reservationsData);
        setTables(tablesData);
  
      } catch (error) {
        setReservationsError(error);
      }
    };
  
    loadData();
  
    return () => abortController.abort();
  }, [rootReservations, date]);

  const handleFinish = async (event) => {
    event.preventDefault()
    const confirm = window.confirm("Is this table ready to seat new guests? This cannot be undone.")

    if (confirm){
      try {
      console.log("handleSubmit")
      const selectedTableId = event.target.value
      const selectedTable = tables.find(table => table.table_id === Number(selectedTableId))
      const finishedReservation = reservations.find(reservation => reservation.reservation_id === Number(selectedTable.reservation_id))

      await updateReservationFinished(finishedReservation)
      await deleteTableAssignment(selectedTable)
      navigate(0)
      } catch (error){
          setReservationsError(error)
      }
    }
  }

  const handleCancel = async (event) => {
    event.preventDefault()

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
    reservation.reservation_date === date ?
    <li key={index} className="box-container" style={{ listStyle : "none"}}>
        <div className="card reservation">
            <div className="card-body reservationtext">
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
                </p> 
                {reservation.status === "booked" ?
                <button className="btn btn-danger" data-reservation-id-cancel={reservation.reservation_id} 
                  value={reservation.reservation_id} onClick={handleCancel}>Cancel</button> : null}
            </div>
        </div>
    </li>
    : null
  ));


  const tableItems = tables.map((table, index) => {
    return (
      <li key={index} className="box-container" style={{ listStyle : "none"}}>
        <div className="card row table" >
          <div className="card-body tabletext">
            <div className="card-header"><h5 className="card-title">{table.table_name}</h5></div>
            <p className="card-text"><b>Table Capacity:</b> {table.capacity}</p>
            <div data-table-id-status={table.table_id}>
              <b>Status: {table.reservation_id ? 
                <><span style={{color: "#dc1d1d"}}>Occupied:  Reservation {table.reservation_id}</span>
                <button className="btn btn-info" value={table.table_id} onClick={handleFinish}>Finish</button></> 
                  : <span style={{color: "#03b203" }}>Free</span>}
              </b>
            </div>
          </div>
        </div>
      </li>
    );
  });


  return (
    <main>
      <h1 className="dashboard">Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {date}</h4>
      </div>      
      <button className="btn btn-secondary button-margin" onClick={() => navigate(`/dashboard?date=${previous(date)}`)}>Previous</button>
      <button className="btn btn-secondary button-margin" onClick={() => navigate(`/dashboard?date=${today()}`)}>Today</button>
      <button className="btn btn-secondary button-margin" onClick={() => navigate(`/dashboard?date=${next(date)}`)}>Next</button>
      <br/>
      <div>
        <h3 className="title">Today's Reservations</h3>
        <ErrorAlert error={reservationsError} />
        <div className="row">
          {reservationItems.map((item, index) => (
            <div key={index} className="grid-item">{item}</div>
          ))}
        </div>
      </div>
      <h3 className="title">Tables</h3>
      <div className="row">
        {tableItems.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>
    </main>
  ); 
 
}

export default Dashboard
