const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const service = require("./tables.service")
const reservationService = require("../reservations/reservations.service")

async function list(req, res) {
  res.json({ data: await service.list() });
}

async function create (req, res){
  const data = await service.create(req.body.data)
  console.log("created new table", data)

  res.status(201).json({data})
}

async function read(req, res){
  const data = res.locals.table
  console.log("tablesread", data)

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

async function tableCheck(req, res, next){
  const tableId = req.params.tableId;
  const reservationId = req.body.data.reservation_id

  const table = await service.read(tableId)
  const reservation = await reservationService.read(reservationId)

  if (table.capacity < reservation.people) {
    return next({ status: 400, message: 'The table does not have enough capacity for the reservation.' });
  }

  if (table.reservation_id != null) {
    return next({ status: 400, message: 'The table is already occupied.' });

  }

  if (!req.body.data || !reservationId) {
    return next({ status: 400, message: 'The reservation_id does not exist.' });
  }

  next()
}

async function update(req, res, next){
  const reservationId = req.body.data.reservation_id;
  console.log("updated table", reservationId)

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

  if (table.reservation_id === null){
    return next({ status: 400, message: "This table is not occupied"})
  }

  if (!table.table_id){
    return next({ status: 404, message: "This table has no table_id"})
  }

  next()
}

async function destroy(req, res, next){
  service.delete(res.locals.table.tableId)

}

async function freeTable(req, res){
  const {table} = res.locals
  await service.freeTable(table.table_id);
  res.sendStatus(200);
}

module.exports = {
    list: asyncErrorBoundary(list),
    create: [tableCreateValid, asyncErrorBoundary(create)],
    read: [tableExists, asyncErrorBoundary(read)],
    update: [tableExists, tableCheck, asyncErrorBoundary(update)],
    delete: [asyncErrorBoundary(deleteCheck), asyncErrorBoundary(destroy)],
    freeTable: [tableExists, asyncErrorBoundary(deleteCheck), asyncErrorBoundary(freeTable) ]
  };