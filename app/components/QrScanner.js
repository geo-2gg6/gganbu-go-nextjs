'use client';
import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QrScanner({ onScan }) {
  useEffect(() => {
    let scanner;
    function onScanSuccess(decodedText, decodedResult) {
      if(scanner) {
        scanner.clear();
      }
      onScan(decodedText);
    }

    scanner = new Html5QrcodeScanner(
      'qr-reader', 
      { fps: 10, qrbox: { width: 250, height: 250 } }, 
      false
    );
    scanner.render(onScanSuccess, console.warn);

    return () => {
      if(scanner) {
        try {
          scanner.clear();
        } catch(e) {
          console.error("Failed to clear scanner", e);
        }
      }
    };
  }, [onScan]);

  return <div id="qr-reader" className="mt-6 w-full max-w-sm"></div>;
}