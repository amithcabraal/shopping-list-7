import React from 'react';

interface IframeModalProps {
  url: string;
  onClose: () => void;
}

const IframeModal: React.FC<IframeModalProps> = ({ url, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
    <div className="w-[90vw] h-[90vh] bg-white dark:bg-gray-800 rounded-lg p-4">
      <iframe src={url} className="w-full h-full" title="Product page" />
    </div>
  </div>
);

export default IframeModal;