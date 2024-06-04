import React, {useState } from "react";
import {useNavigate} from "react-router-dom"
import ErrorAlert from "./ErrorAlert";
import { createTable } from "../utils/api";

function CreateEditTable(){
    const initialFormState ={
        table_name:"",
        capacity:""
    }

    const [formData, setFormData] = useState({...initialFormState})
    const [formError, setFormError] = useState(null);

    console.log(formData)
    
    const navigate = useNavigate()

    const handleChange = ({target}) => {
        setFormData({...formData, [target.name]: target.value})
    }

    const handleSubmit = async (event) => {
        console.log("handleSubmit")
        event.preventDefault()

        try {
            await createTable(formData)
            setFormData(initialFormState); 
            navigate(`/dashboard`)
        } catch (error){
            setFormError(error)
        }
    }

    const createTableForm = (
        <div>
            <br />
            <form onSubmit={handleSubmit}>
                <label htmlFor="table_name">
                    Table Name:
                    <br />
                    <input
                        id="table_name"
                        type="text"
                        name="table_name"
                        onChange={handleChange}
                        value={formData.table_name}
                        placeholder="Table Name"
                        required
                    />
                </label>
                <br/>
                <label htmlFor="capacity">
                    Capacity:
                    <br />
                    <input
                        id="capacity"
                        type="number"
                        min="1"
                        name="capacity"
                        onChange={handleChange}
                        value={formData.capacity}
                        placeholder="Capacity"
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
    createTableForm
)

}

export default CreateEditTable