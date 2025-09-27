import React, { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import type { Location, CheckIn, PlannedCheckIn } from "../types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const Overview: React.FC = () => {
  const [checkIns, setCheckIns] = useLocalStorage<CheckIn[]>("checkIns", []);
  const [plannedCheckIns, setPlannedCheckIns] = useLocalStorage<
    PlannedCheckIn[]
  >("plannedCheckIns", []);
  const [locations] = useLocalStorage<Location[]>("locations", []);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCheckIn, setEditingCheckIn] = useState<CheckIn | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editLocationId, setEditLocationId] = useState("");
  const [editObservations, setEditObservations] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [checkInToDelete, setCheckInToDelete] = useState<CheckIn | null>(null);

  // Group check-ins and planned check-ins by date
  const checkInsByDate: Record<string, CheckIn[]> = {};
  const plannedCheckInsByDate: Record<string, PlannedCheckIn[]> = {};

  checkIns.forEach((checkIn) => {
    if (!checkInsByDate[checkIn.date]) {
      checkInsByDate[checkIn.date] = [];
    }
    checkInsByDate[checkIn.date].push(checkIn);
  });

  plannedCheckIns.forEach((plannedCheckIn) => {
    if (!plannedCheckInsByDate[plannedCheckIn.date]) {
      plannedCheckInsByDate[plannedCheckIn.date] = [];
    }
    plannedCheckInsByDate[plannedCheckIn.date].push(plannedCheckIn);
  });

  // Helper to get location name
  const getLocationName = (locationId: string) => {
    const location = locations.find((loc) => loc.id === locationId);
    return location ? location.name : "Unknown";
  };

  // Helper to get location color
  const getLocationColor = (locationId: string) => {
    const location = locations.find((loc) => loc.id === locationId);
    return location ? location.color || "#3B82F6" : "#3B82F6";
  };

  // Get the color for a day (use the most recent check-in's location color, or planned check-in if no actual check-ins)
  const getDayColor = (dateStr: string) => {
    const dayCheckIns = checkInsByDate[dateStr];
    const dayPlannedCheckIns = plannedCheckInsByDate[dateStr];

    if (dayCheckIns && dayCheckIns.length > 0) {
      // Sort by time (assuming newer IDs are more recent)
      const sortedCheckIns = dayCheckIns.sort((a, b) =>
        b.id.localeCompare(a.id)
      );
      return getLocationColor(sortedCheckIns[0].locationId);
    } else if (dayPlannedCheckIns && dayPlannedCheckIns.length > 0) {
      // Show planned check-ins with a lighter/different style
      return getLocationColor(dayPlannedCheckIns[0].locationId) + "80"; // Add transparency
    }

    return "#3B82F6";
  };

  // Get days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null); // Empty cells for days before the first day
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    calendarDays.push(dateStr);
  }

  const handleDayClick = (dateStr: string | null) => {
    if (
      dateStr &&
      (checkInsByDate[dateStr] || plannedCheckInsByDate[dateStr])
    ) {
      setSelectedDay(dateStr);
      setShowModal(true);
    }
  };

  const convertToCheckIn = (plannedCheckIn: PlannedCheckIn) => {
    const newCheckIn: CheckIn = {
      id: Date.now().toString(),
      date: plannedCheckIn.date,
      locationId: plannedCheckIn.locationId,
      observations: plannedCheckIn.notes,
    };

    // Add to check-ins
    setCheckIns((prev) => [...prev, newCheckIn]);

    // Remove from planned check-ins
    setPlannedCheckIns((prev) =>
      prev.filter((pci) => pci.id !== plannedCheckIn.id)
    );

    toast.success("Planned check-in converted to actual check-in!");
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDay(null);
    setEditingCheckIn(null);
    setEditDate("");
    setEditLocationId("");
    setEditObservations("");
  };

  const startEditing = (checkIn: CheckIn) => {
    setEditingCheckIn(checkIn);
    setEditDate(checkIn.date);
    setEditLocationId(checkIn.locationId);
    setEditObservations(checkIn.observations);
  };

  const cancelEditing = () => {
    setEditingCheckIn(null);
    setEditDate("");
    setEditLocationId("");
    setEditObservations("");
  };

  const saveEdit = () => {
    if (!editingCheckIn || !editLocationId) return;

    const updatedCheckIn: CheckIn = {
      ...editingCheckIn,
      date: editDate,
      locationId: editLocationId,
      observations: editObservations,
    };

    // Update check-ins using the setter
    setCheckIns((prevCheckIns) =>
      prevCheckIns.map((checkIn) =>
        checkIn.id === editingCheckIn.id ? updatedCheckIn : checkIn
      )
    );

    // Reset editing state
    cancelEditing();
  };

  const deleteCheckIn = (checkInId: string) => {
    setCheckIns((prevCheckIns) =>
      prevCheckIns.filter((checkIn) => checkIn.id !== checkInId)
    );
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const today = new Date().toISOString().split("T")[0];

  // Get ISO week number
  const getISOWeek = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
    return `${d.getFullYear()}-W${weekNo.toString().padStart(2, "0")}`;
  };

  // Check weekly validation
  const getWeeklyAlerts = () => {
    const alerts = [];
    const locationsCount = locations.length;
    const checkInsByWeek: Record<string, CheckIn[]> = {};

    checkIns.forEach((checkIn) => {
      const week = getISOWeek(new Date(checkIn.date));
      if (!checkInsByWeek[week]) {
        checkInsByWeek[week] = [];
      }
      checkInsByWeek[week].push(checkIn);
    });

    for (const [week, weekCheckIns] of Object.entries(checkInsByWeek)) {
      if (weekCheckIns.length !== locationsCount) {
        alerts.push({
          week,
          expected: locationsCount,
          actual: weekCheckIns.length,
          status: weekCheckIns.length > locationsCount ? "excess" : "missing",
        });
      }
    }

    return alerts;
  };

  const weeklyAlerts = getWeeklyAlerts();

  const exportToCSV = () => {
    // Validate date range
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      toast.error("From date cannot be after To date");
      return;
    }

    let filteredCheckIns = checkIns;

    // Filter by date range if specified
    if (fromDate || toDate) {
      filteredCheckIns = checkIns.filter((checkIn) => {
        const checkInDate = new Date(checkIn.date);
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;

        if (from && checkInDate < from) return false;
        if (to && checkInDate > to) return false;
        return true;
      });
    }

    const csvHeaders = "ID,Date,Location,Observations\n";
    const csvRows = filteredCheckIns
      .map((checkIn) => {
        const locationName = getLocationName(checkIn.locationId);
        // Escape commas and quotes in observations
        const escapedObservations = checkIn.observations
          .replace(/"/g, '""')
          .replace(/\n/g, " ");
        return `"${checkIn.id}","${checkIn.date}","${locationName}","${escapedObservations}"`;
      })
      .join("\n");

    const csvContent = csvHeaders + csvRows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Create filename based on date range
    let filename = "checkins";
    if (fromDate || toDate) {
      if (fromDate && toDate) {
        filename += `_${fromDate}_to_${toDate}`;
      } else if (fromDate) {
        filename += `_from_${fromDate}`;
      } else if (toDate) {
        filename += `_to_${toDate}`;
      }
    } else {
      filename += `_${new Date().toISOString().split("T")[0]}`;
    }
    filename += ".csv";

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📅</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Check-In Calendar
          </h1>
          <p className="text-gray-600 mb-6">View your check-ins by date</p>

          {/* Weekly Alerts */}
          {weeklyAlerts.length > 0 && (
            <div className="mb-6 space-y-2">
              {weeklyAlerts.map((alert) => (
                <div
                  key={alert.week}
                  className={`p-3 rounded-lg border ${
                    alert.status === "excess"
                      ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {alert.status === "excess" ? "⚠️" : "❌"}
                    </span>
                    <span className="font-medium">
                      Week {alert.week}: {alert.actual} check-ins (expected{" "}
                      {alert.expected})
                    </span>
                  </div>
                  <p className="text-sm mt-1">
                    {alert.status === "excess"
                      ? `You have ${
                          alert.actual - alert.expected
                        } extra check-ins this week.`
                      : `You are missing ${
                          alert.expected - alert.actual
                        } check-ins this week.`}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Date Range Filter */}
          <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
              <span>📅</span>
              <span className="text-sm sm:text-base">
                Filter by Date Range (Optional)
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  From Date:
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  To Date:
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                />
              </div>
            </div>
            {(fromDate || toDate) && (
              <div className="mt-3 sm:mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs sm:text-sm text-blue-800">
                  📊 Exporting check-ins {fromDate && `from ${fromDate}`}{" "}
                  {fromDate && toDate && " "} {toDate && `to ${toDate}`}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={exportToCSV}
            className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center space-x-2 mx-auto"
          >
            <span>📊</span>
            <span>Export to CSV</span>
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={goToPreviousMonth}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center space-x-2"
          >
            <span>⬅️</span>
            <span>Previous</span>
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={goToNextMonth}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center space-x-2"
          >
            <span>Next</span>
            <span>➡️</span>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center font-bold text-gray-700 py-3 text-sm uppercase tracking-wide"
              >
                {day}
              </div>
            ))}
            {calendarDays.map((dateStr, index) => (
              <div
                key={index}
                className={`text-center py-3 sm:py-4 px-1 sm:px-2 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-110 ${
                  dateStr
                    ? `hover:shadow-lg ${
                        checkInsByDate[dateStr] ||
                        plannedCheckInsByDate[dateStr]
                          ? `text-white shadow-md`
                          : "bg-white hover:bg-gray-100"
                      } ${
                        dateStr === today
                          ? "ring-4 ring-green-400 ring-opacity-50"
                          : ""
                      }`
                    : ""
                }`}
                style={{
                  backgroundColor:
                    dateStr &&
                    (checkInsByDate[dateStr] || plannedCheckInsByDate[dateStr])
                      ? getDayColor(dateStr)
                      : undefined,
                }}
                onClick={() => handleDayClick(dateStr)}
              >
                {dateStr ? (
                  <div className="relative">
                    <span
                      className={`text-base sm:text-lg font-semibold ${
                        checkInsByDate[dateStr] ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {new Date(dateStr).getDate()}
                    </span>
                    {(checkInsByDate[dateStr] ||
                      plannedCheckInsByDate[dateStr]) && (
                      <div className="absolute -top-1 -right-1 flex space-x-1">
                        {checkInsByDate[dateStr] && (
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-yellow-400 text-xs font-bold text-gray-900 rounded-full">
                            {checkInsByDate[dateStr].length}
                          </span>
                        )}
                        {plannedCheckInsByDate[dateStr] && (
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-400 text-xs font-bold text-white rounded-full border-2 border-white">
                            {plannedCheckInsByDate[dateStr].length}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  ""
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal &&
        selectedDay &&
        (checkInsByDate[selectedDay] || plannedCheckInsByDate[selectedDay]) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-lg sm:text-xl">📅</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Check-ins for {selectedDay}
                </h3>
              </div>
              <ul className="space-y-3 mb-4 sm:mb-6">
                {/* Actual Check-ins */}
                {checkInsByDate[selectedDay]?.map((checkIn) => (
                  <li
                    key={checkIn.id}
                    className="p-3 sm:p-4 bg-gray-50 rounded-lg"
                  >
                    {editingCheckIn?.id === checkIn.id ? (
                      // Edit form
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Location
                            </label>
                            <select
                              value={editLocationId}
                              onChange={(e) =>
                                setEditLocationId(e.target.value)
                              }
                              className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select location</option>
                              {locations.map((location) => (
                                <option key={location.id} value={location.id}>
                                  {location.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Observations
                          </label>
                          <textarea
                            value={editObservations}
                            onChange={(e) =>
                              setEditObservations(e.target.value)
                            }
                            rows={2}
                            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Add notes..."
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={saveEdit}
                            className="flex-1 bg-green-500 text-white py-2 px-3 rounded text-xs sm:text-sm font-medium hover:bg-green-600 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="flex-1 bg-gray-500 text-white py-2 px-3 rounded text-xs sm:text-sm font-medium hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <>
                        <div className="flex justify-between items-start">
                          <div className="font-semibold text-gray-900 flex items-center space-x-2 text-sm sm:text-base flex-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: getLocationColor(
                                  checkIn.locationId
                                ),
                              }}
                            ></div>
                            <span>{getLocationName(checkIn.locationId)}</span>
                          </div>
                          <div className="flex space-x-1 ml-2">
                            <button
                              onClick={() => startEditing(checkIn)}
                              className="text-blue-600 hover:text-blue-800 p-1 text-sm"
                              title="Edit check-in"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => setCheckInToDelete(checkIn)}
                              className="text-red-600 hover:text-red-800 p-1 text-sm"
                              title="Delete check-in"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        {checkIn.observations && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-2">
                            {checkIn.observations}
                          </p>
                        )}
                      </>
                    )}
                  </li>
                ))}

                {/* Planned Check-ins */}
                {plannedCheckInsByDate[selectedDay]?.map((plannedCheckIn) => (
                  <li
                    key={`planned-${plannedCheckIn.id}`}
                    className="p-3 sm:p-4 bg-blue-50 border-2 border-blue-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-gray-900 flex items-center space-x-2 text-sm sm:text-base flex-1">
                        <div
                          className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                          style={{
                            backgroundColor: getLocationColor(
                              plannedCheckIn.locationId
                            ),
                          }}
                        ></div>
                        <span>
                          {getLocationName(plannedCheckIn.locationId)}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                          Planned
                        </span>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => convertToCheckIn(plannedCheckIn)}
                          className="text-green-600 hover:text-green-800 p-1 text-sm"
                          title="Convert to actual check-in"
                        >
                          ✅
                        </button>
                      </div>
                    </div>
                    {plannedCheckIn.notes && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-2">
                        {plannedCheckIn.notes}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              <button
                onClick={closeModal}
                className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!checkInToDelete}
        onOpenChange={() => setCheckInToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Check-in</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this check-in? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setCheckInToDelete(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (checkInToDelete) {
                  deleteCheckIn(checkInToDelete.id);
                  setCheckInToDelete(null);
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Overview;
