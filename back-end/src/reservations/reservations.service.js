const knex = require("../db/connection")

function list (){
  return knex("reservations")
    .select("*")
    .orderBy("reservation_time", "asc")
}

function listByDate(date){
return knex("reservations")
  .select("*")
  .where({reservation_date: date})
  .orderBy("reservation_time", "asc")
}

  function create(newReservation){
    newReservation.status = "Booked"

    return knex("reservations")
        .insert(newReservation, "*")
        .then(createdReservation => createdReservation[0])
  }

  function read(reservationId){
    return knex("reservations")
    .select("*")
    .where({reservation_id: reservationId})
    .first()
  }

  function updateStatus(updatedReservation){
    console.log("knexUpdate", updatedReservation)

    return knex("reservations")
      .select("*")
      .where({reservation_id: updatedReservation.reservation_id})
      .update(updatedReservation, "*")
  }

  function search(mobile_number) {
    return knex("reservations")
      .whereRaw(
        "translate(mobile_number, '() -', '') like ?",
        `%${mobile_number.replace(/\D/g, "")}%`
      )
      .orderBy("reservation_date");
  }

module.exports = {
    list, 
    listByDate,
    create,
    read,
    updateStatus
}