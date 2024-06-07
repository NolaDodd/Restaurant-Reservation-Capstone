/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment variable.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-time";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the requst.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */

async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return null;
    }

    let payload = await response.text();

    // Check if the response is "OK" or an empty string before parsing as JSON
    if (payload !== 'OK' && payload !== '') {
      payload = JSON.parse(payload);
    }

    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}



/**
 * Retrieves all existing reservations.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservation saved in the database.
 */

export async function listReservations(params, signal) {
  try{
    const url = new URL(`${API_BASE_URL}/reservations`);
    Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  )
  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
  } catch (error){
    console.log(error)
    throw error
  }
}

/**
 * Retrieves a reservation.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservation saved in the database.
 */

export async function loadReservation(reservationId, signal) {
  try{
      const url = new URL(`${API_BASE_URL}/reservations/${reservationId}`);
  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
  } catch (error){
    console.log(error)
    throw error
  }
}

/**
 * Lists all tables.
 * @returns {Promise<[tables]>}
 *  a promise that resolves to a possibly empty array of reservation saved in the database.
 */

export async function listTables(params, signal) {
  try{
  const url = new URL(`${API_BASE_URL}/tables`);
  Object.entries(params).forEach(([key, value]) =>
  url.searchParams.append(key, value.toString())
)
return await fetchJson(url, { headers, signal }, [])
  } catch (error){
    console.log(error)
    throw error
  }
}


/**
 * Saves the reservation to the database.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to the saved reservation, which will now have an 'id' property.
 */
export async function createReservation(reservation, signal) {
  try{
     const url = `${API_BASE_URL}/reservations`;
      reservation.people = Number(reservation.people);
      const options = {
        method: "POST",
        headers,
        body: JSON.stringify({ data: reservation }),
        signal,
      };
  return await fetchJson(url, options, reservation); 
  } catch (error){
    throw error
  }
}


/**
 * Cancels a reservation and updates status to cancelled.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to the saved reservation, which will now have an 'id' property.
 */
export async function cancelReservation(reservation, signal) {
  try{
     const url = `${API_BASE_URL}/reservations/${reservation.reservation_id}/status`;
      const options = {
        method: "PUT",
        headers,
        body: JSON.stringify({ data: { status: "cancelled" } }),
        signal,
      };
  return await fetchJson(url, options, reservation); 
  } catch (error){
    throw error
  }
}

/**
 * Retrieves reservations by mobile number.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservation saved in the database.
 */

export async function findReservations({ mobile_number }, signal) {
  try{
    const url = new URL(`${API_BASE_URL}/reservations`);
    if (mobile_number) {
        url.searchParams.append('mobile_number', mobile_number);
    }
    return await fetchJson(url, { headers, signal }, [])
        .then(formatReservationDate)
        .then(formatReservationTime);
  } catch (error){
    console.log(error)
    throw error
  }
}

/**
 * Updates reservation data to the database.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to the saved reservation.
 */
export async function editReservationData(reservationId, signal) {
  try{
    const url = `${API_BASE_URL}/reservations/${reservationId}`;
    return await fetchJson(url, { signal }, {}); 
  } catch (error){
    throw error
  }
}


/**
 * Updates reservation data to the database.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to the saved reservation.
 */
export async function updateReservationEdit(reservation, reservationId, signal) {
  try{

    reservation.people = Number(reservation.people)
    const url = `${API_BASE_URL}/reservations/${reservationId}`;

    const options = {
      method: "PUT",
      headers,
      body: JSON.stringify({ data: reservation }),
      signal,
    };
    return await fetchJson(url, options, { signal }, {}); 
  } catch (error){
    throw error
  }
}

/**
 * Updates reservation "Seated" to the database.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to the saved reservation, which will now have an 'id' property.
 */
export async function updateReservationSeated(reservation, signal) {
  try{
     const url = `${API_BASE_URL}/reservations/${reservation.reservation_id}/status`;
      const options = {
        method: "PUT",
        headers,
        body: JSON.stringify({ data: { status: "seated" } }),
        signal,
      };
  return await fetchJson(url, options, reservation); 
  } catch (error){
    throw error
  }
}

/**
 * Updates reservation "Finished" to the database.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to the saved reservation, which will now have an 'id' property.
 */
export async function updateReservationFinished(reservation, signal) {
  try{
    const url = `${API_BASE_URL}/reservations/${reservation.reservation_id}/status`;
    const options = {
        method: "PUT",
        headers,
        body: JSON.stringify({ data: { status: "finished" } }),
        signal,
      };
  return await fetchJson(url, options, reservation); 
  } catch (error){
    throw error
  }
}

/**
 * Saves the table to the database.
 * @returns {Promise<[table]>}
 *  a promise that resolves to the saved table, which will now have an 'id' property.
 */
export async function createTable(table, signal) {
  try{
     const url = `${API_BASE_URL}/tables`;
      table.capacity = Number(table.capacity);
      const options = {
        method: "POST",
        headers,
        body: JSON.stringify({ data: table }),
        signal,
      };
  return await fetchJson(url, options, table); 
  } catch (error){
    throw error
  }

}

/**
 * Updates the table to the database.
 * @returns {Promise<[table]>}
 */
export async function updateTable(selectedTable, reservation, signal) {
  try{
     const url = `${API_BASE_URL}/tables/${selectedTable.table_id}/seat`;
      const options = {
        method: "PUT",
        headers,
        body: JSON.stringify({ data: { reservation_id: reservation.reservation_id } }),
        signal,
      };
  return await fetchJson(url, options, selectedTable); 
  } catch (error){
    throw error
  }
}

/**
 * Deletes table assignment to the database.
 * @returns {Promise<[table]>}
 */
export async function deleteTableAssignment(tableFinish, signal) {
  try{
     const url = `${API_BASE_URL}/tables/${tableFinish.table_id}/seat`;
      const options = {
        method: "DELETE",
        headers,
        body: JSON.stringify({ data: { reservation_id: null } }),
        signal,
      };
      fetchJson(url, options, tableFinish)
  return await fetchJson(url, options, tableFinish); 
  } catch (error){
    throw error
  }
}
