import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid #ddd' }}>
      <Link to="/reports" style={{ textDecoration: 'none' }}>Title test</Link>
      <Link to="/create">+ Buat Laporan</Link>
    </nav>
  );
}