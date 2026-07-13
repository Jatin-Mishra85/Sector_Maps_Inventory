import { useEffect, useRef, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import './SectorBasedInventoryForm.css';

import Input from '../../../../components/common/Input/Input';
import TextArea from '../../../../components/common/TextArea/TextArea';
import FileUpload from '../../../../components/common/FileUpload/FileUpload';
import Button from '../../../../components/common/Button/Button';
import GroupMultiSelect from '../../../../components/common/GroupMultiSelect/GroupMultiSelect';

import { adminService } from '../../services/adminService';
import { parseApiError } from '../../../../services/errorHandler';
import { useToast } from '../../../../context/ToastContext';

const defaultValues = {
  groups: [], // "Grouping" — multi-select
  actualDeveloperName: '', // "Developer" — single value
  sectorNames: [{ value: '', cardId: '' }], // BULK — one entry per Sector, each with its own Card ID (decimal allowed)
  name: '', // "Project" — single value
  block: '', // single value
  description: '',
  polygon: '',
  image: null,
};

export default function SectorBasedInventoryForm({ onSuccess, availableGroups = [] }) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sectorsContainerRef = useRef(null);

  const { control, register, handleSubmit, reset } = useForm({ defaultValues, mode: 'onBlur' });

  const { fields: sectorFields, append: appendSector, remove: removeSector } = useFieldArray({
    control,
    name: 'sectorNames',
  });

  const prevSectorCountRef = useRef(sectorFields.length);
  useEffect(() => {
    if (sectorFields.length > prevSectorCountRef.current) {
      const inputs = sectorsContainerRef.current?.querySelectorAll('input[type="text"], input:not([type])');
      const lastInput = inputs?.[inputs.length - 1];
      lastInput?.focus();
    }
    prevSectorCountRef.current = sectorFields.length;
  }, [sectorFields.length]);

  const handleSectorKeyDown = (e, index) => {
    if (e.key !== 'Enter') return;
    if (index !== sectorFields.length - 1) return;
    if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
    e.preventDefault();
    appendSector({ value: '', cardId: '' });
  };

  const createOne = async (data, sectorEntry) => {
    const formData = new FormData();
    formData.append('groupNames', JSON.stringify(data.groups || [])); // Grouping
    formData.append('actualDeveloperName', data.actualDeveloperName || '');
    formData.append('sectorName', sectorEntry.value || '');
    formData.append('block', data.block || '');
    formData.append('name', data.name || ''); // Project
    formData.append('cardId', sectorEntry.cardId || ''); // Card ID — per Sector row, decimal allowed
    formData.append('description', data.description || '');
    formData.append('polygon', data.polygon || '');
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await adminService.createInventory(formData);

    return {
      id: response?.id ?? response?.data?.id ?? `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: response?.name ?? data.name ?? '',
      block: response?.block ?? data.block ?? '',
      groups: response?.groups ?? data.groups ?? [],
      cardId: response?.cardId ?? (sectorEntry.cardId ? Number(sectorEntry.cardId) : null),
      actualDeveloperName: response?.actualDeveloperName ?? data.actualDeveloperName ?? '',
      sectorName: response?.sectorName ?? sectorEntry.value ?? '-',
      imageUrl: response?.imageUrl ?? (data.image ? URL.createObjectURL(data.image) : null),
      latitude: response?.latitude ?? null,
      longitude: response?.longitude ?? null,
    };
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const enteredSectors = (data.sectorNames || [])
      .map((s) => ({ value: (s?.value || '').trim(), cardId: (s?.cardId || '').trim() }))
      .filter((s) => s.value.length > 0);
    const sectorsToSubmit = enteredSectors.length > 0 ? enteredSectors : [{ value: '', cardId: '' }];

    const missingCardIdEntry = sectorsToSubmit.find((s) => !s.cardId);
    if (missingCardIdEntry) {
      showToast(`"${missingCardIdEntry.value || 'Untitled'}" ke liye Card ID dena zaroori hai.`, 'error');
      setIsSubmitting(false);
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const sectorEntry of sectorsToSubmit) {
      try {
        const createdInventory = await createOne(data, sectorEntry);
        successCount += 1;
        onSuccess?.(createdInventory);
      } catch (err) {
        failCount += 1;
        const { message } = parseApiError(err);
        showToast(`"${sectorEntry.value || 'Untitled'}" save nahi hui: ${message}`, 'error');
      }
    }

    if (successCount > 0) {
      showToast(
        sectorsToSubmit.length > 1
          ? `${successCount} inventories create ho gayi${failCount ? `, ${failCount} fail hui` : ''}.`
          : 'Inventory created successfully.',
        'success'
      );
    }

    reset(defaultValues);
    setIsSubmitting(false);
  };

  const handleReset = () => {
    reset(defaultValues);
  };

  return (
    <form className="sector-based-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="sector-based-form__grid">
        <Controller
          name="groups"
          control={control}
          render={({ field }) => (
            <GroupMultiSelect
              label="Grouping"
              value={field.value}
              onChange={field.onChange}
              availableGroups={availableGroups}
            />
          )}
        />

        <Input label="Developer" placeholder="e.g. Actual developer name" {...register('actualDeveloperName')} />

        <Input label="Project" placeholder="e.g. Project Name" {...register('name')} />

        <Input label="Block" placeholder="e.g. Block A" {...register('block')} />
      </div>

      {/* BULK ADD — Sector(s), each with its own Card ID */}
      <div className="sector-based-form__sectors" ref={sectorsContainerRef}>
        <label className="sector-based-form__sectors-label">Sector(s)</label>
        {sectorFields.map((field, index) => (
          <div className="sector-based-form__sector-row" key={field.id}>
            <Input
              placeholder="e.g. Sector 37D — Enter dabao naya row ke liye"
              {...register(`sectorNames.${index}.value`)}
              onKeyDown={(e) => handleSectorKeyDown(e, index)}
            />
            <Input
              type="number"
              min="0.0001"
              step="0.01"
              placeholder="Card ID (e.g. 5.6)"
              className="sector-based-form__card-id-input"
              {...register(`sectorNames.${index}.cardId`)}
            />
            {sectorFields.length > 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => removeSector(index)}
                disabled={isSubmitting}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() => appendSector({ value: '', cardId: '' })}
          disabled={isSubmitting}
        >
          + Add Another
        </Button>
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
          <FileUpload label="Inventory Image" value={field.value} onChange={field.onChange} />
        )}
      />

      <div className="sector-based-form__actions">
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