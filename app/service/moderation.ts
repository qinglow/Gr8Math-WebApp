'use server'

import { createClient } from "@/lib/supabase/server";

/**
 * THE AUTOMOD ENGINE: Checks text against your DB table only.
 */
export async function checkContentModeration(text: string) {
    const supabase = await createClient();
    
    // Get all words from your banned_words table
    const { data: bannedWords } = await supabase.from('banned_words').select('word');
    const wordList = bannedWords?.map(d => d.word) || [];

    const lowercaseText = text.toLowerCase();

    // Check if any word from your DB exists in the student's text
    const offendingWord = wordList.find(banned => 
        lowercaseText.includes(banned.toLowerCase())
    );

    return offendingWord ? { isSafe: false, offendingWord } : { isSafe: true };
}

/**
 * Fetch the list for the Dashboard UI
 */
export async function getCustomBannedWords() {
    const supabase = await createClient();
    const { data } = await supabase.from('banned_words').select('word');
    return data?.map(d => d.word) || [];
}

/**
 * Add a new word to the DB
 */
export async function addBannedWord(word: string) {
    const supabase = await createClient();
    return await supabase.from('banned_words').insert({ word: word.toLowerCase() });
}

/**
 * Remove a word from the DB
 */
export async function removeBannedWord(word: string) {
    const supabase = await createClient();
    return await supabase.from('banned_words').delete().eq('word', word);
}