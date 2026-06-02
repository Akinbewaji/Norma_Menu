import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, Printer, Download, Loader2 } from 'lucide-react';

export default function AdminQRCodesPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tableCount, setTableCount] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handlePrint = () => {
    window.print();
  };

  // Get the base URL dynamically or fallback to a placeholder
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://norma.com';

  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const margin = 20;
      const cols = 3;
      const rows = 4;
      const gapX = 15;
      const gapY = 20;
      const cellWidth = (pageWidth - margin * 2 - (cols - 1) * gapX) / cols;
      const cellHeight = 55;
      const qrSize = 35;

      for (let i = 0; i < tables.length; i++) {
        const tableNum = tables[i];
        const idxOnPage = i % (cols * rows);
        const col = idxOnPage % cols;
        const row = Math.floor(idxOnPage / cols);

        if (i > 0 && idxOnPage === 0) {
          pdf.addPage();
        }

        const x = margin + col * (cellWidth + gapX);
        const y = margin + row * (cellHeight + gapY);

        // Draw dashed border for the cell to act as cutting guides
        pdf.setDrawColor(180);
        pdf.setLineWidth(0.3);
        pdf.setLineDashPattern([2, 2], 0);
        pdf.rect(x, y, cellWidth, cellHeight);
        pdf.setLineDashPattern([], 0); // reset


        // Generate QR code as data URL
        const qrDataUrl = await QRCode.toDataURL(`${origin}/menu?table=${tableNum}`, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 300 // Higher resolution for better print quality
        });

        // Add QR to PDF
        const qrX = x + (cellWidth - qrSize) / 2;
        const qrY = y + 5;
        pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

        // Draw white box in center of QR
        const boxSize = 7;
        pdf.setFillColor(255, 255, 255);
        pdf.rect(qrX + (qrSize - boxSize) / 2, qrY + (qrSize - boxSize) / 2, boxSize, boxSize, 'F');
        
        // Draw table number inside the box
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(0, 0, 0);
        const boxText = tableNum.toString();
        const boxTextWidth = pdf.getTextWidth(boxText);
        pdf.text(boxText, qrX + (qrSize - boxTextWidth) / 2, qrY + qrSize / 2 + 3.1);

        // Add headers/text
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(0, 0, 0);
        const text = `TABLE ${tableNum}`;
        const textWidth = pdf.getTextWidth(text);
        pdf.text(text, x + (cellWidth - textWidth) / 2, qrY + qrSize + 6);

        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 100, 100);
        const subText = 'norma.com';
        const subTextWidth = pdf.getTextWidth(subText);
        pdf.text(subText, x + (cellWidth - subTextWidth) / 2, qrY + qrSize + 10);
      }

      pdf.save('norma-table-qrcodes.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F8FAFC] font-sans flex flex-col relative print:bg-white print:text-black print:h-auto print:overflow-visible">
      {/* Top Navigation / Brand Bar */}
      <header className="h-16 border-b border-[#2D323C] bg-[#1A1D23] px-8 flex items-center justify-between z-10 shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C2A35D] rounded flex items-center justify-center font-bold text-black">N</div>
          <h1 className="text-xl font-semibold tracking-tight">Norma <span className="text-[#94A3B8] font-normal text-sm ml-2 hidden sm:inline">Admin System</span></h1>
        </div>
        <div className="flex gap-4 items-center">
          <div className="px-3 py-1 bg-[#2D323C] rounded-full text-xs text-[#94A3B8] uppercase tracking-wider hidden sm:block">Admin</div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C2A35D] to-[#E5C170]"></div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden print:overflow-visible print:h-auto">
        {/* Sidebar Nav */}
        <nav className="w-64 border-r border-[#2D323C] bg-[#14171C] p-6 hidden md:flex flex-col gap-6 print:hidden">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#4B5563] uppercase tracking-widest px-2 mb-2 block">Menu Management</label>
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-[#94A3B8] hover:text-white transition-colors"
            >
              Menu Data
            </button>
            <button 
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-[#C2A35D] bg-[#C2A35D15] rounded-md font-medium"
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
          <div className="mt-auto space-y-4 print:hidden">
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
        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#0F1115] print:p-0 print:bg-white print:text-black print:overflow-visible print:h-auto">
          <div className="max-w-5xl mx-auto space-y-6 print:space-y-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 print:hidden">
              <div>
                <h2 className="text-2xl font-bold">Table QR Codes</h2>
                <p className="text-[#94A3B8] text-sm mt-1">Generate and print unique QR codes for each restaurant table.</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="table-count" className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider whitespace-nowrap">Tables</Label>
                  <Input 
                    id="table-count"
                    type="number"
                    min={1}
                    max={200}
                    value={tableCount}
                    onChange={(e) => setTableCount(parseInt(e.target.value) || 1)}
                    className="w-20 h-10 rounded-md bg-[#1A1D23] border-[#2D323C] text-[#F8FAFC] focus-visible:ring-[#C2A35D]"
                  />
                </div>
                <Button 
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                  className="bg-[#C2A35D] text-black font-semibold rounded-md shadow-lg shadow-[#C2A35D30] hover:bg-[#E5C170] border-0 shrink-0"
                >
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  Download PDF
                </Button>
                <Button 
                  onClick={handlePrint}
                  variant="outline"
                  className="bg-transparent text-[#94A3B8] font-semibold rounded-md border border-[#2D323C] hover:bg-[#2D323C] hover:text-white shrink-0"
                >
                  <Printer className="mr-2 h-4 w-4" /> Print Page
                </Button>
              </div>
            </div>

            <div className="bg-[#1A1D23] rounded-xl border border-[#2D323C] p-6 print:border-none print:p-0 print:bg-white">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-8 print:grid-cols-3 print:gap-12">
                {tables.map(tableNum => (
                  <div key={tableNum} className="flex flex-col items-center justify-center p-6 bg-[#0F1115] border border-[#2D323C] rounded-lg print:border print:border-dashed print:border-neutral-300 print:bg-white print:break-inside-avoid shadow-sm print:shadow-none">
                    <div className="relative flex justify-center items-center mb-4 print:w-[130px] print:h-[130px]">
                      <QRCodeSVG 
                        value={`${origin}/menu?table=${tableNum}`}
                        size={120}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"H"}
                        className="rounded-md"
                        marginSize={1}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white px-1.5 py-0.5 rounded shadow-[0_0_2px_rgba(0,0,0,0.5)] text-black text-xs font-bold font-sans">
                          {tableNum}
                        </div>
                      </div>
                    </div>
                    <div className="text-center w-full">
                      <p className="text-sm font-bold text-[#F8FAFC] print:text-black">TABLE {tableNum}</p>
                      <p className="text-[10px] text-[#94A3B8] mt-1 print:text-neutral-500 font-mono tracking-widest">norma.com</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
