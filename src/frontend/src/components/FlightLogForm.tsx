import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useEntities } from '../hooks/useEntities';
import { useCreateFlightLog, useUpdateFlightLog } from '../hooks/useFlightLogs';
import { calculateTotalHours, formatTime } from '../utils/timeCalculations';
import type { FlightLog } from '../backend';

interface FlightLogFormProps {
  flightLog?: FlightLog | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function FlightLogForm({ flightLog, onSuccess, onCancel }: FlightLogFormProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [studentId, setStudentId] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [aircraftId, setAircraftId] = useState('');
  const [exerciseId, setExerciseId] = useState('');
  const [flightType, setFlightType] = useState<'Solo' | 'Dual'>('Dual');
  const [landingType, setLandingType] = useState<'Day' | 'Night'>('Day');
  const [landingCount, setLandingCount] = useState('1');
  const [takeoffTime, setTakeoffTime] = useState('');
  const [landingTime, setLandingTime] = useState('');

  const { students, instructors, aircraft, exercises } = useEntities();
  const createFlightLog = useCreateFlightLog();
  const updateFlightLog = useUpdateFlightLog();

  const isEditMode = !!flightLog;

  useEffect(() => {
    if (flightLog) {
      setDate(new Date(flightLog.date));
      setStudentId(flightLog.studentId);
      setInstructorId(flightLog.instructorId);
      setAircraftId(flightLog.aircraftId);
      setExerciseId(flightLog.exerciseId);
      setFlightType(flightLog.flightType as 'Solo' | 'Dual');
      setLandingType(flightLog.landingType as 'Day' | 'Night');
      setLandingCount(flightLog.landingCount.toString());
      setTakeoffTime(flightLog.takeoffTime);
      setLandingTime(flightLog.landingTime);
    }
  }, [flightLog]);

  const totalHours = calculateTotalHours(takeoffTime, landingTime);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      date: format(date, 'yyyy-MM-dd'),
      studentId,
      instructorId,
      aircraftId,
      exerciseId,
      flightType,
      landingType,
      landingCount: BigInt(parseInt(landingCount) || 0),
      takeoffTime,
      landingTime,
    };

    try {
      if (isEditMode && flightLog) {
        await updateFlightLog.mutateAsync({
          id: flightLog.id,
          ...formData,
        });
      } else {
        await createFlightLog.mutateAsync(formData);
      }

      // Reset form
      if (!isEditMode) {
        setDate(new Date());
        setStudentId('');
        setInstructorId('');
        setAircraftId('');
        setExerciseId('');
        setFlightType('Dual');
        setLandingType('Day');
        setLandingCount('1');
        setTakeoffTime('');
        setLandingTime('');
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving flight log:', error);
    }
  };

  const handleCancel = () => {
    setDate(new Date());
    setStudentId('');
    setInstructorId('');
    setAircraftId('');
    setExerciseId('');
    setFlightType('Dual');
    setLandingType('Day');
    setLandingCount('1');
    setTakeoffTime('');
    setLandingTime('');
    onCancel?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? 'Edit Flight Log Entry' : 'New Flight Log Entry'}</CardTitle>
        <CardDescription>
          {isEditMode ? 'Update the flight log details below.' : 'Enter flight details to create a new log entry.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <Select value={studentId} onValueChange={setStudentId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.data?.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Select value={instructorId} onValueChange={setInstructorId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select instructor" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.data?.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aircraft">Aircraft</Label>
              <Select value={aircraftId} onValueChange={setAircraftId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select aircraft" />
                </SelectTrigger>
                <SelectContent>
                  {aircraft.data?.map((ac) => (
                    <SelectItem key={ac.id} value={ac.id}>
                      {ac.registration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exercise">Exercise</Label>
              <Select value={exerciseId} onValueChange={setExerciseId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.data?.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flightType">Flight Type</Label>
              <Select value={flightType} onValueChange={(val) => setFlightType(val as 'Solo' | 'Dual')} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Solo">Solo</SelectItem>
                  <SelectItem value="Dual">Dual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="landingType">Landing Type</Label>
              <Select value={landingType} onValueChange={(val) => setLandingType(val as 'Day' | 'Night')} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Day">Day</SelectItem>
                  <SelectItem value="Night">Night</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="landingCount">Landing Count</Label>
              <Input
                id="landingCount"
                type="number"
                min="0"
                value={landingCount}
                onChange={(e) => setLandingCount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="takeoffTime">Takeoff Time (HH:MM)</Label>
              <Input
                id="takeoffTime"
                type="time"
                value={takeoffTime}
                onChange={(e) => setTakeoffTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="landingTime">Landing Time (HH:MM)</Label>
              <Input
                id="landingTime"
                type="time"
                value={landingTime}
                onChange={(e) => setLandingTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Total Hours</Label>
              <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm">
                {formatTime(totalHours)} hours
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={createFlightLog.isPending || updateFlightLog.isPending}>
              {(createFlightLog.isPending || updateFlightLog.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Update Entry' : 'Submit Entry'}
            </Button>
            {isEditMode && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
