// Importar hooks, instancias de Supabase y los estilos CSS
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import './App.css'

export default function App() {
  const [chars, setChars] = useState([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    name: '',
    gender: '',
    region: '',
    element: '',
    weaponType: '',
    equippedWeapon: '',
    equippedArtifactSet: '',
    imageUrl: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  // Datos Inicales
  useEffect(() => {
    // Obtener personajes desde Supabase
    fetchCharacters()
  }, [])

  // Obtener personajes desde la tabla "Character" en Supabase por su id y en orden ascendiente
  async function fetchCharacters() {
    const { data, error } = await supabase
      .from('Character')
      .select('*')
      .order('id', { ascending: true })
    if (error) setError(error.message)
    else setChars(data)
  }

  // Crear o actualizar personajes según exista editingId
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const payload = { ...form } // Copiar valores del formulario
    if (editingId) {
      // Si editingId tiene valor, actualizar personaje existente
      const { error } = await supabase
        .from('Character')
        .update(payload)  // update
        .eq('id', editingId) //hacer el filtro por id
      if (error) setError(error.message)
      else {
        resetForm()  // Limpiar formulario y estado de edición
        fetchCharacters()  // Volver a cargar los personajes
      }
    } else {
      // Si no hay editingId, insertar nuevo personaje
      const { error } = await supabase
        .from('Character')
        .insert(payload)  // Insertar nuevo personaje
      if (error) setError(error.message)
      else {
        resetForm()  // Limpiar formulario y estado de edición
        fetchCharacters()  // Volver a cargar los personajes
      }
    }
  }

  // Editar
  function startEdit(char) {
    setEditingId(char.id)  // Establecer id del personaje para editar
    setForm({
      name: char.name,
      gender: char.gender,
      region: char.region,
      element: char.element,
      weaponType: char.weaponType,
      equippedWeapon: char.equippedWeapon,
      equippedArtifactSet: char.equippedArtifactSet,
      imageUrl: char.imageUrl
    })
    setError('')
  }

  // Eliminar un personaje por id
  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this character?')) return // confirmacion de eliminacion
    const { error } = await supabase
      .from('Character')
      .delete()  // Eliminar personaje
      .eq('id', id)  // Filtrar por id
    if (error) setError(error.message)
    else fetchCharacters()
  }

  // Reiniciar estado del formulario y de edición
  function resetForm() {
    setEditingId(null)  // Quitar el editionId
    // Limpiar campos del formulario
    setForm({
      name: '',
      gender: '',
      region: '',
      element: '',
      weaponType: '',
      equippedWeapon: '',
      equippedArtifactSet: '',
      imageUrl: ''
    })
    setError('')
  }

  // Filtrar personajes según el valor de búsqueda (search)
  const filtered = chars.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div id="root">
      <div className="title-container">
        <div className="header-box">
          {/* Titulo y subtitulo de la pagina */}
          <h1>Genshin Impact: Characters Organization</h1>
          <p>Explore and manage your favorite characters.</p>
        </div>
      </div>

      {/* Buscar personajes por su nombre */}
      <div className="serarch">
        <input
          type="text"
          placeholder="Search Character..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button onClick={resetForm}>Search</button>
      </div>

      <form onSubmit={handleSubmit} className="form-box">
        {error && <p className="error-text">{error}</p>}
        <div className="form-grid">
          {Object.entries(form).map(([key, val]) => (
            <div key={key} className="form-field">
              <label>{key.replace(/([A-Z])/g, ' $1')}</label>
              <input
                value={val}
                onChange={e =>
                  setForm(f => ({ ...f, [key]: e.target.value }))
                }
                required /* Campos obligatorios */
              />
            </div>
          ))}
        </div>
        
        {/* Si esta editando mostrar los botones de cancel y Update, si no solo Add */}
        <div className="form-actions">
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-cancel">
              Cancel
            </button>
          )}
          <button className="btn-submit">
            {editingId ? 'Update' : 'Add'}
          </button>
        </div>
      </form>

      {/* Lista de tarjetas */}
      <div className="cards-container">
        {/* Recorrer lista filtrada de personajes */}
        {filtered.map(char => (
          <div key={char.id} className="card">
             {/* Mostrar la imagen de personajes */}
            {char.imageUrl && (
              <img src={char.imageUrl} alt={char.name} className="card-img" />
            )}
            <div className="card-content">
              {/* Nombre del personaje */}
              <h3>{char.name}</h3>
              {/* Genero y region del personaje */}
              <p className="subtext">{char.gender} • {char.region}</p>
              {/* Informacion del personaje en lista */}
              <ul>
                <li>
                  <strong>Element:</strong> {char.element}
                </li>
                <li>
                  <strong>Weapon Type:</strong> {char.weaponType}
                </li>
                <li>
                  <strong>Weapon:</strong> {char.equippedWeapon}
                </li>
                <li>
                  <strong>Artifact:</strong> {char.equippedArtifactSet}
                </li>
              </ul>
              <div className="card-actions">
                {/* Botón para editar personaje */}
                <button onClick={() => startEdit(char)} className="btn-edit">
                  Edit
                </button>
                {/* Botón para eliminar personaje */}
                <button
                  onClick={() => handleDelete(char.id)}
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


