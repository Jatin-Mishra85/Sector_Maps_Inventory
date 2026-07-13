import { useEffect, useRef, useState } from 'react';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import './AdminInventoryForm.css';

import Input from '../../../../components/common/Input/Input';
import TextArea from '../../../../components/common/TextArea/TextArea';
import FileUpload from '../../../../components/common/FileUpload/FileUpload';
import Button from '../../../../components/common/Button/Button';
import GroupMultiSelect from '../../../../components/common/GroupMultiSelect/GroupMultiSelect';

import { adminService } from '../../services/adminService';
import { parseApiError } from '../../../../services/errorHandler';
import { useToast } from '../../../../context/ToastContext';

const defaultValues = {
  groups: [], // "Grouping" — array of names (many-to-many)
  actualDeveloperName: '', // "Developer" — plain text, unrelated to Grouping
  sectorName: '',
  // BULK ADD — Project(s). Each row has its OWN Card ID (decimal allowed, e.g. 5.6).
  names: [{ value: '', cardId: '' }],
  // BULK ADD — Block(s). Each row has its OWN "which Project" selector +
  // its OWN Card ID (decimal allowed).
  blocks: [{ value: '', projectName: '', cardId: '' }],
  description: '',
  polygon: '',
  image: null,
};

export default function AdminInventoryForm({ onSuccess, availableGroups = [] }) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const namesContainerRef = useRef(null);
  const blocksContainerRef = useRef(null);

  const { control, register, handleSubmit, reset } = useForm({ defaultValues, mode: 'onBlur' });

  const { fields: nameFields, append: appendName, remove: removeName } = useFieldArray({
    control,
    name: 'names',
  });

  const namesWatch = useWatch({ control, name: 'names' });
  const projectOptions = (namesWatch || [])
    .map((n) => (n?.value || '').trim())
    .filter(Boolean);

  const { fields: blockFields, append: appendBlock, remove: removeBlock } = useFieldArray({
    control,
    name: 'blocks',
  });

  const prevNameCountRef = useRef(nameFields.length);
  useEffect(() => {
    if (nameFields.length > prevNameCountRef.current) {
      const inputs = namesContainerRef.current?.querySelectorAll('input[type="text"], input:not([type])');
      const lastInput = inputs?.[inputs.length - 1];
      lastInput?.focus();
    }
    prevNameCountRef.current = nameFields.length;
  }, [nameFields.length]);

  const prevBlockCountRef = useRef(blockFields.length);
  useEffect(() => {
    if (blockFields.length > prevBlockCountRef.current) {
      const inputs = blocksContainerRef.current?.querySelectorAll('input[type="text"], input:not([type])');
      const lastInput = inputs?.[inputs.length - 1];
      lastInput?.focus();
    }
    prevBlockCountRef.current = blockFields.length;
  }, [blockFields.length]);

  const handleNameKeyDown = (e, index) => {
    if (e.key !== 'Enter') return;
    if (index !== nameFields.length - 1) return;
    if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
    e.preventDefault();
    appendName({ value: '', cardId: '' });
  };

  const handleAddBlock = () => {
    const autoProject = projectOptions.length === 1 ? projectOptions[0] : '';
    appendBlock({ value: '', projectName: autoProject, cardId: '' });
  };

  const handleBlockKeyDown = (e, index) => {
    if (e.key !== 'Enter') return;
    if (index !== blockFields.length - 1) return;
    if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
    e.preventDefault();
    handleAddBlock();
  };

  const createOne = async (data, entry) => {
    const formData = new FormData();
    formData.append('groupNames', JSON.stringify(data.groups || [])); // Grouping
    formData.append('actualDeveloperName', data.actualDeveloperName || '');
    formData.append('sectorName', data.sectorName || '');
    formData.append('block', entry.block || '');
    formData.append('name', entry.projectName || ''); // Project — CAN be blank now
    formData.append('cardId', entry.cardId || ''); // Card ID — per-entry, decimal allowed
    formData.append('description', data.description || '');
    formData.append('polygon', data.polygon || '');
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await adminService.createInventory(formData);

    return {
      id: response?.id ?? response?.data?.id ?? `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: response?.name ?? entry.projectName ?? '',
      block: response?.block ?? entry.block ?? '',
      groups: response?.groups ?? data.groups ?? [],
      cardId: response?.cardId ?? (entry.cardId ? Number(entry.cardId) : null),
      actualDeveloperName: response?.actualDeveloperName ?? data.actualDeveloperName ?? '',
      sectorName: response?.sectorName ?? data.sectorName ?? '-',
      imageUrl: response?.imageUrl ?? (data.image ? URL.createObjectURL(data.image) : null),
      latitude: response?.latitude ?? null,
      longitude: response?.longitude ?? null,
    };
  };

  const buildEntries = (data) => {
    const enteredProjectNames = (data.names || [])
      .map((n) => ({ value: (n?.value || '').trim(), cardId: (n?.cardId || '').trim() }))
      .filter((n) => n.value);

    const enteredBlocks = (data.blocks || [])
      .map((b) => ({
        block: (b?.value || '').trim(),
        projectName: (b?.projectName || '').trim(),
        cardId: (b?.cardId || '').trim(),
      }))
      .filter((b) => b.block);

    const entries = [];
    const claimedProjectNames = new Set();

    enteredBlocks.forEach((b) => {
      entries.push({ projectName: b.projectName, block: b.block, cardId: b.cardId });
      if (b.projectName) claimedProjectNames.add(b.projectName);
    });

    enteredProjectNames.forEach((n) => {
      if (!claimedProjectNames.has(n.value)) {
        entries.push({ projectName: n.value, block: '', cardId: n.cardId });
      }
    });

    if (entries.length === 0) {
      entries.push({ projectName: '', block: '', cardId: '' });
    }

    return entries;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const entries = buildEntries(data);

    const missingCardIdEntry = entries.find((e) => !e.cardId);
    if (missingCardIdEntry) {
      const label = [missingCardIdEntry.projectName, missingCardIdEntry.block].filter(Boolean).join(' / ') || 'Untitled';
      showToast(`"${label}" ke liye Card ID dena zaroori hai.`, 'error');
      setIsSubmitting(false);
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const entry of entries) {
      try {
        const createdInventory = await createOne(data, entry);
        successCount += 1;
        onSuccess?.(createdInventory);
      } catch (err) {
        failCount += 1;
        const { message } = parseApiError(err);
        const label = [entry.projectName, entry.block].filter(Boolean).join(' / ') || 'Untitled';
        showToast(`"${label}" save nahi hui: ${message}`, 'error');
      }
    }

    if (successCount > 0) {
      showToast(
        entries.length > 1
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
    <form className="admin-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="admin-form__grid">
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

        <Input label="Sector" placeholder="e.g. Sector 37D" {...register('sectorName')} />
      </div>

      {/* BULK ADD — Project(s), each with its own Card ID */}
      <div className="admin-form__names" ref={namesContainerRef}>
        <label className="admin-form__names-label">Project(s) (optional)</label>
        {nameFields.map((field, index) => (
          <div className="admin-form__name-row" key={field.id}>
            <Input
              placeholder="e.g. Project Name — Enter dabao naya row ke liye"
              {...register(`names.${index}.value`)}
              onKeyDown={(e) => handleNameKeyDown(e, index)}
            />
            <Input
              type="number"
              min="0.0001"
              step="0.01"
              placeholder="Card ID (e.g. 5.6)"
              className="admin-form__card-id-input"
              {...register(`names.${index}.cardId`)}
            />
            {nameFields.length > 1 && (
              <Button type="button" variant="secondary" onClick={() => removeName(index)} disabled={isSubmitting}>
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => appendName({ value: '', cardId: '' })} disabled={isSubmitting}>
          + Add Another
        </Button>
      </div>

      {/* BULK ADD — Block(s), each optionally tagged with a Project + its own Card ID */}
      <div className="admin-form__names" ref={blocksContainerRef}>
        <label className="admin-form__names-label">Block(s)</label>
        {blockFields.map((field, index) => (
          <div className="admin-form__name-row" key={field.id}>
            <Input
              placeholder="e.g. Block Name — Enter dabao naya row ke liye"
              {...register(`blocks.${index}.value`)}
              onKeyDown={(e) => handleBlockKeyDown(e, index)}
            />

            <select
              className="admin-form__block-project-select"
              {...register(`blocks.${index}.projectName`)}
              disabled={projectOptions.length === 0}
            >
              <option value="">— Project (optional) —</option>
              {projectOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <Input
              type="number"
              min="0.0001"
              step="0.01"
              placeholder="Card ID (e.g. 5.6)"
              className="admin-form__card-id-input"
              {...register(`blocks.${index}.cardId`)}
            />

            {blockFields.length > 1 && (
              <Button type="button" variant="secondary" onClick={() => removeBlock(index)} disabled={isSubmitting}>
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={handleAddBlock} disabled={isSubmitting}>
          + Add Another
        </Button>
      </div>

      <TextArea label="Description (optional)" placeholder="Brief details about this inventory..." {...register('description')} />

      <Input
        label="Google Polygon Coordinates"
        placeholder="e.g. 28.4595,77.0266;28.4600,77.0270;28.4590,77.0280"
        {...register('polygon')}
        helperText="Paste the polygon path copied from Google My Maps / Earth."
      />

      <Controller
        name="image"
        control={control}
        render={({ field }) => <FileUpload label="Inventory Image" value={field.value} onChange={field.onChange} />}
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