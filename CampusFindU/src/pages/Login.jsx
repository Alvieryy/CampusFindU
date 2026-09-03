import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError(error.message);
    } else {

      navigate('/dashboard'); 
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Login</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' }}>
        <input type="email" placeholder="Email" required onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" required onChange={e => setPassword(e.target.value)} />
        <button type="submit">Log In</button>
      </form>
    </div>
  );
}