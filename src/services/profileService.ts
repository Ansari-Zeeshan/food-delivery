import { insforge } from './insforgeClient';
import type { DeliveryAddress } from '../types';

export const profileService = {
  async getAddresses(userId: string): Promise<DeliveryAddress[]> {
    if (!userId) return [];

    const { data, error } = await insforge.database
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error || !data) return [];

    return data.map(a => ({
      id: a.id,
      label: a.label as any,
      name: a.recipient_name,
      phone: a.phone,
      street: a.address_line_1,
      apartment: a.address_line_2 || '',
      city: a.city,
      postalCode: a.postal_code,
      instructions: a.delivery_instructions || '',
      isDefault: a.is_default,
    }));
  },

  async addAddress(userId: string, address: Omit<DeliveryAddress, 'id'>): Promise<DeliveryAddress | null> {
    if (!userId) return null;

    if (address.isDefault) {
      await insforge.database.from('addresses').update({ is_default: false }).eq('user_id', userId);
    }

    const { data, error } = await insforge.database
      .from('addresses')
      .insert([{
        user_id: userId,
        label: address.label,
        recipient_name: address.name,
        phone: address.phone,
        address_line_1: address.street,
        address_line_2: address.apartment || null,
        city: address.city,
        postal_code: address.postalCode,
        delivery_instructions: address.instructions || null,
        is_default: address.isDefault || false,
      }])
      .select()
      .single();

    if (error || !data) {
      console.error('Add address error:', error);
      return null;
    }

    return {
      id: data.id,
      label: data.label as any,
      name: data.recipient_name,
      phone: data.phone,
      street: data.address_line_1,
      apartment: data.address_line_2 || '',
      city: data.city,
      postalCode: data.postal_code,
      instructions: data.delivery_instructions || '',
      isDefault: data.is_default,
    };
  },

  async deleteAddress(addressId: string): Promise<boolean> {
    const { error } = await insforge.database
      .from('addresses')
      .delete()
      .eq('id', addressId);

    return !error;
  },

  async updateProfile(userId: string, updates: { name?: string; phone?: string; avatar?: string }) {
    if (!userId) return;

    await insforge.database
      .from('profiles')
      .update({
        full_name: updates.name,
        phone: updates.phone,
        avatar_url: updates.avatar,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  },

  async ensureProfile(user: { id: string; email: string; name?: string; avatar?: string; phone?: string }) {
    if (!user || !user.id) return null;

    try {
      // Check if profile already exists for this auth user ID
      const { data: existing } = await insforge.database
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (existing) {
        return existing;
      }

      // Insert new profile linked to auth.users(id)
      const { data: created, error } = await insforge.database
        .from('profiles')
        .insert([{
          id: user.id,
          email: user.email,
          full_name: user.name || user.email?.split('@')[0] || 'Foody Member',
          avatar_url: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          phone: user.phone || '+91 98765 43210',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error inserting user profile record:', error);
      }
      return created;
    } catch (e) {
      console.warn('ensureProfile exception:', e);
      return null;
    }
  }
};
