/**
 * List handler for reservation resources
 */
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const service = require("./reservations.service")
const moment = require("moment-timezone")

async function list(req, res) {
  const {date, mobile_number} = req.query
  
  let reservations
  
  if (date){
    reservations = await service.listByDate(date)
    filteredReservations = reservations.filter(reserve => reserve.status !== "finished")
    res.status(200).json({ data: filteredReservations })

  } else if (mobile_number){
      reservations = await service.search(mobile_number)

      if (reservations.length <= 0){
        res.json({data: []})
      } else {
        res.json({ data: reservations });
      }
    
  } else {
      reservations = await service.list()
      res.json({ data: reservations });
  }
}

async function read(req, res){
  const data = res.locals.reservation
  res.json({data})
}

function reservationExists(req, res, next){
  service.read(req.params.reservationId)
  .then((reservation) => {
    if(reservation){
      res.locals.reservation = reservation
      return next()
    }
    next({status: 404, message: `Reservation ${req.params.reservationId} cannot be found`})
  })
  .catch(next)
}

async function create (req, res){
  const data = await service.create(req.body.data)
  res.status(201).json({data})
}

function reservationCreateCheck(req, res, next){
  const {data = {}} = req.body
  const {status} = data

  if (status === "seated" || status === "finished"){
    return next({status: 400, message: "Reservation status cannot be `seated` or `finished`."})
  }
  next()
}

function correctTimesOnly(req, res, next){
  const {data = {}} = req.body

  // Parse the reservation date and time in the server's time zone
  const reservationDateTime = moment.tz(`${data.reservation_date}T${data.reservation_time}`, 'America/Los_Angeles');
  const today = moment.tz('America/Los_Angeles');

  // Check if the reservation date is a Tuesday
  if (reservationDateTime.day() === 2) {
    return next({ status: 400, message: "The restaurant is closed on Tuesdays." });
  }

  // Check if the reservation time is before 10:30 AM or after 9:30 PM
  const reservationHour = reservationDateTime.hour();
  const reservationMinutes = reservationDateTime.minutes();
  if (reservationHour < 10 || (reservationHour === 10 && reservationMinutes < 30) || reservationHour > 21 || (reservationHour === 21 && reservationMinutes > 30)) {
    return next({ status: 400, message: "Reservations are only allowed between 10:30 AM and 9:30 PM." });
  }

  //Check if the reservation date and time is in the past
  if (reservationDateTime.isBefore(today)) {
    return next({ status: 400, message: "Only future reservations are allowed." });
  }
  next()
}

function propertiesExist(req, res, next){
  const { data = {} } = req.body;
  
  if (Object.keys(data).length === 0){
    return next({status: 400, message: "Data is required"});
  }

  const { first_name, last_name, mobile_number, reservation_date, reservation_time, people } = data;

  if (!first_name || first_name.trim() === ""){
    return next({status: 400, message: "Reservation must include a first_name"});
  }

  if (!last_name || last_name.trim() === ""){
    return next({status: 400, message: "Reservation must include a last_name"});
  }

  if (!mobile_number || mobile_number === ""){
    return next({status: 400, message: "Reservation must include a mobile_number"});
  }

  if (!reservation_date || reservation_date === "" || isNaN(Date.parse(reservation_date))){
    return next({status: 400, message: "Reservation must include a reservation_date"});
  }

  if (!reservation_time || reservation_time === "" || !isValidTime(reservation_time)){
    return next({status: 400, message: "Reservation must include a reservation_time"});
  }

  if (!people || people === "" || people === 0 || typeof people !== "number" ){
    return next({status: 400, message: "Reservation number of people must be 1 or above"});
  }

  next();
}


function reservationStatusCheck(req, res, next){
  const { data = {} } = req.body;

  const { status } = data;

  const {reservation} = res.locals

  const lowerCaseStatus = status.toLowerCase()

  const validStatus = ["booked", "seated", "finished", "cancelled"]

  if (!lowerCaseStatus || lowerCaseStatus === undefined || lowerCaseStatus === null){
    return next({status: 400, message: "The reservation status is missing"})
  }

  if (!validStatus.includes(lowerCaseStatus)){
    return next({status: 400, message: "This reservation status is unknown and must be a valid status."})
  }

  if (reservation.status === "finished"){
    return next({status: 400, message: "A finished reservation cannot be updated"})
  }

  next();
}

