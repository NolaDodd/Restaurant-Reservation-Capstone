import React, {useState} from "react";
import {Link, useNavigate} from "react-router-dom"
import { findReservations, cancelReservation } from "../utils/api";
import ErrorAlert from "./ErrorAlert";

function Search({rootReservations}){
    const initialFormState ={
        mobile_number:"",
    }

    const [formData, setFormData] = useState({...initialFormState})
    const [foundReservations, setFoundReservations] = useState([])
    const [searchError, setSearchError] = useState(null)
    const [noReservations, setNoReservations] = useState(false)

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
    event.preventDefault()

    const confirm = window.confirm("Do you want to cancel this reservation? This cannot be undone.")

    if (confirm){

      const selectedTableId = event.target.value
      const finishedReservation = rootReservations.find(reservation => reservation.reservation_id === Number(selectedTableId))

      try {
        await cancelReservation(finishedReservation)
        navigate(0)
      } catch (error){
        setSearchError(error)
      }
  }
}
    
    const searchForm = (
        <div>
            <form onSubmit={handleSubmit}>
            <label htmlFor="mobile_number">
                    <br />
                    <input 
                    style={{ width: '300px', height: '40px' }}
                    id="mobile_number" 
                    type="text"
                    name="mobile_number"
                    placeholder="Enter a customer's phone number"
                    onChange={handleChange}
                    value={formData.mobile_number}
                    >
                    </input>
                </label>
                <br/>
            <button type="submit" className="btn btn-primary button-margin" onClick={() => navigate(`/search?mobile_number=${formData.mobile_number}`)}>Find</button>
            <Link type="submit" className="btn btn-secondary" onClick={"location.reload()"}>Reset</Link>
            </form>
        </div>
)

let foundReservationItems = foundReservations.sort((a, b) => a.reservation_id - b.reservation_id).map((reservation, index) => (
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

                </p> {reservation.status === "booked" ?
                <button className="btn btn-danger" data-reservation-id-cancel={reservation.reservation_id} 
                  value={reservation.reservation_id} onClick={handleCancel}>Cancel</button> : null}
            </div>
        </div>
    </li>
  ));

  const reservationItems = rootReservations.sort((a, b) => a.reservation_id - b.reservation_id).map((reservation, index) => (
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

                </p> {reservation.status === "booked" ?
                <button className="btn btn-danger" data-reservation-id-cancel={reservation.reservation_id} 
                  value={reservation.reservation_id} onClick={handleCancel}>Cancel</button> : null}
            </div>
        </div>
    </li>
  ));

return (
    <>        
    <h3 className="title">Search Reservation</h3>
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