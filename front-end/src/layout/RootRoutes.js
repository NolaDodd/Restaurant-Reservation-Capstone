import React, {useState, useEffect} from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import CreateEditReservation from "./CreateEditReservation";
import { listReservations, listTables } from "../utils/api";
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
  const [rootTables, setRootTables] = useState([])

  useEffect(() => {
    const abortController = new AbortController();
    
    async function fetchReservations(){
      try{
        const fetchedReservations = await listReservations(abortController.signal)
        setRootReservations(fetchedReservations)
      } catch (error){
        console.error("Error fetching reservations:", error)
      }
    }
    fetchReservations()
    return () => abortController.abort();

  }, [setRootReservations])

  useEffect(() => {
    const abortController = new AbortController();
  
    async function loadTables() {
      try {
        const foundTables = await listTables(abortController.signal);
        setRootTables(foundTables);
      } catch (error) {
        console.error("Error fetching tables:", error)
      }
    }
    loadTables();
    return () => abortController.abort();
  }, [setRootTables]);
  
  return (
      <Routes>
        <Route path="/" element={<Dashboard rootReservations={rootReservations} rootTables={rootTables} />} />
        <Route path ="/search" element={<Search rootReservations={rootReservations} rootTables={rootTables} />} />
        <Route path="/reservations/new" element={<CreateEditReservation />} />
        <Route path="/reservations/:reservationId/seat" element={<AssignTable rootReservations={rootReservations} rootTables={rootTables} />} />    
        <Route path="/reservations/:reservationId/edit" element={<CreateEditReservation/>} />
        <Route path="/tables/new" element={<CreateEditTable />} />
        <Route path="/tables/:table_id/seat" element={<CreateEditTable />}/>
        <Route path="/dashboard/*" element={<Dashboard rootReservations={rootReservations} date={today()} rootTables={rootTables} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
  );
}

export default RootRoutes;
