import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit2, Trash2, Baby } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../context/ToastContext";
import { WeightEntry, WeightData } from "../types";

const STORAGE_KEY = "baby_weight_tracker_data";

const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const parseDate = (dateString: string): Date => {
  return new Date(dateString + "T00:00:00");
};

export const BabyWeightTracker = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [weightData, setWeightData] = useState<WeightData>({
    entries: [],
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);
  const [formData, setFormData] = useState({
    date: formatDate(new Date()),
    weight: "",
    height: "",
    headCircumference: "",
    notes: "",
  });

  useEffect(() => {
    // Load data from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setWeightData({
          entries: Array.isArray(data.entries) ? data.entries : [],
          birthWeight: data.birthWeight,
          birthHeight: data.birthHeight,
          birthHeadCircumference: data.birthHeadCircumference,
        });
      } catch (error) {
        console.error("Error loading weight data:", error);
        setWeightData({ entries: [] });
      }
    }
  }, []);

  const saveData = (data: WeightData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setWeightData(data);
  };

  const handleAddEntry = () => {
    setEditingEntry(null);
    setFormData({
      date: formatDate(new Date()),
      weight: "",
      height: "",
      headCircumference: "",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditEntry = (entry: WeightEntry) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date,
      weight: entry.weight.toString(),
      height: entry.height?.toString() || "",
      headCircumference: entry.headCircumference?.toString() || "",
      notes: entry.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      const updatedEntries = weightData.entries.filter((e) => e.id !== id);
      saveData({ ...weightData, entries: updatedEntries });
      showToast("Entry deleted", "success");
    }
  };

  const handleSubmit = () => {
    if (!formData.date || !formData.weight) {
      showToast("Please fill in date and weight", "error");
      return;
    }

    const weight = parseFloat(formData.weight);
    if (isNaN(weight) || weight <= 0) {
      showToast("Please enter a valid weight", "error");
      return;
    }

    const height = formData.height ? parseFloat(formData.height) : undefined;
    if (formData.height && (isNaN(height!) || height! <= 0)) {
      showToast("Please enter a valid height", "error");
      return;
    }

    const headCircumference = formData.headCircumference ? parseFloat(formData.headCircumference) : undefined;
    if (formData.headCircumference && (isNaN(headCircumference!) || headCircumference! <= 0)) {
      showToast("Please enter a valid head circumference", "error");
      return;
    }

    if (editingEntry) {
      // Update existing entry
      const updatedEntries = weightData.entries.map((e) =>
        e.id === editingEntry.id
          ? {
            ...e,
            date: formData.date,
            weight,
            height,
            headCircumference,
            notes: formData.notes,
          }
          : e
      );
      saveData({ ...weightData, entries: updatedEntries });
      showToast("Entry updated", "success");
    } else {
      // Add new entry
      const newEntry: WeightEntry = {
        id: Date.now().toString(),
        date: formData.date,
        weight,
        height,
        headCircumference,
        notes: formData.notes,
      };
      const updatedEntries = [...weightData.entries, newEntry].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      saveData({ ...weightData, entries: updatedEntries });
      showToast("Entry added successfully", "success");
    }

    setIsDialogOpen(false);
  };

  const sortedEntries = useMemo(() => {
    return [...weightData.entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [weightData.entries]);

  const latestEntry = sortedEntries[0];
  const previousEntry = sortedEntries[1];

  const weightGain = latestEntry && previousEntry ? latestEntry.weight - previousEntry.weight : null;
  const daysSinceLast = latestEntry
    ? Math.round((new Date().getTime() - parseDate(latestEntry.date).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background pb-20">
      <div className="container max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/trackers")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Baby Growth Tracker</h1>
            <p className="text-xs text-muted-foreground">Track weight, height & head circumference</p>
          </div>
          <Button onClick={handleAddEntry}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Card>
            <CardHeader className="pb-1 sm:pb-2 px-2 sm:px-4 pt-2 sm:pt-4">
              <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground">Current Weight</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-4 pb-2 sm:pb-4">
              <div className="text-base sm:text-xl md:text-2xl font-bold">
                {latestEntry ? `${latestEntry.weight} kg` : "—"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 sm:pb-2 px-2 sm:px-4 pt-2 sm:pt-4">
              <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground">Weight Gain</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-4 pb-2 sm:pb-4">
              <div className="text-base sm:text-xl md:text-2xl font-bold">
                {weightGain !== null ? (
                  <span className={weightGain >= 0 ? "text-green-600" : "text-red-600"}>
                    {weightGain >= 0 ? "+" : ""}
                    {weightGain.toFixed(2)} kg
                  </span>
                ) : (
                  "—"
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 sm:pb-2 px-2 sm:px-4 pt-2 sm:pt-4">
              <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground">Last Entry</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-4 pb-2 sm:pb-4">
              <div className="text-base sm:text-xl md:text-2xl font-bold">
                {daysSinceLast !== null ? (
                  daysSinceLast === 0 ? (
                    "Today"
                  ) : (
                    `${daysSinceLast}d ago`
                  )
                ) : (
                  "—"
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Growth History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Growth History</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Baby className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No growth entries yet</p>
                <p className="text-sm mt-2">Click "Add Entry" to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedEntries.map((entry, index) => {
                  const previous = sortedEntries[index + 1];
                  const weightChange = previous ? entry.weight - previous.weight : null;
                  const date = parseDate(entry.date);
                  // Calculate age from the oldest entry (birth)
                  const oldestEntry = sortedEntries[sortedEntries.length - 1];
                  const ageInDays = oldestEntry
                    ? Math.round((date.getTime() - parseDate(oldestEntry.date).getTime()) / (1000 * 60 * 60 * 24))
                    : null;

                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium">
                            {date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          {ageInDays !== null && (
                            <span className="text-xs text-muted-foreground">
                              ({ageInDays} days old)
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Weight:</span>
                            <span className="font-semibold">{entry.weight} kg</span>
                            {weightChange !== null && (
                              <span className={`text-xs ${weightChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                                ({weightChange >= 0 ? "+" : ""}
                                {weightChange.toFixed(2)} kg)
                              </span>
                            )}
                          </div>
                          {entry.height && (
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Height:</span>
                              <span className="font-semibold">{entry.height} cm</span>
                            </div>
                          )}
                          {entry.headCircumference && (
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Head:</span>
                              <span className="font-semibold">{entry.headCircumference} cm</span>
                            </div>
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
                          onClick={() => handleEditEntry(entry)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEntry(entry.id)}
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
              <DialogTitle>{editingEntry ? "Edit Entry" : "Add Growth Entry"}</DialogTitle>
              <DialogDescription>
                Record your baby's weight, height, and head circumference measurements.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="mt-1"
                  placeholder="e.g., 3.5"
                />
              </div>
              <div>
                <Label htmlFor="height">Height (cm) (optional)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="mt-1"
                  placeholder="e.g., 50.5"
                />
              </div>
              <div>
                <Label htmlFor="headCircumference">Head Circumference (cm) (optional)</Label>
                <Input
                  id="headCircumference"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.headCircumference}
                  onChange={(e) => setFormData({ ...formData, headCircumference: e.target.value })}
                  className="mt-1"
                  placeholder="e.g., 35.0"
                />
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
                  {editingEntry ? "Update" : "Add Entry"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
