"use client";

import React, { useState } from 'react';

export default function ConfirmModal({
  title = 'Confirm',
  confirmText = '',
  onConfirm,
  onCancel,
}: {
  title?: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [input, setInput] = useState('');
  const canConfirm = confirmText ? input === confirmText : true;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        {confirmText && (
          <p className="text-sm text-gray-600 mb-3">Type <span className="font-mono">{confirmText}</span> to confirm.</p>
        )}
        {confirmText && (
          <input value={input} onChange={(e) => setInput(e.target.value)} className="w-full px-3 py-2 border rounded mb-3" />
        )}
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1 rounded">Cancel</button>
          <button disabled={!canConfirm} onClick={onConfirm} className="px-3 py-1 rounded bg-red-600 text-white disabled:opacity-50">Confirm</button>
        </div>
      </div>
    </div>
  );
}
