import React from 'react';

interface ImageModalProps {
  url: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ url, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
    <div className="max-w-3xl max-h-[90vh] p-4">
      <img src={url} alt="Product" className="max-w-full max-h-full object-contain" />
    </div>
  </div>
);

export default ImageModal;