function opt_check(){
  return new Promise(function (resolve, reject) {
    console.log("Okay..")
    return resolve(new Error('Fail!'))
    console.log("HUMM..")

  })
}

opt_check().then(function (text) {
  console.log("RESOLVE")
}).catch(function (error) {
  console.log("REJECT")
});
