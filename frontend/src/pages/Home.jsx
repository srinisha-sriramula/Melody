import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Search, Library, Heart, Play, Pause, SkipBack, SkipForward, Volume2, Music2 } from 'lucide-react';
import API from '../services/api';

function Home() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [likedIds, setLikedIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [search, setSearch] = useState('');
  const [volume, setVolume] = useState(0.8);
  const [message, setMessage] = useState('');

  const loadContent = useCallback(async () => {
    try {
      const [songResult, albumResult] = await Promise.all([
        API.get('/music/'), API.get('/music/albums')
      ]);
      setSongs(songResult.data.musics || []);
      setAlbums(albumResult.data.albums || []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Please login to browse music.');
    }
  }, []);

  useEffect(() => { if (user) loadContent(); }, [user, loadContent]);

  useEffect(() => {
    if (!user) { setLikedIds([]); return; }
    API.get('/music/liked').then(r => setLikedIds((r.data.musics || []).map(s => s._id))).catch(() => {});
  }, [user]);

  const currentSong = songs[currentIndex] || null;
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    audio.volume = volume;
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [currentSong, isPlaying, volume]);

  const playSong = (song) => {
    const index = songs.findIndex(item => item._id === song._id);
    if (index >= 0) { setCurrentIndex(index); setIsPlaying(true); }
  };
  const changeSong = (direction) => {
    if (!songs.length) return;
    setCurrentIndex(index => (index + direction + songs.length) % songs.length);
    setIsPlaying(true);
  };
  const toggleLike = async (songId) => {
    try {
      const result = await API.post(`/music/${songId}/like`);
      setLikedIds(old => result.data.liked ? [...old, songId] : old.filter(id => id !== songId));
    } catch (error) { setMessage(error.response?.data?.message || 'Please login to like songs.'); }
  };
  const handleLogout = async () => {
    try { await logout(); setSongs([]); navigate('/login'); }
    catch { setMessage('Logout failed.'); }
  };

  const filteredSongs = songs.filter(song =>
    `${song.title} ${song.artist?.username || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2 className="logo"><Music2 size={28} /> Melody</h2>
        <p className="menu-heading">MENU</p>
        <nav>
          <a className="nav-link active" href="/"><HomeIcon size={20} /> Home</a>
          <a className="nav-link" href="#search"><Search size={20} /> Search</a>
          <a className="nav-link" href="#albums"><Library size={20} /> Albums</a>
        </nav>
        <p className="menu-heading">YOUR COLLECTION</p>
        <nav><a className="nav-link" href="#songs"><Heart size={20} /> Liked Songs</a></nav>
        {user?.role === 'artist' && <button className="nav-link" onClick={() => navigate('/artist-dashboard')}>Artist Dashboard</button>}
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div><h2>Good music, good mood.</h2><p>Discover your favourite music today.</p></div>
          <div className="user-profile">
            {!loading && (user ? <><span>Hi, {user.username}</span><button className="profile-button" onClick={handleLogout}>Logout</button></> :
              <button className="profile-button" onClick={() => navigate('/login')}>Login</button>)}
          </div>
        </header>

        <section className="hero">
          <div><p className="hero-label">YOUR MUSIC WORLD</p><h1>Feel every beat.</h1>
            <p>Discover songs that match your mood and make every moment special.</p>
            <button className="hero-button" onClick={() => currentSong ? (setIsPlaying(true), audioRef.current?.play()) : setMessage('Upload songs from an artist account first.')}>
              <Play size={18} fill="currentColor" /> Play Music
            </button>
          </div>
        </section>

        {message && <p className="home-message">{message}</p>}
        <section className="music-section" id="search">
          <div className="section-heading"><h2>Explore Music</h2></div>
          <input className="music-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search songs or artists..." />
          <div className="music-grid" id="songs">
            {filteredSongs.map(song => <article className="music-card" key={song._id}>
              <div className="album-cover cover-one"><Music2 size={48} />
                <button className="card-play" onClick={() => playSong(song)} aria-label={`Play ${song.title}`}><Play size={20} fill="currentColor" /></button>
              </div>
              <h3>{song.title}</h3><p>{song.artist?.username || 'Unknown artist'}</p>
              <button className="like-song-button" onClick={() => toggleLike(song._id)} aria-label="Like song">
                <Heart size={18} fill={likedIds.includes(song._id) ? 'currentColor' : 'none'} />
                {likedIds.includes(song._id) ? 'Liked' : 'Like'}
              </button>
            </article>)}
          </div>
          {filteredSongs.length === 0 && <p>No songs found. Ask an artist to upload music.</p>}
        </section>

        <section className="music-section" id="albums">
          <div className="section-heading"><h2>Albums</h2></div>
          <div className="album-list-grid">
            {albums.map(album => <article className="artist-album-card" key={album._id}>
              <h3>{album.title}</h3><p>By {album.artist?.username || 'Artist'}</p>
              {(album.musics || []).map(song => <p key={song._id}>{song.title}</p>)}
            </article>)}
          </div>
          {albums.length === 0 && <p>No albums available yet.</p>}
        </section>
      </main>

      <footer className="player">
        <div className="playing-song"><div className="mini-cover"><Music2 size={22} /></div>
          <div><h4>{currentSong?.title || 'Choose a song'}</h4><p>{currentSong?.artist?.username || 'Melody'}</p></div>
        </div>
        <div className="player-controls">
          <div className="control-buttons">
            <button onClick={() => changeSong(-1)} aria-label="Previous song"><SkipBack size={20} /></button>
            <button className="play-button" onClick={() => currentSong && setIsPlaying(v => !v)} aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <button onClick={() => changeSong(1)} aria-label="Next song"><SkipForward size={20} /></button>
          </div>
          <audio ref={audioRef} src={currentSong?.uri || ''} onEnded={() => changeSong(1)} onError={() => setIsPlaying(false)} />
        </div>
        <div className="volume"><Volume2 size={20} /><input aria-label="Volume" type="range" min="0" max="1" step="0.05" value={volume} onChange={e => setVolume(Number(e.target.value))} /></div>
      </footer>
    </div>
  );
}

export default Home;
