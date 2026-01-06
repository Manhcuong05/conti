import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatting";
export interface PricingTier {
  id: string;
  name: string;
  priceVND: number;
  priceSuffix: string;
  features: string[];
  isFeatured?: boolean;
}
interface PricingTableProps {
  tiers: PricingTier[];
}
export function PricingTable({ tiers }: PricingTableProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {tiers.map((tier) => (
        <Card key={tier.id} className={cn(
          "flex flex-col transition-all duration-300", 
          tier.isFeatured && "border-primary ring-2 ring-primary shadow-lg"
        )}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
            <CardDescription>
              <span className="text-4xl font-bold text-foreground">{formatCurrency(tier.priceVND)}</span>
              <span className="text-muted-foreground">{tier.priceSuffix}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-3">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className={cn(
              "w-full", 
              tier.isFeatured ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}>
              Chọn gói
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}