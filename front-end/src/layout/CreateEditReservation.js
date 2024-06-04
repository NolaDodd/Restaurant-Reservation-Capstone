import React, {useState } from "react";
import {useNavigate} from "react-router-dom"
import { createReservation } from "../utils/api";
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
    
    const handleChange = ({target}) => {
        setFormData({...formData, [target.name]: target.value})
    }

    const navigate = useNavigate()

    const handleSubmit = async (event) => {
        console.log("handleSubmit")
        event.preventDefault()
      
        try {
          await createReservation(formData);
          setFormData(initialFormState);
          navigate(`/dashboard`);
        } catch (error) {
          setFormError(error)
        }
      }
      

    const handleEdit = async (event) => {
        console.log("handleEdit")
        event.preventDefault()
        setFormData(initialFormState); 
        navigate("/dashboard")
    }

    const createReservationForm = (
        <div>
            <br />
            <form onSubmit={handleSubmit}>
                <label htmlFor="first_name">
                    First Name:
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
                    Last Name:
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
                    Mobile Number:
                    <br />
                    <input 
                    id="mobile_number" 
                    type="text"
                    name="mobile_number"
                    placeholder="XXX-XXX-XXXX"
                    onChange={handleChange}
                    value={formData.mobile_number}
                    required
                    >
                    </input>
                </label>
                <br/>
                <label htmlFor="reservation_date">
                    Reservation Date:
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
                    Reservation Time:
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
                    Number of People:
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
    createReservationForm          
)



}



export default CreateEditReservation