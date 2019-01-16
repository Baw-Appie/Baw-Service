module.exports = (connection, sql) => {
  return new Promise(function(resolve,reject){
    connection.query(sql, function(err, rows){
      if(err !== null) return reject(err);
      resolve(rows);
    });
  });
}
