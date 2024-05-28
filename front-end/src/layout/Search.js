import React, {useState } from "react";
import {useNavigate} from "react-router-dom"

function Search({reservations}){
    const initialFormState ={
        search:"",
    }

    const [formData, setFormData] = useState({...initialFormState})
    console.log(formData)
    
    const navigate = useNavigate()

    const handleChange = ({target}) => {
        setFormData({...formData, [target.name]: target.value})
    }
    const handleSubmit = async (event) => {
        console.log("handleSubmit")
        event.preventDefault()
        setFormData(initialFormState); 
        navigate(`/dashboard`)
    }

    const searchForm = (
        <div>
            <br />
            <form onSubmit={handleSubmit}>
            <label htmlFor="mobile_number">
                    Search Reservation:
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

return (
    searchForm
)

}

export default Search