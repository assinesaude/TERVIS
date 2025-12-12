import { supabase } from './supabase';

const DAILY_LIMIT = 1000;

export async function getRemainingTokens(userId: string): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('usage_tokens')
      .select('tokens_used')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (error) {
      console.error('Error fetching token usage:', error);
      return DAILY_LIMIT;
    }

    const used = data?.tokens_used || 0;
    return Math.max(0, DAILY_LIMIT - used);
  } catch (error) {
    console.error('Error in getRemainingTokens:', error);
    return DAILY_LIMIT;
  }
}
