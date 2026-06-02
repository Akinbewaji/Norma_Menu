import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Category, MenuItem } from '../types';

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const tableNum = searchParams.get('table');
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/menu/categories').then(res => res.json()),
      fetch('/api/menu/items').then(res => res.json())
    ]).then(([catsData, itemsData]) => {
      setCategories(Array.isArray(catsData) ? catsData : []);
      setItems(Array.isArray(itemsData) ? itemsData.filter((i: MenuItem) => i.available) : []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category_id === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C2A35D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F8FAFC] pb-20 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#050505]/90 backdrop-blur-md border-b border-white/10 flex flex-col items-center justify-center px-6 py-4 relative">
        <span className="text-3xl font-serif tracking-tighter text-[#C2A35D]">
          Norma
        </span>
        <span className="text-[10px] text-white/40 uppercase tracking-widest mt-1 italic">
          Quality in your belly for a penny!!
        </span>
        {tableNum && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <span className="text-[10px] font-bold text-[#C2A35D] whitespace-nowrap">TABLE {tableNum}</span>
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-4">
        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input 
            type="text" 
            placeholder="Search our menu..." 
            className="pl-10 h-10 bg-white/5 border border-white/10 text-[#F8FAFC] placeholder:text-white/40 rounded-full focus-visible:ring-1 focus-visible:ring-[#C2A35D]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories (Horizontal Scroll) */}
        {!searchQuery && (
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <Button 
              size="sm"
              variant="outline"
              className={`rounded-full whitespace-nowrap text-[10px] h-7 font-bold tracking-wider px-4 border ${activeCategory === 'all' ? 'bg-[#C2A35D] text-black border-[#C2A35D] hover:bg-[#E5C170]' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'}`}
              onClick={() => setActiveCategory('all')}
            >
              ALL ITEMS
            </Button>
            {categories.map(category => (
              <Button 
                key={category.id}
                size="sm"
                variant="outline"
                className={`rounded-full whitespace-nowrap text-[10px] h-7 font-bold tracking-wider px-4 border ${activeCategory === category.id ? 'bg-[#C2A35D] text-black border-[#C2A35D] hover:bg-[#E5C170]' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'}`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name.toUpperCase()}
              </Button>
            ))}
          </div>
        )}

        {/* Menu Items List */}
        <div className="space-y-4 mt-2">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <div key={item.id} className="flex flex-col gap-1 border-b border-white/10 pb-3">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-sm font-semibold text-[#F8FAFC]">{item.name}</h3>
                  <span className="text-xs font-mono text-[#C2A35D] whitespace-nowrap">₦{item.price}</span>
                </div>
                {item.description && (
                  <p className="text-[11px] text-white/50 leading-relaxed">{item.description}</p>
                )}
                {item.allergens && item.allergens.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {item.allergens.map((allergen, idx) => (
                      <span key={idx} className="text-[9px] uppercase tracking-wider font-bold bg-white/5 text-white/50 border border-white/10 px-1.5 py-0.5 rounded-sm">
                        {allergen}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-white/40 text-sm">
              <p>No items found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
