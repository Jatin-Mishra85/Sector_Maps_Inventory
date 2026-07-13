import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import './EditInventoryModal.css';

import Input from '../../../../components/common/Input/Input';
import TextArea from '../../../../components/common/TextArea/TextArea';
import FileUpload from '../../../../components/common/FileUpload/FileUpload';
import Button from '../../../../components/common/Button/Button';
import GroupMultiSelect from '../../../../components/common/GroupMultiSelect/GroupMultiSelect';

import { inventoryService } from '../../services/inventoryService';
import { parseApiError } from '../../../../services/errorHandler';
import { useToast } from '../../../../context/ToastContext';

export default function EditInventoryModal({ inventory, isOpen, onClose, onUpdated, availableGroups = [] }) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      block: '',
      actualDeveloperName: '',
      groups: [],
      cardId: '', // Card ID / Roll No — internal only, not shown on the card. Decimal allowed (e.g. 5.6).
      description: '',
      image: null,
    },
  });

  useEffect(() => {
    if (inventory) {
      reset({
        name: inventory.name || '',
        block: inventory.block || '',
        actualDeveloperName: inventory.actualDeveloperName || '',
        groups: Array.isArray(inventory.groups) ? inventory.groups.map((g) => g.groupName) : [],
        cardId: inventory.cardId != null ? String(inventory.cardId) : '',
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
      formData.append('block', data.block || '');
      formData.append('actualDeveloperName', data.actualDeveloperName || '');
      formData.append('groupNames', JSON.stringify(data.groups || [])); // Grouping
      formData.append('cardId', data.cardId || ''); // Card ID — compulsory, decimal allowed
      formData.append('description', data.description || '');
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await inventoryService.updateWithImage(inventory.id, formData);

      const updatedInventory = {
        ...inventory,
        name: response?.name ?? data.name ?? inventory.name,
        block: response?.block ?? data.block ?? inventory.block,
        actualDeveloperName: response?.actualDeveloperName ?? data.actualDeveloperName ?? inventory.actualDeveloperName,
        groups: response?.groups ?? inventory.groups,
        cardId: response?.cardId ?? inventory.cardId,
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
      <div className="edit-modal" role="dialog" aria-modal="true" aria-label={`Edit ${inventory.name}`} onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal__header">
          <h2 className="edit-modal__title">Edit Inventory</h2>
          <button type="button" className="edit-modal__close" onClick={onClose} aria-label="Close edit dialog">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input label="Project" {...register('name')} />

          <Input label="Block" {...register('block')} />

          <Input label="Developer" {...register('actualDeveloperName')} />

          <Controller
            name="groups"
            control={control}
            render={({ field }) => (
              <GroupMultiSelect label="Grouping" value={field.value} onChange={field.onChange} availableGroups={availableGroups} />
            )}
          />

          <Input
            label="Card ID *"
            type="number"
            min="0.0001"
            step="0.01"
            placeholder="e.g. 5.6"
            helperText={errors.cardId ? errors.cardId.message : 'Har entry ka Card ID unique hona chahiye. Decimal bhi allowed hai (jaise 5.6).'}
            {...register('cardId', {
              required: 'Card ID zaroori hai, isse khaali nahi chhod sakte.',
              min: { value: 0.0001, message: 'Card ID 0 se zyada hona chahiye.' },
            })}
          />

          <TextArea label="Description" {...register('description')} />

          <Controller
            name="image"
            control={control}
            render={({ field }) => <FileUpload label="Replace / Add Image" value={field.value} onChange={field.onChange} />}
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