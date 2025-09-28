import React, { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import type { Location, CheckIn } from "../types";
import { toast } from "sonner";

const Home: React.FC = () => {
  const [locations] = useLocalStorage<Location[]>("locations", []);
  const [, setCheckIns] = useLocalStorage<CheckIn[]>("checkIns", []);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [observations, setObservations] = useState("");
  const [checklistItems, setChecklistItems] = useState([
    {
      id: "fill-audit",
      label: "Fill Audit",
      completed: false,
      mandatory: true,
    },
    {
      id: "check-locks",
      label: "Check Locks",
      completed: false,
      mandatory: false,
    },
    {
      id: "verify-signage",
      label: "Verify Signage",
      completed: false,
      mandatory: false,
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocationId) return;

    // Validate that the selected date is not in the future
    const today = new Date().toISOString().split("T")[0];
    if (selectedDate > today) {
      toast.error(
        "Cannot check-in for future dates. Please select today or a past date."
      );
      return;
    }

    // Validate that all mandatory checklist items are completed
    const incompleteMandatoryItems = checklistItems.filter(
      (item) => item.mandatory && !item.completed
    );
    if (incompleteMandatoryItems.length > 0) {
      toast.error(
        `Please complete all mandatory checklist items: ${incompleteMandatoryItems
          .map((item) => item.label)
          .join(", ")}`
      );
      return;
    }

    const newCheckIn: CheckIn = {
      id: Date.now().toString(),
      date: selectedDate,
      locationId: selectedLocationId,
      observations,
      checklistItems: checklistItems,
    };

    setCheckIns((prev) => [...prev, newCheckIn]);
    setObservations("");
    toast.success("Check-in saved successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl">📍</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            New Audit
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Record your visit to a store
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <span>📅</span>
                <span>Date</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
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
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                required
              >
                <option value="">Select a store</option>
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
              <span>Observations (Optional)</span>
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={3}
              placeholder="Add any notes about your visit..."
              className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <span>✅</span>
              <span>Checklist</span>
            </label>
            <div className="space-y-2">
              {checklistItems.map((item, index) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={`checklist-${item.id}`}
                    checked={item.completed}
                    onChange={(e) => {
                      const newChecklistItems = [...checklistItems];
                      newChecklistItems[index].completed = e.target.checked;
                      setChecklistItems(newChecklistItems);
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label
                    htmlFor={`checklist-${item.id}`}
                    className={`text-sm font-medium ${
                      item.mandatory ? "text-red-700" : "text-gray-700"
                    }`}
                  >
                    {item.label}
                    {item.mandatory && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              * Required items must be completed for the check-in to be valid
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg text-sm sm:text-base"
          >
            🚀 Check In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
