import React, { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import type { Location, PlannedCheckIn } from "../types";
import { toast } from "sonner";

const Plan: React.FC = () => {
  const [locations] = useLocalStorage<Location[]>("locations", []);
  const [, setCheckIns] = useLocalStorage<PlannedCheckIn[]>(
    "plannedCheckIns",
    []
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocationId) return;

    // Validate that the selected date is not in the past
    const today = new Date().toISOString().split("T")[0];
    if (selectedDate < today) {
      toast.error(
        "Cannot plan check-ins for past dates. Please select today or a future date."
      );
      return;
    }

    const newPlannedCheckIn: PlannedCheckIn = {
      id: Date.now().toString(),
      date: selectedDate,
      locationId: selectedLocationId,
      notes,
    };

    setCheckIns((prev) => [...prev, newPlannedCheckIn]);
    setNotes("");
    toast.success("Check-in planned successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl">📅</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Plan Check-Ins
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Schedule your check-ins for future dates
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <span>📅</span>
                <span>Planned Date</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <span>🏢</span>
                <span>Location</span>
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                required
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <span>📝</span>
              <span>Notes (Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add notes about your planned visit..."
              className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 shadow-lg text-sm sm:text-base"
          >
            📅 Plan Check-In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Plan;
