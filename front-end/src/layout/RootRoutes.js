import React, {useState, useEffect} from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import CreateEditReservation from "./CreateEditReservation";
import { listReservations } from "../utils/api";
import CreateEditTable from "./CreateEditTable";
import Search from "./Search";
import AssignTable from "./AssignTable"

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function RootRoutes() {

  const [rootReservations, setRootReservations] = useState([])

    useEffect(() => {
      async function fetchReservations(){
        try{
          const fetchedReservations = await listReservations({today})
          setRootReservations(fetchedReservations)
        } catch (error){
          console.error("Error fetching reservations:", error)
        }
      }
      fetchReservations()
    }, [setRootReservations])

    
  return (
      <Routes>
        <Route path="/" element={<Dashboard rootReservations={rootReservations}/>} />
        <Route path ="/search" element={<Search rootReservations={rootReservations}/>} />
        <Route path="/reservations" element={<Dashboard rootReservations={rootReservations}/>} />
        <Route path="/reservations/new" element={<CreateEditReservation />} />
        <Route path="/reservations/:reservationId/seat" element={<AssignTable rootReservations={rootReservations}/>} />    
        <Route path="/reservations/:reservationId/edit" element={<CreateEditReservation/>} />
        <Route path="/tables/new" element={<CreateEditTable />} />
        <Route path="/tables/:table_id/seat" element={<CreateEditTable/>}/>
        <Route path="/dashboard/*" element={<Dashboard rootReservations={rootReservations} date={today()}/>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
  );
}

export default RootRoutes;
