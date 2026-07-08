import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = 'Are you sure?', description, isLoading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
    <p className="text-gray-600 mb-6">{description}</p>
    <div className="flex justify-end gap-3">
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>Delete</Button>
    </div>
  </Modal>
);

export default ConfirmDialog;
