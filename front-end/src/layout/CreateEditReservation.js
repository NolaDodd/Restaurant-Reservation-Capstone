import React, {useState, useEffect } from "react";
import {useNavigate, useParams} from "react-router-dom"
import { createReservation, editReservationData, updateReservationEdit } from "../utils/api";
import { formatAsDate } from "../utils/date-time";
import ErrorAlert from "./ErrorAlert";

function CreateEditReservation(){
    const initialFormState ={
        first_name:"",
        last_name:"",
        mobile_number:"",
        reservation_date:"",
        reservation_time:"",
        people:""
    }

    const [formData, setFormData] = useState({...initialFormState})
    const [formError, setFormError] = useState(null);

    const {reservationId} = useParams()

    useEffect(() => {
        const abortController = new AbortController();
        async function loadForm() {
            if(reservationId) {
                try {
                    const reservationData = await editReservationData(reservationId, abortController.signal);
                    reservationData.reservation_date = formatAsDate(reservationData.reservation_date);
                    setFormData(reservationData);
                } catch (error) {
                    console.log(error);
                }
            }
        }
        loadForm();
        return () => abortController.abort();
    }, [reservationId]);


    const handleChange = ({target}) => {
        setFormData({...formData, [target.name]: target.value})
    }

    const navigate = useNavigate()

    const handleSubmit = async (event) => {
    event.preventDefault();
    try {
        if (reservationId) {
            await updateReservationEdit(formData, reservationId);
        } else {
            await createReservation(formData);
        }
        setFormData(initialFormState);
        navigate(`/dashboard`);
    } catch (error) {
        setFormError(error);
        }
    };

    const createEditReservationForm = (
        <div className="formtext">
            <form onSubmit={handleSubmit}>
                <label htmlFor="first_name">
                    <b>First Name:</b>
                    <br />
                    <input
                        id="first_name"
                        type="text"
                        name="first_name"
                        onChange={handleChange}
                        value={formData.first_name}
                        placeholder="First Name"
                        required
                    />
                </label>
                <br/>
                <label htmlFor="last_name">
                    <b>Last Name:</b>
                    <br />
                    <input
                        id="last_name"
                        type="text"
                        name="last_name"
                        onChange={handleChange}
                        value={formData.last_name}
                        placeholder="Last Name"
                        required
                    />
                </label>
                <br/>
                <label htmlFor="mobile_number">
                    <b>Mobile Number:</b>
                    <br />
                    <input 
                    id="mobile_number" 
                    type="text"
                    name="mobile_number"
                    placeholder="XXX-XXX-XXXX"
                    pattern="(\d{3}-\d{3}-\d{4}|\d{10})"
                    onChange={handleChange}
                    value={formData.mobile_number}
                    required
                    title="Please enter a valid phone number with 10 digits"
                    >
                    </input>
                </label>
                <br/>
                <label htmlFor="reservation_date">
                    <b>Reservation Date:</b>
                    <br />
                    <input 
                    id="reservation_date" 
                    type="date"
                    name="reservation_date"
                    onChange={handleChange}
                    value={formData.reservation_date}
                    placeholder="YYYY-MM-DD" 
                    pattern="\d{4}-\d{2}-\d{2}"
                    required
                    />
                </label>
                <br/>
                <label htmlFor="reservation_time">
                    <b>Reservation Time:</b>
                    <br />
                    <input 
                    id="reservation_time" 
                    type="time"
                    name="reservation_time"
                    onChange={handleChange}
                    value={formData.reservation_time}
                    placeholder="HH:MM" 
                    pattern="[0-9]{2}:[0-9]{2}"
                    required
                    />
                </label>
                <br/>
                <label htmlFor="people">
                    <b>Number of People:</b>
                    <br />
                    <input 
                    id="people" 
                    type="number"
                    name="people"
                    min="1"
                    onChange={handleChange} 
                    value={formData.people}
                    required
                    />
                </label>
                <br/>
                <button type="submit" className="btn btn-primary">Submit</button>
                <button onClick={() => navigate(-1)} className= "btn btn-secondary">Cancel</button>
            </form>
            <ErrorAlert error={formError} />
        </div>    
    )
  
return (
    <div>
        {createEditReservationForm}
    </div>
    )

}

export default CreateEditReservation
