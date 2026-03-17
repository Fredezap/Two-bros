import React from 'react';
import { MashingSection, BoilSection, FermentationSection } from '../sections';

interface RecipeFormSectionsProps {
  formData: any;
  isEditing: boolean;
  isCreating: boolean;
  canEditIngredients: boolean;
  availableIngredients: any[];
  handleDetailsChange: (e: React.ChangeEvent<any>) => void;
  handleIngredientChange: (index: number, field: string, value: any, type?: string) => void;
  handleAddIngredient: (ingredientId: any, type: string) => void;
  newIngredientIndex: number | null;
  setNewIngredientIndex: (index: number | null) => void;
  handleNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleRemoveIngredient: (ingredientId: any) => void;
}

const RecipeFormSections: React.FC<RecipeFormSectionsProps> = ({
  formData,
  isEditing,
  isCreating,
  canEditIngredients,
  availableIngredients,
  handleDetailsChange,
  handleIngredientChange,
  handleAddIngredient,
  newIngredientIndex,
  setNewIngredientIndex,
  handleNotesChange,
  handleRemoveIngredient,
}) => (
  <div className="lg:col-span-2 space-y-8">
    <MashingSection
      formData={formData}
      isEditing={isEditing}
      isCreating={isCreating}
      canEditIngredients={canEditIngredients}
      availableIngredients={availableIngredients}
      handleDetailsChange={handleDetailsChange}
      handleIngredientChange={handleIngredientChange}
      handleAddIngredient={handleAddIngredient}
      newIngredientIndex={newIngredientIndex}
      setNewIngredientIndex={setNewIngredientIndex}
      handleRemoveIngredient={handleRemoveIngredient}
    />
    <BoilSection
      formData={formData}
      isEditing={isEditing}
      isCreating={isCreating}
      canEditIngredients={canEditIngredients}
      availableIngredients={availableIngredients}
      handleDetailsChange={handleDetailsChange}
      handleIngredientChange={handleIngredientChange}
      handleAddIngredient={handleAddIngredient}
      newIngredientIndex={newIngredientIndex}
      setNewIngredientIndex={setNewIngredientIndex}
      handleRemoveIngredient={handleRemoveIngredient}
    />
    <FermentationSection
      formData={formData}
      isEditing={isEditing}
      isCreating={isCreating}
      canEditIngredients={canEditIngredients}
      availableIngredients={availableIngredients}
      handleDetailsChange={handleDetailsChange}
      handleIngredientChange={handleIngredientChange}
      handleAddIngredient={handleAddIngredient}
      handleNotesChange={handleNotesChange}
      handleRemoveIngredient={handleRemoveIngredient}
    />
  </div>
);

export default RecipeFormSections;
