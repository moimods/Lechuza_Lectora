async function ventas(req, res) {
  return res.json({
    resumen: {
      total_ganancias: 0,
      total_pedidos: 0,
      promedio: 0
    },
    top: [],
    grafica: [
      { mes: "Ene", monto: 0 },
      { mes: "Feb", monto: 0 },
      { mes: "Mar", monto: 0 }
    ]
  });
}

module.exports = {
  ventas
};
