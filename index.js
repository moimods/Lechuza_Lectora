try {
	require("./src/server");
} catch (error) {
	console.error("Error al iniciar el servidor:", error);
	process.exit(1);
}
