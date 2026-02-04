import { Heart, Users, Activity, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Community",
      description: "Connect with other mothers, share experiences, and get support",
      action: "Explore Community",
      path: "/",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Activity,
      title: "Health Trackers",
      description: "Track baby's growth, feeding, sleep, and your recovery progress",
      action: "View Trackers",
      path: "/trackers",
      color: "text-accent-foreground",
      bgColor: "bg-accent/30",
    },
    {
      icon: MessageCircle,
      title: "Consultations",
      description: "Book appointments with healthcare professionals",
      action: "Find Doctors",
      path: "/consultations",
      color: "text-secondary-foreground",
      bgColor: "bg-secondary/50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background pb-20">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="text-center mb-10 animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Heart className="h-12 w-12 text-primary fill-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Hello Mom</h1>
          <p className="text-lg text-muted-foreground">
            Your supportive community for pregnancy, postpartum, and beyond
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-75">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col border border-border/50 bg-card/95"
                onClick={() => navigate(feature.path)}
              >
                <CardHeader className="flex-1">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className={`${feature.color} ${feature.bgColor} rounded-xl p-4 transition-transform hover:scale-110`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="w-full">
                      <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                      <CardDescription>
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    {feature.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="text-center">Welcome to Your Journey</CardTitle>
            <CardDescription className="text-center">
              Whether you're expecting, just gave birth, or navigating motherhood,
              you're not alone. Our community is here to support you every step of the way.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Home;

