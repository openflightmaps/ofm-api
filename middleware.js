module.exports.apiVersion = function(req, res, next) {
  console.log("middleware");
  console.log(res);
  return next();
}
