async function estadisticas(req, res) {
  return res.json({
    success: true,
    data: {
      ventasHoy: 0,
      pedidosPendientes: 0,
      productosActivos: 0,
      usuariosRegistrados: 0
    }
  });
}

async function pedidos(req, res) {
  return res.json([]);
}

module.exports = {
  estadisticas,
  pedidos
};
