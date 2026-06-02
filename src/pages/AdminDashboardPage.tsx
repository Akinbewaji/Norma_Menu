import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, LogOut, Loader2, Trash2, Edit2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Category, MenuItem } from '../types';

export default function AdminDashboardPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<MenuItem>>({});
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});

  const fetchItems = async () => {
    const res = await fetch('/api/menu/items');
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/menu/categories');
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    Promise.all([fetchCategories(), fetchItems()])
      .then(() => setLoading(false))
      .catch(console.error);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const apiCall = async (url: string, method: string, body?: any) => {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: body ? JSON.stringify(body) : undefined
    });
    if (res.status === 401) handleLogout();
    if (!res.ok) throw new Error('API Error');
    return res.json();
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentItem.id) {
        await apiCall(`/api/admin/items/${currentItem.id}`, 'PUT', currentItem);
      } else {
        await apiCall('/api/admin/items', 'POST', currentItem);
      }
      setIsItemModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error(err);
      alert('Failed to save item');
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await apiCall(`/api/admin/items/${id}`, 'DELETE');
      fetchItems();
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentCategory.id) {
        await apiCall(`/api/admin/categories/${currentCategory.id}`, 'PUT', currentCategory);
      } else {
        await apiCall('/api/admin/categories', 'POST', currentCategory);
      }
      setIsCatModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert('Failed to save category');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0F1115]"><Loader2 className="animate-spin text-[#C2A35D]" /></div>;
  }

  return (
    <>
      <div className="min-h-screen bg-[#0F1115] text-[#F8FAFC] font-sans flex flex-col overflow-hidden relative">
        {/* Top Navigation / Brand Bar */}
        <header className="h-16 border-b border-[#2D323C] bg-[#1A1D23] px-8 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C2A35D] rounded flex items-center justify-center font-bold text-black">N</div>
          <h1 className="text-xl font-semibold tracking-tight">Norma <span className="text-[#94A3B8] font-normal text-sm ml-2 hidden sm:inline">Admin System</span></h1>
        </div>
        <div className="flex gap-4 items-center">
          <div className="px-3 py-1 bg-[#2D323C] rounded-full text-xs text-[#94A3B8] uppercase tracking-wider hidden sm:block">Admin</div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C2A35D] to-[#E5C170]"></div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <nav className="w-64 border-r border-[#2D323C] bg-[#14171C] p-6 hidden md:flex flex-col gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#4B5563] uppercase tracking-widest px-2 mb-2 block">Menu Management</label>
            <button 
              onClick={() => setActiveTab('items')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left ${activeTab === 'items' ? 'text-[#C2A35D] bg-[#C2A35D15] rounded-md font-medium' : 'text-[#94A3B8] hover:text-white transition-colors'}`}
            >
              Menu Items
            </button>
            <button 
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left ${activeTab === 'categories' ? 'text-[#C2A35D] bg-[#C2A35D15] rounded-md font-medium' : 'text-[#94A3B8] hover:text-white transition-colors'}`}
            >
              Categories
            </button>
            <button 
              onClick={() => navigate('/admin/qr-codes')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-[#94A3B8] hover:text-white transition-colors"
            >
              Table QR Codes
            </button>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#4B5563] uppercase tracking-widest px-2 mb-2 block">System</label>
            <button 
              onClick={() => navigate('/admin/logs')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-[#94A3B8] hover:text-white transition-colors"
            >
              Audit Logs
            </button>
          </div>
          <div className="mt-auto space-y-4">
            <div className="p-4 bg-[#1A1D23] border border-[#2D323C] rounded-lg">
              <p className="text-xs text-[#94A3B8] mb-2">System Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-[11px] font-mono text-[#94A3B8]">Connected</span>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start text-[#94A3B8] hover:text-white hover:bg-[#2D323C] h-9 px-3" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#0F1115]">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold">
                  {activeTab === 'items' ? 'Menu Items' : 'Categories'}
                </h2>
                <p className="text-[#94A3B8] text-sm mt-1">Manage your restaurant offerings and pricing.</p>
              </div>
              <Button 
                className="bg-[#C2A35D] text-black font-semibold rounded-md shadow-lg shadow-[#C2A35D30] hover:bg-[#E5C170] border-0"
                onClick={() => {
                  if (activeTab === 'items') {
                    setCurrentItem({ available: true, price: 0 });
                    setIsItemModalOpen(true);
                  } else {
                    setCurrentCategory({});
                    setIsCatModalOpen(true);
                  }
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add New
              </Button>
            </div>

            <div className="bg-[#1A1D23] rounded-xl border border-[#2D323C] overflow-hidden">
            {activeTab === 'items' ? (
              <Table>
                <TableHeader className="bg-[#242931]/50 [&_th]:text-[#94A3B8] [&_th]:uppercase [&_th]:text-[10px] [&_th]:tracking-wider [&_th]:border-b-[#2D323C]">
                  <TableRow className="border-b border-[#2D323C] hover:bg-transparent">
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_tr]:border-b-[#2D323C]">
                  {items.map(item => (
                    <TableRow key={item.id} className="hover:bg-[#2D323C30] border-b border-[#2D323C]">
                      <TableCell className="font-medium text-[#F8FAFC]">{item.name}</TableCell>
                      <TableCell className="text-[#94A3B8]">{item.category_name}</TableCell>
                      <TableCell className="font-mono">₦{item.price}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${item.available ? 'bg-green-900/30 text-green-400 border-green-500/20' : 'bg-red-900/30 text-red-400 border-red-500/20'}`}>
                          {item.available ? 'Active' : 'Hidden'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" className="hover:bg-[#2D323C] text-[#94A3B8]" onClick={() => { setCurrentItem(item); setIsItemModalOpen(true); }}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-red-900/30 text-red-400" onClick={() => handleDeleteItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader className="bg-[#242931]/50 [&_th]:text-[#94A3B8] [&_th]:uppercase [&_th]:text-[10px] [&_th]:tracking-wider [&_th]:border-b-[#2D323C]">
                  <TableRow className="border-b border-[#2D323C] hover:bg-transparent">
                    <TableHead>Category Name</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_tr]:border-b-[#2D323C]">
                  {categories.map(cat => (
                    <TableRow key={cat.id} className="hover:bg-[#2D323C30] border-b border-[#2D323C]">
                      <TableCell className="font-medium text-[#F8FAFC]">{cat.name}</TableCell>
                      <TableCell className="text-[#94A3B8]">{cat.display_order}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" className="hover:bg-[#2D323C] text-[#94A3B8]" onClick={() => { setCurrentCategory(cat); setIsCatModalOpen(true); }}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
    </div>
    </div>

    {/* Item Modal */}
    <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
      <DialogContent className="sm:max-w-[425px] rounded-xl bg-[#1A1D23] border border-[#2D323C] text-[#F8FAFC]">
        <DialogHeader>
          <DialogTitle>{currentItem.id ? 'Edit Item' : 'New Menu Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSaveItem} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Name</Label>
            <Input required value={currentItem.name || ''} onChange={e => setCurrentItem({...currentItem, name: e.target.value})} className="rounded-md bg-[#0F1115] border-[#2D323C] text-[#F8FAFC] focus-visible:ring-[#C2A35D]" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Category</Label>
            <select 
              required
              className="w-full h-10 px-3 py-2 rounded-md bg-[#0F1115] border border-[#2D323C] text-sm text-[#F8FAFC] focus-visible:ring-[#C2A35D]"
              value={currentItem.category_id || ''} 
              onChange={e => setCurrentItem({...currentItem, category_id: parseInt(e.target.value)})}
            >
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Price</Label>
            <Input required type="number" step="0.01" value={currentItem.price || ''} onChange={e => setCurrentItem({...currentItem, price: e.target.value})} className="rounded-md bg-[#0F1115] border-[#2D323C] text-[#F8FAFC] focus-visible:ring-[#C2A35D] font-mono" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Description</Label>
            <Input value={currentItem.description || ''} onChange={e => setCurrentItem({...currentItem, description: e.target.value})} className="rounded-md bg-[#0F1115] border-[#2D323C] text-[#F8FAFC] focus-visible:ring-[#C2A35D]" />
          </div>
          <div className="flex items-center space-x-2 py-2">
            <input type="checkbox" id="available" checked={currentItem.available} onChange={e => setCurrentItem({...currentItem, available: e.target.checked})} className="rounded bg-[#0F1115] border-[#2D323C] text-[#C2A35D] focus:ring-[#C2A35D]" />
            <Label htmlFor="available" className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Available to Customers</Label>
          </div>
          <Button type="submit" className="w-full rounded-md bg-[#C2A35D] text-black font-semibold hover:bg-[#E5C170] shadow-lg shadow-[#C2A35D30]">Save Item</Button>
        </form>
      </DialogContent>
    </Dialog>

    {/* Category Modal */}
    <Dialog open={isCatModalOpen} onOpenChange={setIsCatModalOpen}>
      <DialogContent className="sm:max-w-[425px] rounded-xl bg-[#1A1D23] border border-[#2D323C] text-[#F8FAFC]">
        <DialogHeader>
          <DialogTitle>{currentCategory.id ? 'Edit Category' : 'New Category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSaveCategory} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Name</Label>
            <Input required value={currentCategory.name || ''} onChange={e => setCurrentCategory({...currentCategory, name: e.target.value})} className="rounded-md bg-[#0F1115] border-[#2D323C] text-[#F8FAFC] focus-visible:ring-[#C2A35D]" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Display Order (Lower is first)</Label>
            <Input required type="number" value={currentCategory.display_order || 0} onChange={e => setCurrentCategory({...currentCategory, display_order: parseInt(e.target.value)})} className="rounded-md bg-[#0F1115] border-[#2D323C] text-[#F8FAFC] focus-visible:ring-[#C2A35D] font-mono" />
          </div>
          <Button type="submit" className="w-full rounded-md bg-[#C2A35D] text-black font-semibold hover:bg-[#E5C170] shadow-lg shadow-[#C2A35D30]">Save Category</Button>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
