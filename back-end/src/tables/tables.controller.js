const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const service = require("./tables.service")
const moment = require("moment")

async function list(req, res) {
  console.log("list tables")
  res.json({ data: await service.list() });
}

module.exports = {
    list: asyncErrorBoundary(list),
  };