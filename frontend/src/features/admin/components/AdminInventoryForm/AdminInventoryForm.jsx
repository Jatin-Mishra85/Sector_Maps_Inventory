import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import './AdminInventoryForm.css';

import Input from '../../../../components/common/Input/Input';
import TextArea from '../../../../components/common/TextArea/TextArea';
import FileUpload from '../../../../components/common/FileUpload/FileUpload';
import Button from '../../../../components/common/Button/Button';

import { adminService } from '../../services/adminService';
import { parseApiError } from '../../../../services/errorHandler';
import { useToast } from '../../../../context/ToastContext';

const defaultValues = {
  developerName: '',
  sectorName: '',
  type: '',
  name: '',
  description: '',
  polygon: '',
  image: null,
};

export default function AdminInventoryForm({ onSuccess }) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, register, handleSubmit, reset } = useForm({ defaultValues, mode: 'onBlur' });
  // No validation rules — every field remains optional, as requested earlier.

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('developerName', data.developerName || '');
      formData.append('sectorName', data.sectorName || '');
      formData.append('type', data.type || '');
      formData.append('name', data.name || '');
      formData.append('description', data.description || '');
      formData.append('polygon', data.polygon || '');
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await adminService.createInventory(formData);

      const createdInventory = {
        id: response?.id ?? response?.data?.id ?? crypto.randomUUID(),
        name: response?.name ?? data.name ?? 'Untitled Inventory',
        type: response?.type ?? data.type ?? '',
        developerName: response?.developerName ?? data.developerName ?? '-',
        sectorName: response?.sectorName ?? data.sectorName ?? '-',
        imageUrl: response?.imageUrl ?? (data.image ? URL.createObjectURL(data.image) : null),
        latitude: response?.latitude ?? null,
        longitude: response?.longitude ?? null,
      };

      showToast('Inventory created successfully.', 'success');
      reset(defaultValues);
      onSuccess?.(createdInventory);
    } catch (err) {
      const { message } = parseApiError(err);
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset(defaultValues);
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="admin-form__grid">
        <Input
          label="Developer"
          placeholder="e.g. BPTP"
          {...register('developerName')}
        />

        <Input
          label="Sector"
          placeholder="e.g. Sector 37D"
          {...register('sectorName')}
        />

        <Input
          label="Inventory Type"
          placeholder="e.g. Plot, Villa, Apartment — kuch bhi likh sakte ho"
          {...register('type')}
        />

        <Input
          label="Inventory Name"
          placeholder="e.g. Sunrise Heights"
          {...register('name')}
        />
      </div>

      <TextArea
        label="Description (optional)"
        placeholder="Brief details about this inventory..."
        {...register('description')}
      />

      <Input
        label="Google Polygon Coordinates"
        placeholder="e.g. 28.4595,77.0266;28.4600,77.0270;28.4590,77.0280"
        {...register('polygon')}
        helperText="Paste the polygon path copied from Google My Maps / Earth."
      />

      <Controller
        name="image"
        control={control}
        render={({ field }) => (
          <FileUpload
            label="Inventory Image"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <div className="admin-form__actions">
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
          Save Inventory
        </Button>
        <Button type="button" variant="secondary" onClick={handleReset} disabled={isSubmitting}>
          Reset
        </Button>
      </div>
    </form>
  );
}