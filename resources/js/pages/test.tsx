import React, { useState } from 'react';

export default function MyForm() {
  // Initialiser avec un objet vide
  const [inputValue, setInputValue] = useState<Record<string, any>>({});

  // Gestionnaire de changement pour les inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Met à jour la clé correspondante dans inputValue
    setInputValue(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form>
      <input
        name="firstName"
        value={inputValue.firstName || ''}
        onChange={handleChange}
        placeholder="Prénom"
      />

      <input
        name="lastName"
        value={inputValue.lastName || ''}
        onChange={handleChange}
        placeholder="Nom"
      />

      <input
        name="age"
        type="number"
        value={inputValue.age || ''}
        onChange={handleChange}
        placeholder="Âge"
      />
    </form>
  );
}
