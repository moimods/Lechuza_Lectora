async function registrarVenta(req, res) {
  return res.json({
    success: true,
    message: "Venta registrada",
    data: req.body || {}
  });
}

module.exports = {
  registrarVenta
};
