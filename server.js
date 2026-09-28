const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const CSV_FILE = path.join(__dirname, 'contactos.csv');

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar CSV si no existe
if (!fs.existsSync(CSV_FILE)) {
  fs.writeFileSync(CSV_FILE, 'id,nombre,apellido,telefono,email,imagen\n', 'utf8');
}

// Función auxiliar: Leer CSV a array de objetos
function leerCSV() {
  const contenido = fs.readFileSync(CSV_FILE, 'utf8');
  const lineas = contenido.trim().split('\n');
  if (lineas.length <= 1) return [];

  const contactos = [];
  for (let i = 1; i < lineas.length; i++) {
    const fila = lineas[i];
    if (!fila.trim()) continue;

    // Decodificar campos separados por coma
    const campos = fila.split(';');
    if (campos.length >= 6) {
      contactos.push({
        id: campos[0],
        nombre: campos[1],
        apellido: campos[2],
        telefono: campos[3],
        email: campos[4],
        imagen: campos[5]
      });
    }
  }
  return contactos;
}

// Función auxiliar: Guardar array en CSV
function guardarCSV(contactos) {
  let contenido = 'id;nombre;apellido;telefono;email;imagen\n';
  contactos.forEach(c => {
    contenido += `${c.id};${c.nombre};${c.apellido};${c.telefono};${c.email};${c.imagen}\n`;
  });
  fs.writeFileSync(CSV_FILE, contenido, 'utf8');
}

// GET: Obtener todos los contactos
app.get('/api/contactos', (req, res) => {
  try {
    const contactos = leerCSV();
    res.json(contactos);
  } catch (err) {
    res.status(500).json({ error: 'Error al leer el archivo CSV' });
  }
});

// POST: Registrar nuevo contacto
app.post('/api/contactos', (req, res) => {
  try {
    const { nombre, apellido, telefono, email, imagen } = req.body;
    const contactos = leerCSV();
    
    const nuevoContacto = {
      id: Date.now().toString(),
      nombre: (nombre || '').trim(),
      apellido: (apellido || '').trim(),
      telefono: (telefono || '').trim(),
      email: (email || '').trim(),
      imagen: (imagen || 'https://via.placeholder.com/150').trim()
    };

    contactos.push(nuevoContacto);
    guardarCSV(contactos);
    res.status(201).json(nuevoContacto);
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar en el CSV' });
  }
});

// DELETE: Eliminar un contacto
app.delete('/api/contactos/:id', (req, res) => {
  try {
    const { id } = req.params;
    let contactos = leerCSV();
    contactos = contactos.filter(c => c.id !== id);
    guardarCSV(contactos);
    res.json({ mensaje: 'Contacto eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el CSV' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de Agenda activo en http://localhost:${PORT}`);
});