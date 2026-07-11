/**
 * ============================================================
 * TEMPORARY COMPONENT — DEVELOPMENT PHASE ONLY
 * ------------------------------------------------------------
 * Purpose: lets the team attach/replace images and fix basic
 * fields on inventories that were created without a photo.
 * Delete this entire folder + its usage in InventoryCard/
 * InventoryGrid once the real Admin Panel ships.
 * ============================================================
 */
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import './EditInventoryModal.css';

import Input from '../../../../components/common/Input/Input';
import TextArea from '../../../../components/common/TextArea/TextArea';
import FileUpload from '../../../../components/common/FileUpload/FileUpload';
import Button from '../../../../components/common/Button/Button';

import { inventoryService } from '../../services/inventoryService';
import { parseApiError } from '../../../../services/errorHandler';
import { useToast } from '../../../../context/ToastContext';

export default function EditInventoryModal({ inventory, isOpen, onClose, onUpdated }) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      description: '',
      image: null,
    },
  });

  useEffect(() => {
    if (inventory) {
      reset({
        name: inventory.name || '',
        description: inventory.description || '',
        image: null,
      });
    }
  }, [inventory, reset]);

  if (!isOpen || !inventory) return null;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name || '');
      formData.append('description', data.description || '');
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await inventoryService.updateWithImage(inventory.id, formData);

      const updatedInventory = {
        ...inventory,
        name: response?.name ?? data.name ?? inventory.name,
        description: response?.description ?? data.description ?? inventory.description,
        imageUrl: response?.imageUrl ?? (data.image ? URL.createObjectURL(data.image) : inventory.imageUrl),
      };

      showToast('Inventory updated successfully.', 'success');
      onUpdated?.(updatedInventory);
      onClose();
    } catch (err) {
      const { message } = parseApiError(err);
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="edit-modal__overlay" role="presentation" onClick={onClose}>
      <div
        className="edit-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Edit ${inventory.name}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="edit-modal__header">
          <h2 className="edit-modal__title">Edit Inventory</h2>
          <button
            type="button"
            className="edit-modal__close"
            onClick={onClose}
            aria-label="Close edit dialog"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input label="Inventory Name" {...register('name')} />

          <TextArea label="Description" {...register('description')} />

          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <FileUpload
                label="Replace / Add Image"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <div className="edit-modal__actions">
            <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
              Save Changes
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}