import { QRCodeSVG } from 'qrcode.react';
import { UtensilsCrossed } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ScanPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableNum = searchParams.get('table');

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://norma.com';
  const qrUrl = `${origin}/menu${tableNum ? `?table=${tableNum}` : ''}`;

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center text-[#F8FAFC] font-sans">
      <Card className="max-w-md w-full p-8 space-y-8 flex flex-col items-center bg-[#1A1D23] shadow-2xl border border-[#2D323C] rounded-3xl">
        <div className="space-y-4">
          <div className="flex justify-center">
             <span className="text-4xl font-serif text-[#C2A35D] tracking-tighter">
               Norma
             </span>
          </div>
          <p className="text-[#94A3B8] font-medium text-[10px] uppercase tracking-[0.2em]">Quality in your belly for a penny!!</p>
        </div>

        <div className="p-8 bg-white/5 rounded-3xl border border-white/10 relative flex justify-center items-center">
          <QRCodeSVG 
            value={qrUrl}
            size={192}
            bgColor={"transparent"}
            fgColor={"#F8FAFC"}
            level={"H"}
            className="opacity-90"
          />
          {tableNum && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-[#1A1D23] px-3 py-1.5 rounded-lg text-[#F8FAFC] text-xl font-bold shadow-2xl border border-white/10">
                {tableNum}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 w-full">
          <Button 
            size="lg" 
            className="w-full h-14 text-lg rounded-2xl bg-[#C2A35D] text-black font-semibold hover:bg-[#E5C170] shadow-lg shadow-[#C2A35D30] border-0"
            onClick={() => navigate(tableNum ? `/menu?table=${tableNum}` : '/menu')}
          >
            <UtensilsCrossed className="mr-2 h-5 w-5" />
            View Digital Menu
          </Button>
          <p className="text-sm text-[#94A3B8] italic">Scan at table or tap above to browse</p>
        </div>
      </Card>
      
      <div className="fixed bottom-8 text-[#94A3B8] font-bold text-xs tracking-widest uppercase">
        24hrs | FOOD SERVICE
      </div>
    </div>
  );
}
