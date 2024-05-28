const knex = require("../db/connection")

function list (){
    return knex("reservations").select("*")
}

  function create(newReservation){
    return knex("reservations")
        .insert(newReservation, "*")
        .then(createdReservation => createdReservation[0])
  }

  function read(reservation_id){
    return knex("reservations")
    .select("*")
    .where({reservation_id: reservation_id})
    .first()
  }

module.exports = {
    list, 
    create,
    read
}