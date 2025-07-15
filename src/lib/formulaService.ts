
import { supabase } from './supabaseClient';
import type { Formula, VisualExplanation } from './data';

const BUCKET_NAME = 'formula-visuals';

// This function converts the flat data structure from Supabase
// into the nested object structure our application uses.
const fromSupabase = (row: any): Formula => {
  if (!row) return {} as Formula;
  const formula: Formula = {
    id: row.id,
    created_at: row.created_at,
    title: { en: row.title_en, my: row.title_my },
    category: { en: row.category_en, my: row.category_my },
    shortDescription: { en: row.short_description_en, my: row.short_description_my },
    longDescription: { en: row.long_description_en || [], my: row.long_description_my || [] },
    syntax: row.syntax,
    example: row.example,
    exampleExplanation: { en: row.example_explanation_en, my: row.example_explanation_my },
    visualExplanation: { imageUrl: '' }, // Initialize with empty object
  };

  if (row.image_url) {
    formula.visualExplanation = {
      imageUrl: row.image_url,
    };
  }

  return formula;
};


// This function converts our application's nested data structure
// into the flat structure Supabase uses.
const toSupabase = (formula: Partial<Omit<Formula, 'created_at' | 'id'>>) => {
    const row: { [key: string]: any } = {};

    if (formula.title) {
        row.title_en = formula.title.en;
        row.title_my = formula.title.my;
    }
    if (formula.category) {
        row.category_en = formula.category.en;
        row.category_my = formula.category.my;
    }
    if (formula.shortDescription) {
        row.short_description_en = formula.shortDescription.en;
        row.short_description_my = formula.shortDescription.my;
    }
    if (formula.longDescription) {
        row.long_description_en = formula.longDescription.en;
        row.long_description_my = formula.longDescription.my;
    }
    if (formula.syntax) row.syntax = formula.syntax;
    if (formula.example) row.example = formula.example;
    if (formula.exampleExplanation) {
        row.example_explanation_en = formula.exampleExplanation.en;
        row.example_explanation_my = formula.exampleExplanation.my;
    }
    
    // Check hasOwnProperty to handle cases where visualExplanation is explicitly set to null or undefined
    if (Object.prototype.hasOwnProperty.call(formula, 'visualExplanation')) {
        row.image_url = formula.visualExplanation?.imageUrl || null;
    }

    return row;
};

const uploadImage = async (file: File, formulaId: number | string): Promise<VisualExplanation> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${formulaId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

    if (uploadError) {
        console.error("Error uploading image: ", uploadError);
        throw new Error(`Image upload failed: ${uploadError.message}`);
    }
    
    const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return {
        imageUrl: publicUrlData.publicUrl,
    };
};

const deleteImage = async (imageUrl: string) => {
    if (!imageUrl) return;
    try {
        const url = new URL(imageUrl);
        const filePath = url.pathname.split(`/${BUCKET_NAME}/`)[1];
        if (filePath) {
            const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
            if (error) {
                console.error("Failed to delete image from storage:", error.message);
                // Don't throw, just log the error. The record deletion is more important.
            }
        }
    } catch (e) {
        console.error("Invalid image URL, cannot delete from storage:", imageUrl, e);
    }
}

export const addFormula = async (formula: Omit<Formula, 'created_at' | 'id'>, file: File | null): Promise<Formula> => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
        throw new Error("Not authenticated");
    }
    
    // Convert to Supabase format, but leave image_url null for now
    const initialRowData = toSupabase(formula);
    delete initialRowData.image_url;
    
    // Insert the formula record without an image_url first
    const { data: insertedData, error: insertError } = await supabase
        .from('formulas')
        .insert(initialRowData)
        .select()
        .single();

    if (insertError || !insertedData) {
        throw new Error(`Could not create formula: ${insertError?.message}`);
    }

    // If a file was provided, upload it now
    if (file) {
        const visualExplanation = await uploadImage(file, insertedData.id);
        
        // Update the record with the new image_url
        const { data: updatedData, error: updateError } = await supabase
            .from('formulas')
            .update({ image_url: visualExplanation.imageUrl })
            .eq('id', insertedData.id)
            .select()
            .single();

        if (updateError || !updatedData) {
            // Attempt to clean up the uploaded image if the DB update fails
            await deleteImage(visualExplanation.imageUrl);
            throw new Error(`Failed to update formula with image details: ${updateError?.message}`);
        }
        return fromSupabase(updatedData);
    }

    return fromSupabase(insertedData);
}

export const updateFormula = async (id: number, formulaUpdate: Partial<Omit<Formula, 'created_at'>>, file: File | null): Promise<Formula> => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
        throw new Error("Not authenticated");
    }

    // First, get the current formula record to check for an existing image
    const { data: currentFormula, error: fetchError } = await supabase
        .from('formulas')
        .select('image_url')
        .eq('id', id)
        .single();
    
    if (fetchError) {
        throw new Error("Could not retrieve current formula to update.");
    }

    const oldImageUrl = currentFormula?.image_url;
    let updateData = toSupabase(formulaUpdate);

    // Scenario 1: A new file is being uploaded.
    if (file) {
        // Delete the old image if it exists.
        if (oldImageUrl) {
            await deleteImage(oldImageUrl);
        }
        // Upload the new one and get its details.
        const visualExplanation = await uploadImage(file, id);
        updateData.image_url = visualExplanation.imageUrl;
    } 
    // Scenario 2: The image is being removed (imageUrl explicitly set to empty/null), but no new file is uploaded.
    else if (formulaUpdate.visualExplanation && !formulaUpdate.visualExplanation.imageUrl && oldImageUrl) {
        await deleteImage(oldImageUrl);
        updateData.image_url = null;
    }

    const { data, error } = await supabase
        .from('formulas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }
    return fromSupabase(data);
}

export const deleteFormula = async (id: number): Promise<void> => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
        throw new Error("Not authenticated");
    }
    
    // First, fetch the record to get the image URL.
    const { data: formulaData, error: fetchError } = await supabase
        .from('formulas')
        .select('image_url')
        .eq('id', id)
        .single();
    
    // If the record exists and has an image, delete the image from storage.
    if (!fetchError && formulaData?.image_url) {
        await deleteImage(formulaData.image_url);
    }
    
    // Now, delete the record from the database.
    const { error: deleteError } = await supabase
        .from('formulas')
        .delete()
        .eq('id', id);

    if (deleteError) {
        throw new Error(`Failed to delete formula record: ${deleteError.message}`);
    }
}
