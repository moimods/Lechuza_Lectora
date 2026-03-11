-- Actualiza rutas de imagenes para libros ya existentes en la base de datos
UPDATE productos SET imagen_url = '/Imagenes/The_Sisters_Brothers.png' WHERE titulo = 'The Sisters Brothers';
UPDATE productos SET imagen_url = '/Imagenes/perfume.png' WHERE titulo = 'Perfume';
UPDATE productos SET imagen_url = '/Imagenes/diario_de_ana_frank.png' WHERE titulo = 'Diario de Ana Frank';
UPDATE productos SET imagen_url = '/Imagenes/viagem_ao_centro_da_terra.png' WHERE titulo = 'Viagem ao Centro da Terra';
UPDATE productos SET imagen_url = '/Imagenes/don_quijote_de_la_mancha.png' WHERE titulo = 'Don Quijote de la Mancha';
UPDATE productos SET imagen_url = '/Imagenes/el_instituto.png' WHERE titulo = 'El Instituto';
UPDATE productos SET imagen_url = '/Imagenes/el_hobbit.png' WHERE titulo = 'El Hobbit';
UPDATE productos SET imagen_url = '/Imagenes/Cuando_Reescribamos_La_Historia.png' WHERE titulo = 'Cuando Reescribamos La Historia';

-- Fallback por rutas antiguas para bases con catálogo previo
UPDATE productos SET imagen_url = '/Imagenes/The_Sisters_Brothers.png' WHERE imagen_url = '/Imagenes/Libro1.png';
UPDATE productos SET imagen_url = '/Imagenes/perfume.png' WHERE imagen_url = '/Imagenes/Libro2.png';
UPDATE productos SET imagen_url = '/Imagenes/diario_de_ana_frank.png' WHERE imagen_url = '/Imagenes/Libro3.png';
UPDATE productos SET imagen_url = '/Imagenes/viagem_ao_centro_da_terra.png' WHERE imagen_url = '/Imagenes/Libro4.png';
UPDATE productos SET imagen_url = '/Imagenes/don_quijote_de_la_mancha.png' WHERE imagen_url = '/Imagenes/Libro5.png';
UPDATE productos SET imagen_url = '/Imagenes/el_instituto.png' WHERE imagen_url = '/Imagenes/Libro6.png';
UPDATE productos SET imagen_url = '/Imagenes/el_hobbit.png' WHERE imagen_url = '/Imagenes/Libro7.png';
UPDATE productos SET imagen_url = '/Imagenes/Cuando_Reescribamos_La_Historia.png' WHERE imagen_url = '/Imagenes/Libro8.png';
