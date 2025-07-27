'use client';
import QRCode from 'react-qr-code';

export default function QrCodeDisplay({ answer }) {
  if (!answer) {
    return <p className="mt-4 text-lg">Waiting for a new answer...</p>;
  }

  return (
    <div className="mt-6 rounded-lg bg-white p-4">
      <QRCode value={answer} />
    </div>
  );
}