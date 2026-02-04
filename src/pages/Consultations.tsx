import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Phone, Calendar, Stethoscope, Sparkles } from "lucide-react";

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  experience: number;
  consultations: number;
  phone: string;
  avatar: string;
}

const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Aditi Sharma",
    specialization: "Gynecologist",
    experience: 12,
    consultations: 1480,
    phone: "+91-9820012345",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=aditi",
  },
  {
    id: 2,
    name: "Dr. Rhea Kapoor",
    specialization: "Pediatrician",
    experience: 9,
    consultations: 1120,
    phone: "+91-9830019999",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=rhea",
  },
  {
    id: 3,
    name: "Dr. Meera Nair",
    specialization: "Lactation Consultant",
    experience: 7,
    consultations: 860,
    phone: "+91-9811122233",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=meera",
  },
  {
    id: 4,
    name: "Dr. Kavya Singh",
    specialization: "Mental Health Therapist",
    experience: 11,
    consultations: 1320,
    phone: "+91-9770098877",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=kavya",
  },
];

export const Consultations = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    // Replace with API later
    setDoctors(mockDoctors);
  }, []);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleAppointment = (doctor: Doctor) => {
    alert(`Booking appointment with ${doctor.name}...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background pb-20">
      <div className="container max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between mb-6 animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Consult a Doctor
            </h1>
            <p className="text-muted-foreground text-sm">
              Book appointments or talk to trusted experts instantly.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Trusted, curated experts</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-75">
        {doctors.map((doctor) => (
          <Card
            key={doctor.id}
            className="bg-card text-card-foreground shadow-sm rounded-lg border border-border/50 hover:shadow-lg hover:-translate-y-1 transition"
          >
            <CardContent className="pt-6">
              {/* Avatar */}
              
              <div className="flex justify-center mb-4">
                <img
                  src={doctor.avatar}
                  alt={doctor.name}
                  className="w-20 h-20 rounded-full object-cover shadow"
                />
              </div>

              {/* Name */}
              <h2 className="text-lg font-semibold text-center">
                {doctor.name}
              </h2>

              <p className="text-center text-muted-foreground text-sm">
                {doctor.specialization}
              </p>

              {/* Experience + Consultations */}
              <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Stethoscope className="w-4 h-4" />
                  {doctor.experience} yrs exp.
                </span>
                <span>{doctor.consultations} consults</span>
              </div>

              {/* Buttons */}
              <div className="flex justify-center mt-6 flex-row gap-3">
                <Button
                  className="flex w-full"
                  onClick={() => handleCall(doctor.phone)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>

                <Button
                  className="flex w-full"
                  variant="secondary"
                  onClick={() => handleAppointment(doctor)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Consult
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      </div>
    </div>
  );
};

