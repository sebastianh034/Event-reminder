import { useState } from 'react';

export function useFormData<T extends Record<string, any>>(initialValues: T) {
  const [formData, setFormData] = useState<T>(initialValues);

  const handleChange = (field: keyof T, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateFields = (fields: Partial<T>) => {
    setFormData(prev => ({
      ...prev,
      ...fields
    }));
  };

  const resetForm = () => {
    setFormData(initialValues);
  };

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialValues);
  };

  return {
    formData,
    setFormData,
    handleChange,
    updateFields,
    resetForm,
    hasChanges
  };
}
