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

/**
 * "Sector-based" Add Inventory type.
 * ------------------------------------------------------------
 * Only Sector is bulk (multiple values, one entry per Sector).
 * Everything else — Grouping (still multi-select, since that's the DB
 * model now, not a bulk-entry feature), Developer, Project, Block — stays
 * a SINGLE value shared across every Sector entry created.
 */
const defaultValues = {
  groups: [], // "Grouping" — multi-select (many-to-many), same as Normal type
  actualDeveloperName: '', // "Developer" — single value
  sectorNames: [{ value: '' }], // BULK — one entry per Sector typed here
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
      const inputs = sectorsContainerRef.current?.querySelectorAll('input');
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
    appendSector({ value: '' });
  };

  const createOne = async (data, sectorValue) => {
    const formData = new FormData();
    formData.append('groupNames', JSON.stringify(data.groups || [])); // Grouping
    formData.append('actualDeveloperName', data.actualDeveloperName || '');
    formData.append('sectorName', sectorValue || '');
    formData.append('block', data.block || '');
    formData.append('name', data.name || ''); // Project
    formData.append('description', data.description || '');
    formData.append('polygon', data.polygon || '');
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await adminService.createInventory(formData);

    return {
      id: response?.id ?? response?.data?.id ?? crypto.randomUUID(),
      name: response?.name ?? data.name ?? '',
      block: response?.block ?? data.block ?? '',
      groups: response?.groups ?? data.groups ?? [],
      actualDeveloperName: response?.actualDeveloperName ?? data.actualDeveloperName ?? '',
      sectorName: response?.sectorName ?? sectorValue ?? '-',
      imageUrl: response?.imageUrl ?? (data.image ? URL.createObjectURL(data.image) : null),
      latitude: response?.latitude ?? null,
      longitude: response?.longitude ?? null,
    };
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const enteredSectors = (data.sectorNames || [])
      .map((s) => (s?.value || '').trim())
      .filter((s) => s.length > 0);
    const sectorsToSubmit = enteredSectors.length > 0 ? enteredSectors : [''];

    // Sequential — same reason as the Normal form: first request may
    // auto-create Grouping/Sector, parallel requests could duplicate them.
    let successCount = 0;
    let failCount = 0;

    for (const sectorValue of sectorsToSubmit) {
      try {
        const createdInventory = await createOne(data, sectorValue);
        successCount += 1;
        onSuccess?.(createdInventory);
      } catch (err) {
        failCount += 1;
        const { message } = parseApiError(err);
        showToast(`"${sectorValue || 'Untitled'}" save nahi hui: ${message}`, 'error');
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

      {/* BULK ADD — Sector(s). Everything above stays the same for each. */}
      <div className="sector-based-form__sectors" ref={sectorsContainerRef}>
        <label className="sector-based-form__sectors-label">Sector(s)</label>
        {sectorFields.map((field, index) => (
          <div className="sector-based-form__sector-row" key={field.id}>
            <Input
              placeholder="e.g. Sector 37D — Enter dabao naya row ke liye"
              {...register(`sectorNames.${index}.value`)}
              onKeyDown={(e) => handleSectorKeyDown(e, index)}
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
          onClick={() => appendSector({ value: '' })}
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