document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-contacto');
  const contenedorContactos = document.getElementById('contenedor-contactos');
  const totalContactos = document.getElementById('total-contactos');

  // Función para obtener y listar los contactos desde el CSV
  async function cargarContactos() {
    try {
      const res = await fetch('/api/contactos');
      const contactos = await res.json();
      
      contenedorContactos.innerHTML = '';
      totalContactos.textContent = `${contactos.length} contacto${contactos.length === 1 ? '' : 's'}`;

      if (contactos.length === 0) {
        contenedorContactos.innerHTML = '<p style="color: #64748b; grid-column: 1/-1;">No hay contactos guardados en el archivo CSV.</p>';
        return;
      }

      contactos.forEach(contacto => {
        const div = document.createElement('div');
        div.className = 'card-contacto';
        
        const avatarUrl = contacto.imagen && contacto.imagen.startsWith('http') 
          ? contacto.imagen 
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

        div.innerHTML = `
          <img src="${avatarUrl}" alt="Avatar" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'">
          <h3>${contacto.nombre} ${contacto.apellido}</h3>
          <p>📞 ${contacto.telefono}</p>
          <p>✉️ ${contacto.email}</p>
          <button class="btn-eliminar" onclick="eliminarContacto('${contacto.id}')">Eliminar</button>
        `;
        contenedorContactos.appendChild(div);
      });
    } catch (error) {
      console.error('Error al cargar contactos:', error);
    }
  }

  // Enviar y persistir nuevo contacto
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nuevo = {
      nombre: document.getElementById('nombre').value,
      apellido: document.getElementById('apellido').value,
      telefono: document.getElementById('telefono').value,
      email: document.getElementById('email').value,
      imagen: document.getElementById('imagen').value
    };

    try {
      const res = await fetch('/api/contactos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo)
      });

      if (res.ok) {
        form.reset();
        cargarContactos();
      }
    } catch (error) {
      console.error('Error al registrar contacto:', error);
    }
  });

  // Exponer función de borrado a nivel global
  window.eliminarContacto = async (id) => {
    if (!confirm('¿Desea eliminar este contacto de la agenda CSV?')) return;
    try {
      const res = await fetch(`/api/contactos/${id}`, { method: 'DELETE' });
      if (res.ok) cargarContactos();
    } catch (error) {
      console.error('Error al eliminar contacto:', error);
    }
  };

  cargarContactos();
});