const contactForm = document.getElementById('contact-form');
const contactIdInput = document.getElementById('contact-id');
const nombreInput = document.getElementById('nombre');
const telefonoInput = document.getElementById('telefono');
const emailInput = document.getElementById('email');
const formTitle = document.getElementById('form-title');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');
const contactsTableBody = document.getElementById('contacts-table-body');
const totalContactos = document.getElementById('total-contactos');
const searchInput = document.getElementById('search-input');
const emptyState = document.getElementById('empty-state');

let contacts = [];

async function fetchContacts() {
  try {
    const res = await fetch('/api/contactos');
    contacts = await res.json();
    renderContacts();
  } catch (error) {
    console.error('Error al cargar contactos:', error);
  }
}

function renderContacts() {
  const query = searchInput.value.toLowerCase().trim();
  const filtered = contacts.filter(c => 
    (c.nombre && c.nombre.toLowerCase().includes(query)) ||
    (c.telefono && c.telefono.toLowerCase().includes(query)) ||
    (c.email && c.email.toLowerCase().includes(query))
  );

  totalContactos.textContent = `${contacts.length} contacto(s) en total`;
  contactsTableBody.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  filtered.forEach(contact => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition-colors';

    tr.innerHTML = `
      <td class="py-4 px-6 font-medium text-slate-900 whitespace-nowrap">${escapeHTML(contact.nombre)}</td>
      <td class="py-4 px-6 text-slate-600">${escapeHTML(contact.telefono)}</td>
      <td class="py-4 px-6 text-slate-600">${escapeHTML(contact.email)}</td>
      <td class="py-4 px-6 text-right whitespace-nowrap">
        <button 
          onclick="handleEdit('${contact.id}')" 
          class="text-blue-600 hover:text-blue-800 font-medium mr-3 text-xs uppercase tracking-wide cursor-pointer transition-colors"
        >
          Editar
        </button>
        <button 
          onclick="handleDelete('${contact.id}')" 
          class="text-red-600 hover:text-red-800 font-medium text-xs uppercase tracking-wide cursor-pointer transition-colors"
        >
          Eliminar
        </button>
      </td>
    `;
    contactsTableBody.appendChild(tr);
  });
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

window.handleEdit = function(id) {
  const contact = contacts.find(c => String(c.id) === String(id));
  if (!contact) return;

  contactIdInput.value = contact.id;
  nombreInput.value = contact.nombre;
  telefonoInput.value = contact.telefono;
  emailInput.value = contact.email;

  formTitle.textContent = 'Editar Contacto';
  btnGuardar.textContent = 'Actualizar';
  btnCancelar.classList.remove('hidden');

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.handleDelete = async function(id) {
  if (!confirm('¿Seguro que deseas eliminar este contacto?')) return;

  try {
    const res = await fetch(`/api/contactos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      contacts = contacts.filter(c => String(c.id) !== String(id));
      renderContacts();
      resetForm();
    }
  } catch (error) {
    console.error('Error al eliminar contacto:', error);
  }
};

function resetForm() {
  contactForm.reset();
  contactIdInput.value = '';
  formTitle.textContent = 'Nuevo Contacto';
  btnGuardar.textContent = 'Guardar Contacto';
  btnCancelar.classList.add('hidden');
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = contactIdInput.value;
  const payload = {
    nombre: nombreInput.value.trim(),
    telefono: telefonoInput.value.trim(),
    email: emailInput.value.trim()
  };

  try {
    if (id) {
      const res = await fetch(`/api/contactos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        const idx = contacts.findIndex(c => String(c.id) === String(id));
        if (idx !== -1) contacts[idx] = updated;
      }
    } else {
      const res = await fetch('/api/contactos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const created = await res.json();
        contacts.push(created);
      }
    }

    resetForm();
    renderContacts();
  } catch (error) {
    console.error('Error al guardar contacto:', error);
  }
});

btnCancelar.addEventListener('click', resetForm);
searchInput.addEventListener('input', renderContacts);

fetchContacts();