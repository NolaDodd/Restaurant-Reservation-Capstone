import React, {useState } from "react";
import {Link, useNavigate} from "react-router-dom"

function Search({reservations}){
    const initialFormState ={
        search:"",
    }

    const [formData, setFormData] = useState({...initialFormState})
    const [currentSearch, setCurrentSearch] = useState()
    console.log(formData)
    
    const navigate = useNavigate()

    const handleChange = ({target}) => {
        setFormData({...formData, [target.name]: target.value})
    }

    const handleSubmit = async (event) => {
        console.log("handleSearchSubmit")
        event.preventDefault()

        setCurrentSearch(formData)
        
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
                    pattern="/d{3}[\-]\d{3}[\-]\d{4}"
                    placeholder="Enter a customer's phone number"
                    onChange={handleChange}
                    value={formData.mobile_number}
                    required
                    >
                    </input>
                </label>
                <button type="submit" className="btn btn-primary">Find</button>
                <br/>
            </form>

        </div>
)


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
                <b>Status:</b> {reservation.status}  {reservation.status === "Booked" ? 
                  <Link to={`/reservations/${reservation.reservation_id}/seat`} className="btn btn-primary">Seat</Link>
                : null}
              </p>
              <button className="btn btn-secondary">Edit</button>
              <button className="btn btn-danger">Delete</button>
          </div>
      </div>
  </li>
));

return (
    <>
        <div>
            {searchForm}
        </div>
        <div>
            {reservationItems}
        </div>
    </>
)

}

export default Search