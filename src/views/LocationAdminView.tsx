import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { StoreLocation } from '../types';
import { Edit2, Trash2, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

const LocationAdminView = () => {
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState<StoreLocation | null>(null);
  const [showLocationForm, setShowLocationForm] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('store_locations')
      .select('*')
      .order('sequence_number');

    if (error) {
      toast.error('Error fetching locations');
      return;
    }

    setLocations(data || []);
    setLoading(false);
  };

  const handleLocationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const locationData = {
      name: formData.get('name') as string,
      sequence_number: parseInt(formData.get('sequence_number') as string) || locations.length + 1
    };

    try {
      const { error } = editingLocation ?
        await supabase
          .from('store_locations')
          .update(locationData)
          .eq('id', editingLocation.id) :
        await supabase
          .from('store_locations')
          .insert(locationData);

      if (error) throw error;

      toast.success(`Location ${editingLocation ? 'updated' : 'added'}`);
      setEditingLocation(null);
      setShowLocationForm(false);
      form.reset();
      fetchLocations();
    } catch (error: any) {
      toast.error(error.message || 'Error saving location');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Store Locations</h2>
          <button
            onClick={() => setShowLocationForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Location
          </button>
        </div>

        {showLocationForm && (
          <form onSubmit={handleLocationSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingLocation?.name}
                  required
                  className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Sequence Number</label>
                <input
                  type="number"
                  name="sequence_number"
                  defaultValue={editingLocation?.sequence_number}
                  required
                  className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowLocationForm(false);
                  setEditingLocation(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingLocation ? 'Update Location' : 'Add Location'}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {locations.map(location => (
            <div
              key={location.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{location.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sequence: {location.sequence_number}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingLocation(location);
                    setShowLocationForm(true);
                  }}
                  className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this location?')) {
                      const { error } = await supabase
                        .from('store_locations')
                        .delete()
                        .eq('id', location.id);
                      
                      if (error) {
                        toast.error('Error deleting location');
                        return;
                      }
                      
                      toast.success('Location deleted');
                      fetchLocations();
                    }
                  }}
                  className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationAdminView;