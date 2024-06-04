/**
 * List handler for reservation resources
 */
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const service = require("./reservations.service")
const moment = require("moment-timezone")


async function list(req, res, next) {
  const {date} = req.query
  let reservations
  
  if (date){
    reservations = await service.listByDate(date)
  } else {
    reservations = await service.list()
  }

  if (reservations.length <= 0){
    return next({status: 400, message: "No reservations found for the given date"})
  } else {
    res.json({ data: reservations });
  }

}

async function create (req, res){
  const data = await service.create(req.body.data)
  res.status(201).json({data})
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

function isValidTime(time) {
  const timeFormat = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeFormat.test(time)
}

function propertiesExist(req, res, next){
  const { data = {} } = req.body;
  
  if (Object.keys(data).length === 0){
    return next({status: 400, message: "Data is required"});
  }

  const { first_name, last_name, mobile_number, reservation_date, reservation_time, status, people } = data;

  console.log("propertiesExist", data);

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


async function updateStatus(req, res, next){
  const updatedReservation = {
    ...req.body.data, 
    reservation_id: res.locals.reservation.reservation_id,
  }

  const data = await service.updateStatus(updatedReservation)
  console.log("status Updated", data)

  res.status(200).json({data: data[0]})
}

function reservationStatusCheck(req, res, next){
  const { data = {} } = req.body;
  
  if (Object.keys(data).length === 0){
    return next({status: 400, message: "Data is required"});
  }

  const { first_name, last_name, mobile_number, reservation_date, reservation_time, status, people } = data;

  console.log("reservationStatusCheck", data);
  const validStatus = ["booked", "seated"]

  if (status.toLowerCase() === "seated" || status.toLowerCase() === "finished"){
    return next({status: 400, message: "Reservation status cannot be `seated` or `finished`."})
  }

  if (status.toLowerCase() === "finished"){
    return next({status: 400, message: "This reservation is already finished and cannot be updated"})
  }

  if (!status || status === undefined || status === null){
    return next({status: 400, message: "The reservation status is missing"})
  }

  if (!validStatus.includes(status.toLowerCase())){
    return next({status: 400, message: "This reservation status is unknown and must be a valid status."})
  }

  next();
}



module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [propertiesExist, correctTimesOnly, asyncErrorBoundary(create)],
  read: [reservationExists, asyncErrorBoundary(read)],
  updateStatus: [reservationExists, reservationStatusCheck, asyncErrorBoundary(updateStatus)]
};
