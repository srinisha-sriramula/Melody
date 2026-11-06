import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Music2, Upload, Disc3, LogOut, Home, PlusCircle } from 'lucide-react';
import API from '../services/api';

function ArtistDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [musicFile, setMusicFile] = useState(null);
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [albumTitle, setAlbumTitle] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const loadArtistData = useCallback(async () => {
    try {
      const [songResponse, albumResponse] = await Promise.all([
        API.get('/music/my-songs'),
        API.get('/music/my-albums')
      ]);
      setSongs(songResponse.data.musics || []);
      setAlbums(albumResponse.data.albums || []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not load your music.');
    }
  }, []);

  useEffect(() => { loadArtistData(); }, [loadArtistData]);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!musicFile) return setMessage('Please choose an audio file.');
    const form = new FormData();
    form.append('title', title.trim());
    form.append('music', musicFile);
    try {
      setBusy(true); setMessage('');
      const response = await API.post('/music/upload', form);
      setMessage(response.data.message);
      setTitle(''); setMusicFile(null);
      event.target.reset();
      await loadArtistData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Upload failed. Check your connection and ImageKit settings.');
    } finally { setBusy(false); }
  };

  const handleCreateAlbum = async (event) => {
    event.preventDefault();
    try {
      setBusy(true); setMessage('');
      const response = await API.post('/music/album', {
        title: albumTitle.trim(), musics: selectedSongs
      });
      setMessage(response.data.message);
      setAlbumTitle(''); setSelectedSongs([]);
      await loadArtistData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not create album.');
    } finally { setBusy(false); }
  };

  const handleLogout = async () => {
    try { await logout(); navigate('/login'); }
    catch { setMessage('Logout failed. Please try again.'); }
  };

  return (
    <div className="artist-dashboard">
      <aside className="artist-sidebar">
        <h2><Music2 size={27} /> Melody</h2>
        <p className="artist-menu-heading">ARTIST MENU</p>
        <button onClick={() => navigate('/')}><Home size={19} /> Home</button>
        <button className="artist-active"><Disc3 size={19} /> Dashboard</button>
        <button onClick={handleLogout}><LogOut size={19} /> Logout</button>
      </aside>

      <main className="artist-main">
        <header className="artist-header">
          <div><h1>Artist Dashboard</h1><p>Manage your music and albums.</p></div>
          <span>Welcome, {user?.username || 'Artist'}</span>
        </header>

        <section className="artist-welcome">
          <p>WELCOME TO MELODY</p>
          <h2>Share your music with the world.</h2>
          <p>Upload songs and create your own albums.</p>
        </section>

        <section className="upload-section">
          <h2><Upload size={23} /> Upload New Song</h2>
          <form onSubmit={handleUpload}>
            <label>Song Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Enter song title" required />
            <label>Select Audio File (maximum 25 MB)</label>
            <input type="file" accept="audio/*" onChange={e => setMusicFile(e.target.files?.[0] || null)} required />
            <button type="submit" disabled={busy}><Upload size={18} /> {busy ? 'Please wait...' : 'Upload Song'}</button>
          </form>
          {message && <p className="artist-message" role="status">{message}</p>}
        </section>

        <section className="artist-data-section">
          <h2>Your Songs ({songs.length})</h2>
          {songs.length === 0 ? <p>You have not uploaded any songs yet.</p> :
            <div className="artist-song-list">
              {songs.map(song => <label className="artist-song-row" key={song._id}>
                <input type="checkbox" checked={selectedSongs.includes(song._id)}
                  onChange={e => setSelectedSongs(old => e.target.checked ? [...old, song._id] : old.filter(id => id !== song._id))} />
                <span><strong>{song.title}</strong><small>Select for an album</small></span>
                <audio controls preload="none" src={song.uri}>Audio playback is not supported.</audio>
              </label>)}
            </div>
          }
        </section>

        <section className="upload-section album-create-section">
          <h2><PlusCircle size={23} /> Create Album</h2>
          <form onSubmit={handleCreateAlbum}>
            <label>Album Title</label>
            <input value={albumTitle} onChange={e => setAlbumTitle(e.target.value)}
              placeholder="Enter album title" required />
            <p>{selectedSongs.length} song(s) selected</p>
            <button type="submit" disabled={busy || selectedSongs.length === 0}>Create Album</button>
          </form>
        </section>

        <section className="artist-data-section">
          <h2>Your Albums ({albums.length})</h2>
          {albums.length === 0 ? <p>No albums created yet.</p> :
            <div className="artist-album-grid">
              {albums.map(album => <article className="artist-album-card" key={album._id}>
                <h3>{album.title}</h3><p>{album.musics?.length || 0} songs</p>
                {album.musics?.map(song => <p key={song._id}>{song.title}</p>)}
              </article>)}
            </div>
          }
        </section>
      </main>
    </div>
  );
}

export default ArtistDashboard;
