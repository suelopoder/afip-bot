module.exports.run = function () {
  if (!process.env.CUIT) {
    console.error('No se encontró variable de entorno "CUIT"')
    process.exit(1)
  }

  if (!process.env.PASS) {
    console.error('No se encontró variable de entorno "PASS"')
    process.exit(1)
  }
}
