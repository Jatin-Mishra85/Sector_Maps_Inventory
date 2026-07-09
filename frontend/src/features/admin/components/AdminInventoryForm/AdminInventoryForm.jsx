import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import './AdminInventoryForm.css';

import Select from '../../../../components/common/Select/Select';
import Input from '../../../../components/common/Input/Input';
import TextArea from '../../../../components/common/TextArea/TextArea';
import FileUpload from '../../../../components/common/FileUpload/FileUpload';
import Button from '../../../../components/common/Button/Button';

import { useDevelopers } from '../../../developer/hooks/useDevelopers';
import { useSectorsByDeveloper } from '../../../sector/hooks/useSectorsByDeveloper';
import { adminService } from '../../services/adminService';
import { parseApiError } from '../../../../services/errorHandler';
import { useToast } from '../../../../context/ToastContext';
import { INVENTORY_TYPES, INVENTORY_TYPE_LABELS } from '../../../../constants/appConstants';

const INVENTORY_TYPE_OPTIONS = Object.values(INVENTORY_TYPES).map((type) => ({
  value: type,
  label: INVENTORY_TYPE_LABELS[type],
}));

const defaultValues = {
  developerId: '',
  sectorId: '',
  type: '',
  name: '',
  description: '',
  polygon: '',
  image: null,
};

export default function AdminInventoryForm({ onSuccess }) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
  } = useForm({ defaultValues, mode: 'onBlur' });
  // No validation rules anywhere below — every field is optional now.

  const selectedDeveloperId = watch('developerId');

  const { developers, loading: developersLoading } = useDevelopers();
  const { sectors, loading: sectorsLoading } = useSectorsByDeveloper(selectedDeveloperId);

  useEffect(() => {
    setValue('sectorId', '');
  }, [selectedDeveloperId, setValue]);

  const developerOptions = developers.map((d) => ({ value: d.id, label: d.name }));
  const sectorOptions = sectors.map((s) => ({ value: s.id, label: s.name }));

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('developerId', data.developerId || '');
      formData.append('sectorId', data.sectorId || '');
      formData.append('type', data.type || '');
      formData.append('name', data.name || '');
      formData.append('description', data.description || '');
      formData.append('polygon', data.polygon || '');
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await adminService.createInventory(formData);

      const developerName = developerOptions.find((o) => o.value === data.developerId)?.label;
      const sectorName = sectorOptions.find((o) => o.value === data.sectorId)?.label;

      const createdInventory = {
        id: response?.id ?? response?.data?.id ?? crypto.randomUUID(),
        name: response?.name ?? data.name ?? 'Untitled Inventory',
        type: response?.type ?? data.type ?? INVENTORY_TYPES.PROJECT,
        developerName: response?.developerName ?? developerName ?? '-',
        sectorName: response?.sectorName ?? sectorName ?? '-',
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
        <Controller
          name="developerId"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Developer"
              placeholder={developersLoading ? 'Loading developers...' : 'Select developer'}
              options={developerOptions}
              disabled={developersLoading}
            />
          )}
        />

        <Controller
          name="sectorId"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Sector"
              placeholder={
                !selectedDeveloperId
                  ? 'Select a developer first'
                  : sectorsLoading
                  ? 'Loading sectors...'
                  : 'Select sector'
              }
              options={sectorOptions}
              disabled={!selectedDeveloperId || sectorsLoading}
            />
          )}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Inventory Type"
              placeholder="Select type"
              options={INVENTORY_TYPE_OPTIONS}
            />
          )}
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