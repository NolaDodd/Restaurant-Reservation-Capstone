import React, { useEffect, useState } from "react";
import {useNavigate, useParams} from "react-router-dom"
import { updateReservationSeated, loadReservation, listTables, updateTable,} from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function AssignTable({rootReservations}) {
  const [reservation, setReservation] = useState([])
  const [reservationsError, setReservationsError] = useState(null);
  
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)

  let navigate = useNavigate()
  const { reservationId } = useParams();

  useEffect(() => {
    const abortController = new AbortController()

    async function findReservation(){
      try {
        setReservationsError(null)
        const loading = await loadReservation(reservationId, abortController.signal)
        console.log("loading", loading )
        setReservation(loading)
      } catch (error){
        setReservationsError(error)
      }
    }
    findReservation()
  }, [reservationId]);


  useEffect(() => {
    const abortController = new AbortController()

      async function loadTables(){
        try{
          setReservationsError(null)
          const loadingTables = await listTables(abortController.signal)
          setTables(loadingTables)

          if (loadingTables.length > 0){
            setSelectedTable(loadingTables[0])
          }

        } catch (error){
          setReservationsError(error)
        }
      }
      loadTables()
  }, [reservationId])

  const handleUpdateSubmit = async (event) => {
    console.log("handleSubmit")
    event.preventDefault()

    try {
        await updateTable(selectedTable, reservation)
        await updateReservationSeated(reservation)
        navigate(`/dashboard`)
    } catch (error){
        setReservationsError(error)
    }
}  

const handleChange = (event) => {
    const selectedTableId = event.target.value;
    const selectedTable = tables.find(table => table.table_id === Number(selectedTableId));
    setSelectedTable(selectedTable)
}
         

  const reservationCard =
  reservation ?
    <div>
    <li className="box-container" style={{ listStyle : "none"}}>
    <div className="card reservation">
        <div className="card-body reservationtext">
            <div className="card-header"><h5 className="card-title">Reservation {reservation.reservation_id}</h5></div>
            <p className="card-text"><b>Name:</b> {reservation.first_name} {reservation.last_name}</p>
            <p className="card-text"><b>Mobile Number:</b> {reservation.mobile_number}</p>
            <p className="card-text"><b>Reservation Time:</b> {reservation.reservation_time}</p>
            <p className="card-text"><b>Reservation Date:</b> {reservation.reservation_date}</p>
            <p className="card-text"><b>Number of People:</b> {reservation.people}</p>
            <p data-reservation-id-status={reservation.reservation_id}></p>
            </div>
        </div>
    </li>
    </div> : null

const tableItems = tables.map((table, index) => {
  const matchingReservation = rootReservations.find(reservation => reservation.reservation_id === table.reservation_id);

  return (
    <li key={index} className="box-container" style={{ listStyle : "none"}}>
      <div className="card row table" >
        <div className="card-body tabletext">
          <div className="card-header"><h5 className="card-title">{table.table_name}</h5></div>
          <p className="card-text"><b>Table Capacity:</b> {table.capacity}</p>
          <div data-table-id-status={table.table_id}>
            <b>Status: {table.reservation_id ? 
              <><span style={{color: "#dc1d1d"}}>Occupied</span> 
                  {matchingReservation ? <>
                    <div> Reservation {table.reservation_id} </div>
                    <div>{matchingReservation.first_name} {matchingReservation.last_name}</div>
                    <div>
                    {matchingReservation.reservation_time}
                    </div>
                    <div>
                    {matchingReservation.reservation_date}
                    </div>
                    </>
                    : null}
              </> 
                : <span style={{color: "#03b203" }}>Free</span>}
            </b>
          </div>
        </div>
      </div>
    </li>
  );
});

  const tableOptions = (
    <div className="table-options">
      <label htmlFor="table_id"><h3 className="title">Table Number:</h3></label>
      <div className="select-button-container">
        <select name="table_id" onChange={handleChange} className="form-select">
          {tables.map((table, index) => (
            <option key={index} value={table.table_id}>{table.table_name} - {table.capacity}</option>
          ))}
        </select>
        <button onClick={handleUpdateSubmit} className="btn btn-primary">Assign Table</button>
      </div>
    </div>
  );
  

  return (
    <main>
    <br />
    <div>
        <h2 className="title">Assign Reservation {reservation.reservation_id} to Table</h2>        
        <button onClick={() => navigate(-1)} className= "btn btn-secondary">Cancel</button>
    </div>
    <br />
    <div>
        {reservationCard}
    </div>
    <br />
    <div >
        {tableOptions}
        <ErrorAlert error={reservationsError} />
    </div>   
    <br />
    <h3 className="title">Tables</h3>
      <div className="row">
        {tableItems.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>
    </main>
  );
}

export default AssignTable;
