import React, {useState } from "react";
import {Link, useNavigate} from "react-router-dom"
import { findReservations, cancelReservation } from "../utils/api";
import ErrorAlert from "./ErrorAlert";

function Search({reservations}){
    const initialFormState ={
        mobile_number:"",
    }

    const [formData, setFormData] = useState({...initialFormState})
    const [foundReservations, setFoundReservations] = useState([])
    const [searchError, setSearchError] = useState(null)
    const [noReservations, setNoReservations] = useState(false)
    const [reservationsError, setReservationsError] = useState(null);
    const [tables, setTables] = useState([])
  

    const navigate = useNavigate()

    const handleChange = ({target}) => {
        setFormData({...formData, [target.name]: target.value})
    }

    const handleSubmit = async (event) => {
        console.log("handleSearchSubmit")
        event.preventDefault()
    
        try {
            const fetchReservations = await findReservations({ mobile_number: formData.mobile_number })

            if (fetchReservations.length <= 0){
                setNoReservations(true)
                setFoundReservations(fetchReservations)
                throw new Error("No reservations found")
            } else {
                setNoReservations(false)
                setFoundReservations(fetchReservations)
            }
            setFormData(initialFormState);
        } catch (error){
            setSearchError(new Error(error.message))
        }
    }

    
  const handleCancel = async (event) => {

    const confirm = window.confirm("Do you want to cancel this reservation? This cannot be undone.")

    if (confirm){
      const selectedTableId = event.target.value;
      const selectedTable = tables.find(table => table.table_id === Number(selectedTableId))
      const finishedReservation = reservations.find(reservation => reservation.reservation_id === Number(selectedTable.reservation_id))
        console.log("finishedRes", finishedReservation, selectedTable, selectedTableId)
        
      try {
        await cancelReservation(finishedReservation)
      } catch (error){
        setReservationsError(error)
      }
  }

}
    

    const searchForm = (
        <div>
            <br />
            <form onSubmit={handleSubmit}>
            <label htmlFor="mobile_number">
                    <b>Search Reservation:</b>
                    <br />
                    <input 
                    id="mobile_number" 
                    type="text"
                    name="mobile_number"
                    placeholder="Enter a customer's phone number"
                    onChange={handleChange}
                    value={formData.mobile_number}
                    >
                    </input>
                </label>
                <button type="submit" className="btn btn-primary" onClick={() => navigate(`/search?mobile_number=${formData.mobile_number}`)}>Find</button>
                <br/>
            </form>
            <Link type="submit" className="btn btn-secondary" onClick={"location.reload()"}>Reset</Link>
        </div>
)

let foundReservationItems = foundReservations.sort((a, b) => a.reservation_id - b.reservation_id).map((reservation, index) => (
    <li key={index} style={{ listStyleType: "none" }}>
        <div className="card">
            <div className="card-body">
                <div className="card-header"><h5 className="card-title">Reservation {reservation.reservation_id}</h5></div>
                <p className="card-text"><b>Name:</b> {reservation.first_name} {reservation.last_name}</p>
                <p className="card-text"><b>Mobile Number:</b> {reservation.mobile_number}</p>
                <p className="card-text"><b>Reservation Time:</b> {reservation.reservation_time}</p>
                <p className="card-text"><b>Number of People:</b> {reservation.people}</p>
                <p data-reservation-id-status={reservation.reservation_id}>
                  <b>Status:</b> {reservation.status}  {reservation.status === "booked" ? 
                    <Link to={`/reservations/${reservation.reservation_id}/seat`} className="btn btn-primary">Seat</Link>
                  : null}
                </p>
                <button className="btn btn-secondary">Edit</button>
                <button className="btn btn-danger">Delete</button>
            </div>
        </div>
    </li>
  ));

 let reservationItems = reservations.sort((a, b) => a.reservation_id - b.reservation_id).map((reservation, index) => (
  <li key={index} style={{ listStyleType: "none" }}>
      <div className="card">
          <div className="card-body">
              <div className="card-header"><h5 className="card-title">Reservation {reservation.reservation_id}</h5></div>
              <p className="card-text"><b>Name:</b> {reservation.first_name} {reservation.last_name}</p>
              <p className="card-text"><b>Mobile Number:</b> {reservation.mobile_number}</p>
              <p className="card-text"><b>Reservation Time:</b> {reservation.reservation_time}</p>
              <p className="card-text"><b>Number of People:</b> {reservation.people}</p>
              <p data-reservation-id-status={reservation.reservation_id}>
                <b>Status:</b> {reservation.status}  {reservation.status === "booked" ? 
                  <Link to={`/reservations/${reservation.reservation_id}/seat`} className="btn btn-primary">Seat</Link>
                : null}
              </p>
              <Link to={`/reservations/${reservation.reservation_id}/edit`} className="btn btn-secondary" >Edit</Link>
                <button className="btn btn-danger" data-reservation-id-cancel={reservation.reservation_id} 
                  value={reservation.reservation_id} onClick={() => handleCancel}>Cancel</button>
          </div>
      </div>
  </li>
));

return (
    <>
        <div>
            {searchForm}
            {noReservations === true ? <ErrorAlert error={searchError}/> : null}
        </div>
        <div>
            {foundReservationItems.length > 0 || noReservations === true ? foundReservationItems: reservationItems}
        </div>
    </>
)

}

export default Search