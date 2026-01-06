import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
export interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaText: string;
  ctaLink?: string;
}
export function ServiceCard({ icon, title, description, ctaText, ctaLink = "/pricing" }: ServiceCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
          <div className="p-3 bg-muted rounded-lg text-primary">{icon}</div>
          <CardTitle className="text-xl font-semibold mt-0 pt-2">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <p className="text-muted-foreground flex-grow">{description}</p>
          <Button variant="ghost" asChild className="justify-start p-0 h-auto mt-4 text-primary hover:text-primary/80">
            <Link to={ctaLink}>
              {ctaText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
export function ServiceCardSkeleton() {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 pt-1">
                    <Skeleton className="h-6 w-40" />
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                <div className="space-y-2 flex-grow">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
                <Skeleton className="h-5 w-32 mt-4" />
            </CardContent>
        </Card>
    );
}