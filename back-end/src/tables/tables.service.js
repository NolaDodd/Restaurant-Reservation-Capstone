const knex = require("../db/connection")

function list (){
    return knex("tables")
        .select("*")
        .orderBy("table_name", "asc")
}

function read(tableId){
    return knex("tables")
    .select("*")
    .where({table_id: tableId})
    .first()
}

function create(newTable){
    return knex("tables")
        .insert(newTable, "*")
        .then(createdTable => createdTable[0])
}

function update(updatedTable){
    return knex("tables")
        .select("*")
        .where({table_id: updatedTable.table_id})
        .update(updatedTable, "*")
}

function freeTable(tableId) {
    return knex("tables")
      .where({ table_id: tableId })
      .update({ reservation_id: null });
  }



module.exports = {
    list, 
    create,
    read,
    update,
    freeTable,
}