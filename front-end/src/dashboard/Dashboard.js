import React, { useEffect, useState } from "react";
import {useLocation, useNavigate} from "react-router-dom"
import { listReservations } from "../utils/api";
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
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }


        const reservationItems = reservations.map((reservation, index) => (
          reservation.reservation_date === date ?
          <li key={index}>
              <div className="card">
                  <div className="card-body">
                      <div className="card-header"><h5 className="card-title">Reservation {reservation.reservation_id}</h5></div>
                      <p className="card-text"><b>Name:</b> {reservation.first_name} {reservation.last_name}</p>
                      <p className="card-text"><b>Mobile Number:</b> {reservation.mobile_number}</p>
                      <p className="card-text"><b>Reservation Time:</b> {reservation.reservation_time} --- {reservation.reservation_date}</p>
                      <p className="card-text"><b>Number of People:</b> {reservation.people}</p>
                      <button>Edit</button>
                      <button className="btn btn-danger">Delete</button>
                  </div>
              </div>
          </li>
          : null
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
      {JSON.stringify(reservations)}
      <br/>

      <ul>{reservationItems}</ul>

    </main>
  );
}

export default Dashboard;
