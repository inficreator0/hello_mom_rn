import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit2, Trash2, Droplets } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../context/ToastContext";
import { PeriodEntry, CycleData } from "../types";

const STORAGE_KEY = "period_tracker_data";

const SYMPTOM_OPTIONS = [
  "Cramps",
  "Bloating",
  "Headache",
  "Mood swings",
  "Fatigue",
  "Back pain",
  "Breast tenderness",
  "Acne",
  "Nausea",
  "Other",
];

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  return { daysInMonth, startingDayOfWeek, year, month };
};

const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const parseDate = (dateString: string): Date => {
  return new Date(dateString + "T00:00:00");
};

const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date <= endDate;
};

const calculateNextPeriod = (entries: PeriodEntry[]): Date | null => {
  if (!entries || entries.length === 0) return null;

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  const lastEntry = sortedEntries[0];
  const lastStartDate = parseDate(lastEntry.startDate);
  const lastEndDate = lastEntry.endDate ? parseDate(lastEntry.endDate) : lastStartDate;

  // Calculate average cycle length
  if (entries.length >= 2) {
    const cycleLengths: number[] = [];
    for (let i = 0; i < entries.length - 1; i++) {
      const current = parseDate(entries[i].startDate);
      const previous = parseDate(entries[i + 1].startDate);
      const diff = Math.round((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 0 && diff < 45) {
        // Reasonable cycle length
        cycleLengths.push(diff);
      }
    }
    const avgCycleLength =
      cycleLengths.length > 0
        ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
        : 28;

    const nextPeriod = new Date(lastEndDate);
    nextPeriod.setDate(nextPeriod.getDate() + avgCycleLength);
    return nextPeriod;
  }

  // Default to 28 days if not enough data
  const nextPeriod = new Date(lastEndDate);
  nextPeriod.setDate(nextPeriod.getDate() + 28);
  return nextPeriod;
};

const calculateOvulation = (periodStart: Date, cycleLength: number = 28): Date => {
  // Ovulation typically occurs 14 days before next period
  const ovulation = new Date(periodStart);
  ovulation.setDate(ovulation.getDate() + (cycleLength - 14));
  return ovulation;
};

export const PeriodTracker = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [cycleData, setCycleData] = useState<CycleData>({
    entries: [],
    averageCycleLength: 28,
    averagePeriodLength: 5,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PeriodEntry | null>(null);
  const [formData, setFormData] = useState({
    startDate: formatDate(new Date()),
    endDate: "",
    symptoms: [] as string[],
    notes: "",
  });

  useEffect(() => {
    // Load data from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // Validate / ensure structure
        setCycleData({
          entries: Array.isArray(data.entries) ? data.entries : [],
          averageCycleLength: Number(data.averageCycleLength) || 28,
          averagePeriodLength: Number(data.averagePeriodLength) || 5,
        });
      } catch (error) {
        console.error("Error loading period data:", error);
        // Reset to default on error
        setCycleData({
          entries: [],
          averageCycleLength: 28,
          averagePeriodLength: 5,
        });
      }
    }
  }, []);

  const saveData = (data: CycleData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setCycleData(data);
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const nextPeriod = useMemo(() => calculateNextPeriod(cycleData.entries), [cycleData.entries]);

  const handleAddPeriod = () => {
    setEditingEntry(null);
    setFormData({
      startDate: formatDate(new Date()),
      endDate: "",
      symptoms: [],
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditPeriod = (entry: PeriodEntry) => {
    setEditingEntry(entry);
    setFormData({
      startDate: entry.startDate,
      endDate: entry.endDate || "",
      symptoms: entry.symptoms || [],
      notes: entry.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeletePeriod = (id: string) => {
    if (window.confirm("Are you sure you want to delete this period entry?")) {
      const updatedEntries = cycleData.entries.filter((e) => e.id !== id);
      const updatedData = { ...cycleData, entries: updatedEntries };
      saveData(updatedData);
      showToast("Period entry deleted", "success");
    }
  };

  const handleSubmit = () => {
    if (!formData.startDate) {
      showToast("Please select a start date", "error");
      return;
    }

    const startDate = parseDate(formData.startDate);
    const endDate = formData.endDate ? parseDate(formData.endDate) : startDate;

    if (endDate < startDate) {
      showToast("End date must be after start date", "error");
      return;
    }

    if (editingEntry) {
      // Update existing entry
      const updatedEntries = cycleData.entries.map((e) =>
        e.id === editingEntry.id
          ? {
            ...e,
            startDate: formData.startDate,
            endDate: formData.endDate || undefined,
            symptoms: formData.symptoms,
            notes: formData.notes,
          }
          : e
      );
      saveData({ ...cycleData, entries: updatedEntries });
      showToast("Period entry updated", "success");
    } else {
      // Add new entry
      const newEntry: PeriodEntry = {
        id: Date.now().toString(),
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        symptoms: formData.symptoms,
        notes: formData.notes,
      };
      const updatedEntries = [...cycleData.entries, newEntry];

      // Calculate average cycle length
      let avgCycleLength = 28;
      if (updatedEntries.length >= 2) {
        const cycleLengths: number[] = [];
        const sorted = [...updatedEntries].sort(
          (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
        for (let i = 1; i < sorted.length; i++) {
          const diff = Math.round(
            (new Date(sorted[i].startDate).getTime() - new Date(sorted[i - 1].startDate).getTime()) /
            (1000 * 60 * 60 * 24)
          );
          if (diff > 0 && diff < 45) {
            cycleLengths.push(diff);
          }
        }
        if (cycleLengths.length > 0) {
          avgCycleLength = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
        }
      }

      // Calculate average period length
      let avgPeriodLength = 5;
      const periodLengths = updatedEntries
        .filter((e) => e.endDate)
        .map((e) => {
          const start = parseDate(e.startDate);
          const end = parseDate(e.endDate!);
          return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        });
      if (periodLengths.length > 0) {
        avgPeriodLength = Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length);
      }

      saveData({
        entries: updatedEntries,
        averageCycleLength: avgCycleLength,
        averagePeriodLength: avgPeriodLength,
      });
      showToast("Period logged successfully", "success");
    }

    setIsDialogOpen(false);
  };

  const toggleSymptom = (symptom: string) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDayStatus = (day: number): "period" | "ovulation" | "predicted" | "normal" => {
    const date = new Date(year, month, day);
    const dateString = formatDate(date);

    // Check if it's a period day
    for (const entry of cycleData.entries) {
      const start = parseDate(entry.startDate);
      const end = entry.endDate ? parseDate(entry.endDate) : start;
      if (isDateInRange(date, start, end)) {
        return "period";
      }
    }

    // Check if it's predicted next period
    if (nextPeriod && formatDate(nextPeriod) === dateString) {
      return "predicted";
    }

    // Check if it's ovulation (simplified - 14 days before predicted period)
    if (nextPeriod) {
      const ovulation = calculateOvulation(parseDate(cycleData.entries[0]?.startDate || formatDate(new Date())), cycleData.averageCycleLength);
      if (formatDate(ovulation) === dateString) {
        return "ovulation";
      }
    }

    return "normal";
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

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const sortedEntries = [...cycleData.entries].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background pb-20">
      <div className="container max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/trackers")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-l font-bold text-foreground">Menstrual Cycle Tracker</h1>
            <p className="text-xs text-muted-foreground">Track your period, ovulation & symptoms</p>
          </div>
          <Button onClick={handleAddPeriod}>
            <Plus className="h-4 w-4 mr-2" />
            Log Period
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Card>
            <CardHeader className="pb-1 sm:pb-2 px-2 sm:px-4 pt-2 sm:pt-4">
              <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground">Average Cycle</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-4 pb-2 sm:pb-4">
              <div className="text-base sm:text-xl md:text-2xl font-bold">{cycleData.averageCycleLength} days</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 sm:pb-2 px-2 sm:px-4 pt-2 sm:pt-4">
              <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground">Average Period</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-4 pb-2 sm:pb-4">
              <div className="text-base sm:text-xl md:text-2xl font-bold">{cycleData.averagePeriodLength} days</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 sm:pb-2 px-2 sm:px-4 pt-2 sm:pt-4">
              <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground">Next Period</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-4 pb-2 sm:pb-4">
              <div className="text-base sm:text-xl md:text-2xl font-bold">
                {nextPeriod
                  ? nextPeriod.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "—"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base sm:text-lg">
                {monthNames[month]} {year}
              </CardTitle>
              <div className="flex gap-1 sm:gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={() => navigateMonth("prev")}>
                  ←
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={() => navigateMonth("next")}>
                  →
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs sm:h-10 sm:text-sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square min-h-[24px] sm:min-h-[28px]" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const status = getDayStatus(day);
                const isToday =
                  day === new Date().getDate() &&
                  month === new Date().getMonth() &&
                  year === new Date().getFullYear();

                return (
                  <div
                    key={day}
                    className={`aspect-square min-h-[24px] sm:min-h-[28px] rounded-sm flex items-center justify-center text-xs font-medium transition-colors ${status === "period"
                      ? "bg-primary text-primary-foreground"
                      : status === "ovulation"
                        ? "bg-secondary text-secondary-foreground"
                        : status === "predicted"
                          ? "bg-primary/20 text-primary border border-primary"
                          : "hover:bg-muted"
                      } ${isToday ? "ring-1 ring-primary" : ""}`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 sm:mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-primary" />
                <span>Period</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-secondary" />
                <span>Ovulation</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-primary/20 border border-primary" />
                <span>Predicted</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Period History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Period History</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Droplets className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No period entries yet</p>
                <p className="text-sm mt-2">Click "Log Period" to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedEntries.map((entry) => {
                  const start = parseDate(entry.startDate);
                  const end = entry.endDate ? parseDate(entry.endDate) : start;
                  const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {start.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          {entry.endDate && entry.endDate !== entry.startDate && (
                            <span>
                              {" - "}
                              {end.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {duration} day{duration !== 1 ? "s" : ""}
                          {entry.symptoms && entry.symptoms.length > 0 && (
                            <span> • {entry.symptoms.join(", ")}</span>
                          )}
                        </div>
                        {entry.notes && (
                          <div className="text-sm text-muted-foreground mt-1">{entry.notes}</div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditPeriod(entry)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePeriod(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEntry ? "Edit Period" : "Log Period"}</DialogTitle>
              <DialogDescription>
                Record your period start and end dates, symptoms, and notes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date (optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1"
                  min={formData.startDate}
                />
              </div>
              <div>
                <Label>Symptoms</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {SYMPTOM_OPTIONS.map((symptom) => (
                    <Button
                      key={symptom}
                      type="button"
                      variant={formData.symptoms.includes(symptom) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSymptom(symptom)}
                      className="justify-start"
                    >
                      {symptom}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1"
                  rows={3}
                  placeholder="Add any additional notes..."
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  {editingEntry ? "Update" : "Log Period"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
