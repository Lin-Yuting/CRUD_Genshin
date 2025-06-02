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
    fetchCharacters()
  }, [])

  async function fetchCharacters() {
    const { data, error } = await supabase
      .from('Character')
      .select('*')
      .order('id', { ascending: true })
    if (error) setError(error.message)
    else setChars(data)
  }

  // Crear / actualizar personajes
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const payload = { ...form }
    if (editingId) {
      const { error } = await supabase
        .from('Character')
        .update(payload)
        .eq('id', editingId)
      if (error) setError(error.message)
      else {
        resetForm()
        fetchCharacters()
      }
    } else {
      const { error } = await supabase
        .from('Character')
        .insert(payload)
      if (error) setError(error.message)
      else {
        resetForm()
        fetchCharacters()
      }
    }
  }

  // Editar
  function startEdit(char) {
    setEditingId(char.id)
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

  // Eliminar un personaje
  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this character?')) return
    const { error } = await supabase
      .from('Character')
      .delete()
      .eq('id', id)
    if (error) setError(error.message)
    else fetchCharacters()
  }

  function resetForm() {
    setEditingId(null)
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

  // Buscar (filtrar personajes)
  const filtered = chars.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div id="root">
      <div className="title-container">
        <div className="header-box">
          <h1>Genshin Impact: Characters Organization</h1>
          <p>Explore and manage your favorite characters.</p>
        </div>
      </div>

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
                required
              />
            </div>
          ))}
        </div>
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
        {filtered.map(char => (
          <div key={char.id} className="card">
            {char.imageUrl && (
              <img src={char.imageUrl} alt={char.name} className="card-img" />
            )}
            <div className="card-content">
              <h3>{char.name}</h3>
              <p className="subtext">{char.gender} • {char.region}</p>
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
                <button onClick={() => startEdit(char)} className="btn-edit">
                  Edit
                </button>
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


