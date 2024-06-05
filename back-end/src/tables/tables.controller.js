const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const service = require("./tables.service")
const reservationService = require("../reservations/reservations.service")

async function list(req, res) {
  res.json({ data: await service.list() });
}

async function create (req, res){
  const data = await service.create(req.body.data)

  res.status(201).json({data})
}

async function read(req, res){
  const data = res.locals.table

  res.json({data})
}

function tableCreateValid(req, res, next){
  const {data = {}} = req.body

  const {table_name, capacity} = data

  if (!data){
    return next({ status: 400, message: "The data is missing." });
  }

  if (!table_name || table_name.trim() === ""){
    return next({ status: 400, message: "The table_name is missing." });
  }

  if (table_name.length === 1){
    return next({ status: 400, message: "The table_name needs to be more than one character." });
  }

  if (!capacity || capacity === 0 || typeof capacity !== "number" ){
    return next({status: 400, message: "The table capacity must be 1 or above"});
  }

  next()
}

function tableExists (req, res, next){
  service.read(req.params.tableId)
    .then(table => {
      if(table){
        res.locals.table = table
        return next()
      }
      next({status: 404, message: `table_id ${req.params.tableId} cannot be found`})
    })
    .catch(next)
}

async function tableUpdateCheck(req, res, next){
  const {data = {}} = req.body

  const tableId = req.params.tableId;
  const reservationId = data.reservation_id

  const table = await service.read(tableId)

  if (Object.keys(data).length === 0 || !reservationId){
    return next({ status: 400, message: `The reservation_id is missing.` });
  }

  const reservation = await reservationService.read(reservationId)

  if (!reservation){
    return next({ status: 404, message: `Reservation ${reservationId} does not exist.` });
  }

  if (reservation.status === "seated"){
    return next({status: 400, message: `This reservation is already seated`})
  }

  if (table.capacity < reservation.people) {
    return next({ status: 400, message: 'The table does not have enough capacity for the reservation.' });
  }

  if (table.reservation_id != null) {
    return next({ status: 400, message: 'The table is already occupied.' });
  }

  next()
}

async function update(req, res){
  const reservationId = req.body.data.reservation_id;

  const reservation = await reservationService.read(reservationId)

  if (reservation.status === "booked"){
      const updatedReservation = {
        ...req.body.data,
        status: "seated"

      }    
    await reservationService.update(updatedReservation)
  } else {
    const updatedReservation = {
      ...req.body.data,
      status: "finished"
    }    
  await reservationService.update(updatedReservation)
  }

  const updatedTable = {...req.body.data,
    table_id: req.params.tableId,
    reservation_id: reservationId
  }
  const data = await service.update(updatedTable)
  res.status(200).json({data})
}


async function deleteCheck(req, res, next){
  const tableId = req.params.tableId;
  const table = await service.read(tableId)

  if (!table.table_id){
    return next({ status: 404, message: `Table ${tableId} does not exist`})
  }

  if (table.reservation_id === null){
    return next({ status: 400, message: "This table is not occupied"})
  }

  next()
}

async function freeTable(req, res){
  const {table} = res.locals

  const updatedReservation = {
    ...req.body.data,
    status: "finished",
    reservation_id: table.reservation_id
  }  

  await reservationService.update(updatedReservation)

  await service.freeTable(table.table_id);
  res.sendStatus(200);
}

module.exports = {
    list: asyncErrorBoundary(list),
    create: [tableCreateValid, asyncErrorBoundary(create)],
    read: [tableExists, asyncErrorBoundary(read)],
    update: [tableExists, asyncErrorBoundary(tableUpdateCheck), asyncErrorBoundary(update)],
    freeTable: [tableExists, asyncErrorBoundary(deleteCheck), asyncErrorBoundary(freeTable) ]
  };