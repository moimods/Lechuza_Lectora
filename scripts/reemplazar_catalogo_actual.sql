-- Reemplaza el catálogo inicial actual (ids 1..8) por los 8 libros definidos
UPDATE productos
SET
  titulo = 'The Sisters Brothers',
  autor = 'Patrick deWitt',
  precio = 340,
  stock = 10,
  id_categoria = (SELECT id_categoria FROM categorias WHERE nombre = 'Clásicos' LIMIT 1),
  imagen_url = '/Imagenes/The_Sisters_Brothers.png',
  descripcion = 'Novela de aventura y humor negro ambientada en el Lejano Oeste'
WHERE id_producto = 1;

UPDATE productos
SET
  titulo = 'Perfume',
  autor = 'Patrick Süskind',
  precio = 320,
  stock = 9,
  id_categoria = (SELECT id_categoria FROM categorias WHERE nombre = 'Terror' LIMIT 1),
  imagen_url = '/Imagenes/perfume.png',
  descripcion = 'Historia oscura sobre obsesión, olores y crimen'
WHERE id_producto = 2;

UPDATE productos
SET
  titulo = 'Diario de Ana Frank',
  autor = 'Ana Frank',
  precio = 280,
  stock = 12,
  id_categoria = (SELECT id_categoria FROM categorias WHERE nombre = 'Clásicos' LIMIT 1),
  imagen_url = '/Imagenes/diario_de_ana_frank.png',
  descripcion = 'Testimonio autobiográfico de Ana Frank durante la Segunda Guerra Mundial'
WHERE id_producto = 3;

UPDATE productos
SET
  titulo = 'Viagem ao Centro da Terra',
  autor = 'Júlio Verne',
  precio = 360,
  stock = 8,
  id_categoria = (SELECT id_categoria FROM categorias WHERE nombre = 'Ciencia Ficción' LIMIT 1),
  imagen_url = '/Imagenes/viagem_ao_centro_da_terra.png',
  descripcion = 'Clásica expedición al centro de la Tierra llena de descubrimientos'
WHERE id_producto = 4;

UPDATE productos
SET
  titulo = 'Don Quijote de la Mancha',
  autor = 'Miguel de Cervantes',
  precio = 450,
  stock = 6,
  id_categoria = (SELECT id_categoria FROM categorias WHERE nombre = 'Clásicos' LIMIT 1),
  imagen_url = '/Imagenes/don_quijote_de_la_mancha.png',
  descripcion = 'Obra cumbre de la literatura en español sobre idealismo y aventura'
WHERE id_producto = 5;

UPDATE productos
SET
  titulo = 'El Instituto',
  autor = 'Stephen King',
  precio = 390,
  stock = 7,
  id_categoria = (SELECT id_categoria FROM categorias WHERE nombre = 'Terror' LIMIT 1),
  imagen_url = '/Imagenes/el_instituto.png',
  descripcion = 'Thriller de suspenso sobre niños con habilidades especiales'
WHERE id_producto = 6;

UPDATE productos
SET
  titulo = 'El Hobbit',
  autor = 'J.R.R.Tolken',
  precio = 390,
  stock = 12,
  id_categoria = (SELECT id_categoria FROM categorias WHERE nombre = 'Fantasía' LIMIT 1),
  imagen_url = '/Imagenes/el_hobbit.png',
  descripcion = 'Aventura épica de Bilbo Bolsón en la Tierra Media'
WHERE id_producto = 7;

UPDATE productos
SET
  titulo = 'Cuando Reescribamos La Historia',
  autor = 'Belén Martínez',
  precio = 370,
  stock = 9,
  id_categoria = (SELECT id_categoria FROM categorias WHERE nombre = 'Fantasía' LIMIT 1),
  imagen_url = '/Imagenes/Cuando_Reescribamos_La_Historia.png',
  descripcion = 'Fantasía juvenil sobre viajes, secretos y cambios en el destino'
WHERE id_producto = 8;