async function updateStatus(req, res, next){
  const updatedReservation = {
    ...req.body.data, 
    reservation_id: res.locals.reservation.reservation_id,
  }
  const data = await service.update(updatedReservation)

  res.status(200).json({data: data[0]})
}

async function updateReservation(req, res){
  let updatedData = req.body.data
  const data = await service.update(updatedData)

  res.status(200).json({data: data[0]})
}

function isValidTime(time) {
  const timeFormatWithSeconds = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  const timeFormatWithoutSeconds = /^([01]\d|2[0-3]):([0-5]\d)$/;
  
  if (timeFormatWithSeconds.test(time)) {
    return true;
  }
  else if (timeFormatWithoutSeconds.test(time)) {
    return true;
  }
  else {
    console.log("Invalid time format:", time);
    return false;
  }
}

async function editPropertiesExist(req, res, next){
  const { data = {} } = req.body;
  const { reservationId } = req.params;

  // Retrieve the existing reservation
  const lookReservation = await service.read(reservationId);

  if (!lookReservation){
    return next({status: 404, message: "This reservation does not exist"});
  }

  // Ensure data is provided in the request body
  if (Object.keys(data).length === 0){
    return next({status: 400, message: "Data is required"});
  }

  // Validate first_name
  if (data.first_name !== null && (!data.first_name || data.first_name.trim() === "")){
    return next({status: 400, message: "Reservation must include a valid first_name"});
  }

  // Validate last_name
  if (data.last_name !== null && (!data.last_name || data.last_name.trim() === "")){
    return next({status: 400, message: "Reservation must include a valid last_name"});
  }

  // Validate mobile_number
  if (data.mobile_number !== null && (!data.mobile_number || data.mobile_number === "")){
    return next({status: 400, message: "Reservation must include a valid mobile_number"});
  }

  // Validate reservation_date
  if (data.reservation_date !== null && (!data.reservation_date || data.reservation_date === "" || isNaN(Date.parse(data.reservation_date)))){
    return next({status: 400, message: "Reservation must include a valid reservation_date"});
  }

  // Validate reservation_time
  if (data.reservation_time !== null && (!data.reservation_time || data.reservation_time === "" || !isValidTime(data.reservation_time))){
    return next({status: 400, message: "Reservation must include a valid reservation_time"});
  }

  // Validate people
  if (data.people !== null && (!data.people || data.people === "" || data.people === 0 || typeof data.people !== "number")){
    return next({status: 400, message: "Reservation number of people must be 1 or above"});
  }

  next();
}


// async function editPropertiesExist(req, res, next){
//   const { data = {} } = req.body;
//   const {reservationId} = req.params

//   const lookReservation = await service.read(reservationId)
//   console.log(data, reservationId, lookReservation)
  
//   if (Object.keys(data).length === 0){
//     return next({status: 404, message: "Data is required"});
//   }

//   if (!lookReservation){
//     return next({status: 404, message: "This reservation does not exist"});
//   }

//   const { first_name, last_name, mobile_number, reservation_date, reservation_time, people } = data;

//   if (!first_name || first_name.trim() === ""){
//     return next({status: 400, message: "Reservation must include a first_name"});
//   }

//   if (!last_name || last_name.trim() === ""){
//     return next({status: 400, message: "Reservation must include a last_name"});
//   }

//   if (!mobile_number || mobile_number === ""){
//     return next({status: 400, message: "Reservation must include a mobile_number"});
//   }

//   if (!reservation_date || reservation_date === "" || isNaN(Date.parse(reservation_date))){
//     return next({status: 400, message: `${999}: Reservation must include a valid reservation_date`});
//   }

//   if (!reservation_time || reservation_time === "" || !isValidTime(reservation_time)){
//     return next({status: 400, message: `${reservation_time}: Reservation must include a valid reservation_time `});
//   }

//   if (!people || people === "" || people === 0 || typeof people !== "number" ){
//     return next({status: 400, message: "Reservation number of people must be 1 or above"});
//   }

//   next();
// }

module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [propertiesExist, correctTimesOnly, reservationCreateCheck, asyncErrorBoundary(create)],
  read: [reservationExists, asyncErrorBoundary(read)],
  editReservation: [asyncErrorBoundary(editPropertiesExist), correctTimesOnly, asyncErrorBoundary(updateReservation)],
  updateStatus: [reservationExists, reservationStatusCheck, asyncErrorBoundary(updateStatus)]
}
