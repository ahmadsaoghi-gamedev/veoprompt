import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User, Package, Save, X } from 'lucide-react';
import { Character, VideoObject } from '../types';
import { saveCharacter, getCharacters, deleteCharacter, saveObject, getObjects, deleteObject } from '../utils/database';

const AssetManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'characters' | 'objects'>('characters');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [objects, setObjects] = useState<VideoObject[]>([]);
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [showObjectForm, setShowObjectForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [editingObject, setEditingObject] = useState<VideoObject | null>(null);

  const [characterForm, setCharacterForm] = useState({
    name: '',
    age: 25,
    hairColor: '',
    faceShape: '',
    accessories: '',
    bodyShape: '',
    height: '',
    additionalFeatures: ''
  });

  const [objectForm, setObjectForm] = useState({
    name: '',
    category: 'products',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [charactersData, objectsData] = await Promise.all([
        getCharacters(),
        getObjects()
      ]);
      setCharacters(charactersData);
      setObjects(objectsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const resetCharacterForm = () => {
    setCharacterForm({
      name: '',
      age: 25,
      hairColor: '',
      faceShape: '',
      accessories: '',
      bodyShape: '',
      height: '',
      additionalFeatures: ''
    });
    setEditingCharacter(null);
    setShowCharacterForm(false);
  };

  const resetObjectForm = () => {
    setObjectForm({
      name: '',
      category: 'products',
      description: ''
    });
    setEditingObject(null);
    setShowObjectForm(false);
  };

  const handleSaveCharacter = async () => {
    try {
      const character: Character = {
        id: editingCharacter?.id || `char_${Date.now()}`,
        ...characterForm,
        createdAt: editingCharacter?.createdAt || new Date(),
        updatedAt: new Date()
      };

      await saveCharacter(character);
      await loadData();
      resetCharacterForm();
    } catch (error) {
      console.error('Failed to save character:', error);
    }
  };

  const handleSaveObject = async () => {
    try {
      const object: VideoObject = {
        id: editingObject?.id || `obj_${Date.now()}`,
        ...objectForm,
        createdAt: editingObject?.createdAt || new Date(),
        updatedAt: new Date()
      };

      await saveObject(object);
      await loadData();
      resetObjectForm();
    } catch (error) {
      console.error('Failed to save object:', error);
    }
  };

  const handleEditCharacter = (character: Character) => {
    setCharacterForm({
      name: character.name,
      age: character.age,
      hairColor: character.hairColor,
      faceShape: character.faceShape,
      accessories: character.accessories,
      bodyShape: character.bodyShape,
      height: character.height,
      additionalFeatures: character.additionalFeatures
    });
    setEditingCharacter(character);
    setShowCharacterForm(true);
  };

  const handleEditObject = (object: VideoObject) => {
    setObjectForm({
      name: object.name,
      category: object.category,
      description: object.description
    });
    setEditingObject(object);
    setShowObjectForm(true);
  };

  const handleDeleteCharacter = async (id: string) => {
    if (confirm('Are you sure you want to delete this character?')) {
      try {
        await deleteCharacter(id);
        await loadData();
      } catch (error) {
        console.error('Failed to delete character:', error);
      }
    }
  };

  const handleDeleteObject = async (id: string) => {
    if (confirm('Are you sure you want to delete this object?')) {
      try {
        await deleteObject(id);
        await loadData();
      } catch (error) {
        console.error('Failed to delete object:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveSubTab('characters')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeSubTab === 'characters'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white/80 text-gray-700 hover:bg-white'
          }`}
        >
          <User className="w-5 h-5" />
          Characters
        </button>
        <button
          onClick={() => setActiveSubTab('objects')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeSubTab === 'objects'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white/80 text-gray-700 hover:bg-white'
          }`}
        >
          <Package className="w-5 h-5" />
          Objects
        </button>
      </div>

      {/* Characters Tab */}
      {activeSubTab === 'characters' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Character Management</h2>
            <button
              onClick={() => setShowCharacterForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Character
            </button>
          </div>

          {/* Character Form */}
          {showCharacterForm && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingCharacter ? 'Edit Character' : 'Create New Character'}
                </h3>
                <button
                  onClick={resetCharacterForm}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={characterForm.name}
                    onChange={(e) => setCharacterForm({ ...characterForm, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Character name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={characterForm.age}
                    onChange={(e) => setCharacterForm({ ...characterForm, age: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hair Color</label>
                  <input
                    type="text"
                    value={characterForm.hairColor}
                    onChange={(e) => setCharacterForm({ ...characterForm, hairColor: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Black, Brown, Blonde"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Face Shape</label>
                  <select
                    value={characterForm.faceShape}
                    onChange={(e) => setCharacterForm({ ...characterForm, faceShape: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select face shape</option>
                    <option value="oval">Oval</option>
                    <option value="round">Round</option>
                    <option value="square">Square</option>
                    <option value="heart">Heart</option>
                    <option value="diamond">Diamond</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Body Shape</label>
                  <select
                    value={characterForm.bodyShape}
                    onChange={(e) => setCharacterForm({ ...characterForm, bodyShape: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select body shape</option>
                    <option value="slim">Slim</option>
                    <option value="athletic">Athletic</option>
                    <option value="average">Average</option>
                    <option value="curvy">Curvy</option>
                    <option value="plus-size">Plus Size</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                  <select
                    value={characterForm.height}
                    onChange={(e) => setCharacterForm({ ...characterForm, height: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select height</option>
                    <option value="short">Short (under 5'4")</option>
                    <option value="average">Average (5'4" - 5'8")</option>
                    <option value="tall">Tall (over 5'8")</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accessories</label>
                  <input
                    type="text"
                    value={characterForm.accessories}
                    onChange={(e) => setCharacterForm({ ...characterForm, accessories: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Glasses, Hat, Jewelry"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Features</label>
                  <textarea
                    value={characterForm.additionalFeatures}
                    onChange={(e) => setCharacterForm({ ...characterForm, additionalFeatures: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any additional character details..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={resetCharacterForm}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCharacter}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Character
                </button>
              </div>
            </div>
          )}

          {/* Characters List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <div key={character.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{character.name}</h3>
                    <p className="text-sm text-gray-600">Age: {character.age}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCharacter(character)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCharacter(character.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Hair:</span> {character.hairColor}</p>
                  <p><span className="font-medium">Face:</span> {character.faceShape}</p>
                  <p><span className="font-medium">Body:</span> {character.bodyShape}</p>
                  <p><span className="font-medium">Height:</span> {character.height}</p>
                  {character.accessories && (
                    <p><span className="font-medium">Accessories:</span> {character.accessories}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Objects Tab */}
      {activeSubTab === 'objects' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Object Management</h2>
            <button
              onClick={() => setShowObjectForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Object
            </button>
          </div>

          {/* Object Form */}
          {showObjectForm && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingObject ? 'Edit Object' : 'Create New Object'}
                </h3>
                <button
                  onClick={resetObjectForm}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={objectForm.name}
                    onChange={(e) => setObjectForm({ ...objectForm, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Object name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={objectForm.category}
                    onChange={(e) => setObjectForm({ ...objectForm, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="products">Products</option>
                    <option value="clothing">Clothing</option>
                    <option value="vehicles">Vehicles</option>
                    <option value="furniture">Furniture</option>
                    <option value="electronics">Electronics</option>
                    <option value="food">Food & Drinks</option>
                    <option value="nature">Nature</option>
                    <option value="buildings">Buildings</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={objectForm.description}
                    onChange={(e) => setObjectForm({ ...objectForm, description: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Detailed description of the object..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={resetObjectForm}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveObject}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Object
                </button>
              </div>
            </div>
          )}

          {/* Objects List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {objects.map((object) => (
              <div key={object.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{object.name}</h3>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {object.category}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditObject(object)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteObject(object.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-3">{object.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManagement;