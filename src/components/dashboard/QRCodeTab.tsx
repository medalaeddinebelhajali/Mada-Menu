import React, { useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import QRCode from 'qrcode';
import { Download, QrCode as QrIcon, ExternalLink, Printer } from 'lucide-react';

export const QRCodeTab: React.FC = () => {
  const { currentRestaurant } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!currentRestaurant) return null;

  const publicUrl = `${window.location.origin}/m/${currentRestaurant.slug}`;

  const downloadPNG = async () => {
    try {
      const url = await QRCode.toDataURL(publicUrl, {
        width: 1000,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR-Menu-${currentRestaurant.slug}.png`;
      link.click();
    } catch (e) {
      console.error(e);
    }
  };

  const downloadSVG = async () => {
    try {
      const svgString = await QRCode.toString(publicUrl, { type: 'svg', margin: 2 });
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR-Menu-${currentRestaurant.slug}.svg`;
      link.click();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white">Générateur de Code QR</h1>
        <p className="text-xs text-slate-400">Téléchargez vos codes QR stables en formats haute définition PNG et SVG pour impression</p>
      </div>

      <div className="glass-panel p-8 rounded-3xl space-y-8 border border-slate-800 text-center">
        
        {/* QR Visual Canvas */}
        <div className="inline-block p-6 bg-white rounded-3xl shadow-2xl space-y-4">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(publicUrl)}`}
            alt="QR Code Menu"
            className="w-56 h-56 mx-auto"
          />
          <div className="text-slate-900 font-bold text-xs">
            {currentRestaurant.name}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2">
          <p className="text-xs font-mono text-amber-400 font-bold">
            {publicUrl}
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Ce code QR pointe en permanence vers votre menu public. Même si vous modifiez vos plats ou prix, ce QR code ne change jamais.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={downloadPNG}
            className="gold-button w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-xs shadow-lg"
          >
            <Download className="w-4 h-4 text-slate-950" />
            Télécharger PNG (HD)
          </button>

          <button
            onClick={downloadSVG}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-semibold flex items-center justify-center gap-2 text-xs hover:bg-slate-800 transition-all"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            Télécharger SVG (Vectoriel)
          </button>
        </div>
      </div>
    </div>
  );
};
