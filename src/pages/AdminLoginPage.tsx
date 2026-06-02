import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.token);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1115] px-4 font-sans text-[#F8FAFC]">
      <Card className="w-full max-w-sm rounded-xl bg-[#1A1D23] border border-[#2D323C] shadow-2xl text-[#F8FAFC]">
        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto mb-4 w-12 h-12 bg-[#C2A35D] rounded flex items-center justify-center font-bold text-black text-2xl">
            N
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight">Norma Admin</CardTitle>
          <CardDescription className="text-[#94A3B8]">Sign in to manage the menu system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 pb-4">
            {error && (
              <div className="p-3 text-[13px] text-red-400 bg-red-900/20 border border-red-500/20 rounded-md text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Email</Label>
              <Input 
                id="email" 
                type="email" 
                required 
                className="h-10 rounded-md bg-[#0F1115] border-[#2D323C] text-[#F8FAFC] focus-visible:ring-[#C2A35D] focus-visible:ring-offset-0 focus-visible:border-[#C2A35D]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                className="h-10 rounded-md bg-[#0F1115] border-[#2D323C] text-[#F8FAFC] focus-visible:ring-[#C2A35D] focus-visible:ring-offset-0 focus-visible:border-[#C2A35D]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-10 rounded-md bg-[#C2A35D] text-black font-semibold hover:bg-[#E5C170] shadow-lg shadow-[#C2A35D30] border-0 mt-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
