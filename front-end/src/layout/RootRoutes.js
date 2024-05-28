import React, {useState, useEffect} from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import CreateEditReservation from "./CreateEditReservation";
import { listReservations } from "../utils/api";
import CreateEditTable from "./CreateEditTable";
import Search from "./Search";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function RootRoutes() {

  const [reservations, setReservations] = useState([])

  useEffect(() => {
    async function fetchReservations(){
      try{
        const fetchedReservations = await listReservations()
        setReservations(fetchedReservations)
      } catch (error){
        console.error("Error fetching reservations:", error)
      }
    }
    fetchReservations()
  }, [setReservations])

  return (
      <Routes>
        <Route path="/" element={<Dashboard reservations={reservations}/>} />
        <Route path ="/search" element={<Search reservations={reservations}/>} />
        <Route path="/reservations" element={<Dashboard reservations={reservations}/>} />
        <Route path="/reservations/new" element={<CreateEditReservation />} />
        <Route path="/reservations/:reservation_id/edit" element={<CreateEditReservation/>} />
        <Route path="/tables/new" element={<CreateEditTable />} />
        <Route path="/tables/:table_id/seat" element={<CreateEditTable/>}/>
        <Route path="/dashboard/*" element={<Dashboard date={today()}/>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
  );
}

export default RootRoutes;
