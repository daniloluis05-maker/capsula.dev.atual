// Importing the Supabase library
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://dfnmofzbpdmnvlyowtmp.supabase.co';
const supabaseKey = 'sb_publishable_4r_KBaQvH72nw20KeZCNmw_i__dOarq';
const supabase = createClient(supabaseUrl, supabaseKey);

// Form validation function
function validateForm(form) {
    const { nome, whatsapp, apelido, objetivo } = form;
    const errors = {};

    // Validate nome
    if (!nome || nome.length < 3) {
        errors.nome = 'Nome deve ter pelo menos 3 caracteres.';
    }

    // Validate whatsapp
    const whatsappPattern = /\D/g;
    const cleanWhatsapp = whatsapp.replace(whatsappPattern, '');
    if (cleanWhatsapp.length < 10) {
        errors.whatsapp = 'Whatsapp deve conter pelo menos 10 digitos.';
    }

    // Validate objetivo
    if (!objetivo) {
        errors.objetivo = 'Objetivo é obrigatório.';
    }

    return { errors, cleanWhatsapp };
}

// Function to handle form submission
async function handleSubmit(event) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    const { errors, cleanWhatsapp } = validateForm(form);

    // Check for errors
    if (Object.keys(errors).length) {
        console.error(errors);
        // Show user feedback for errors
        alert(JSON.stringify(errors));
        return;
    }

    try {
        const { data, error } = await supabase
            .from('leads')
            .insert([{
                nome: form.nome,
                whatsapp: cleanWhatsapp,
                apelido: form.apelido || null,
                objetivo: form.objetivo,
                criado_em: new Date().toISOString(),
            }]);

        if (error) throw error;
        // Show success feedback
        alert('Dados salvos com sucesso!');
    } catch (error) {
        console.error('Erro ao inserir no banco de dados:', error);
        // Show user feedback for errors
        alert('Erro ao salvar os dados. Tente novamente.');
    }
}

// Assuming form is a <form> element, can attach handleSubmit accordingly
// form.addEventListener('submit', handleSubmit);

