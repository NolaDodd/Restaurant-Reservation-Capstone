import React, {useState } from "react";
import {Link, useNavigate} from "react-router-dom"

function CreateEditTable(){
    const initialFormState ={
        table_name:"",
        capacity:""
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
                <Link to="/" className= "btn btn-secondary">Cancel</Link>
            </form>
        </div>
     
)

return (
    createTableForm
)

}

export default CreateEditTable