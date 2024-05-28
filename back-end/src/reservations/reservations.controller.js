/**
 * List handler for reservation resources
 */
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const service = require("./reservations.service")
const moment = require("moment")

async function list(req, res) {
  res.json({
    data: await service.list(),
  });
}

function filterByDate(req, res, next) {
  const { date } = req.query;
  const { reservation_date } = req.body.data;

  if (date !== reservation_date) {
    return next({status: 400, message: "No reservations found for the given date"});
  }

  next();
}

function getReservations(req, res, next) {
  let reservations = []; // Fetch reservations from your database

  reservations.sort((a, b) => {
    return new Date(`1970/01/01 ${a.reservation_time}`) - new Date(`1970/01/01 ${b.reservation_time}`);
  });

  res.json({ data: reservations });
}

async function create (req, res){
  const data = await service.create(req.body.data)
  res.status(201).json({data})
}

async function read(req, res){
  const data = res.locals.reservation_id
  res.json({data})
}

async function listReservationsByDate(req, res, next){
  console.log("listReservationsByDate")
  let {date} = req.query
  if (!date) {
    date = moment().format('YYYY-MM-DD') // use 'YYYY-MM-DD' format
  }
  console.log("date", date)
  const data = await service.listReservationsByDate(date);
  res.json({data});
}

function reservationExists(req, res, next){
  service.read(req.params.reservation_id)
  .then((reservation) => {
    if(reservation){
      res.locals.reservation = reservation
      return next()
    }
    next({status: 404, message: 'Reservation cannot be found'})
  })
  .catch(next)
}

function correctTimesOnly(req, res, next){
  const {data: {}} = req.body
  console.log(data)

  // Extract the reservation date from the data
  const reservationDate = new Date(data.reservation_date);
  const today = new Date();

  // Check if the reservation date is a Tuesday
  if (reservationDate.getUTCDay() === 2) {
    return next({ status: 400, message: "The restaurant is closed on Tuesdays." });
  }

  //Check if the reservation date is in the past
  if (reservationDate.setHours(0,0,0,0) < today.setHours(0,0,0,0)) {
    return next({ status: 400, message: "Only future reservations are allowed." });
  }
  next()
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

  const { first_name, last_name, mobile_number, reservation_date, reservation_time, people } = data;

  console.log(data);

  if (!first_name || first_name === ""){
    return next({status: 400, message: "Reservation must include a first_name"});
  }

  if (!last_name || last_name === ""){
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







module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [propertiesExist, asyncErrorBoundary(create)],
  read: [asyncErrorBoundary(read)]
};
