import React, { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import type { Location } from "../types";

const ManageLocations: React.FC = () => {
  const [locations, setLocations] = useLocalStorage<Location[]>(
    "locations",
    []
  );

  // Migrate existing locations to have colors
  React.useEffect(() => {
    setLocations((prev) =>
      prev.map((loc) => ({
        ...loc,
        color:
          loc.color || colorOptions[prev.indexOf(loc) % colorOptions.length],
      }))
    );
  }, []);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [editingId, setEditingId] = useState<string | null>(null);

  const colorOptions = [
    "#3B82F6", // Blue
    "#EF4444", // Red
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#84CC16", // Lime
    "#F97316", // Orange
    "#6366F1", // Indigo
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      setLocations((prev) =>
        prev.map((loc) =>
          loc.id === editingId ? { ...loc, name, color } : loc
        )
      );
      setEditingId(null);
    } else {
      const newLocation: Location = {
        id: Date.now().toString(),
        name,
        color,
      };
      setLocations((prev) => [...prev, newLocation]);
    }
    setName("");
  };

  const handleEdit = (location: Location) => {
    setName(location.name);
    setColor(location.color || "#3B82F6");
    setEditingId(location.id);
  };

  const handleDelete = (id: string) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl">🏢</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Manage Locations
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Add, edit, and remove locations
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-6 mb-6 sm:mb-8"
        >
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <span>📍</span>
              <span>Location Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter location name..."
              className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <span>🎨</span>
              <span>Color</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                    color === colorOption
                      ? "border-gray-900 scale-110"
                      : "border-gray-300 hover:scale-105"
                  }`}
                  style={{ backgroundColor: colorOption }}
                  title={`Select ${colorOption}`}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <span>{editingId ? "✏️" : "➕"}</span>
              <span>{editingId ? "Update" : "Add"} Location</span>
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setName("");
                  setColor("#3B82F6");
                }}
                className="bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center text-sm sm:text-base"
              >
                <span>❌</span>
              </button>
            )}
          </div>
        </form>

        <div className="space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Your Locations
          </h2>
          {locations.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <span className="text-3xl sm:text-4xl mb-2 block">📭</span>
              <p className="text-sm sm:text-base">No locations added yet</p>
            </div>
          ) : (
            locations.map((location) => (
              <div
                key={location.id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 space-y-2 sm:space-y-0"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: location.color || "#3B82F6" }}
                  ></div>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">
                    {location.name}
                  </span>
                </div>
                <div className="flex space-x-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleEdit(location)}
                    className="bg-yellow-500 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-yellow-600 transform hover:scale-105 transition-all duration-200 flex items-center space-x-1 text-xs sm:text-sm"
                  >
                    <span>✏️</span>
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(location.id)}
                    className="bg-red-500 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-red-600 transform hover:scale-105 transition-all duration-200 flex items-center space-x-1 text-xs sm:text-sm"
                  >
                    <span>🗑️</span>
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageLocations;
