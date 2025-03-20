import ReactDOM from "react-dom";

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}
export function Modal({ children, onClose }: ModalProps) {
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10"
      onClick={onClose}
    >
      <div
        className="bg-white border-4 border-black p-6 rounded-md max-w-2xl w-full max-h-[80vh] overflow-y-auto transform rotate-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Modal</h2>
          <button onClick={onClose} className="text-red-600 font-bold">
            Cerrar
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.getElementById("modal-root")!
  );
}
