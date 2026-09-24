import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/common/rating-stars";
import { SaveButton } from "@/components/service/save-button";
import { formatCurrency } from "@/lib/utils";
import type { ServiceListItem } from "@/types";

export function ServiceCard({ service }: { service: ServiceListItem }) {
  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary">{service.category.name}</Badge>
          {service.provider.isAvailable ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <span className="size-1.5 rounded-full bg-emerald-500" /> Available
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Unavailable</span>
          )}
        </div>
        <h3 className="line-clamp-1 text-base font-semibold leading-snug">
          <Link href={`/services/${service.id}`} className="hover:underline">
            {service.title}
          </Link>
        </h3>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
        <RatingStars rating={service.provider.ratingAvg} count={service.provider.ratingCount} href={`/services/${service.id}#reviews`} />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{service.provider.name}</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" /> {service.provider.city}
            <SaveButton serviceId={service.id} />
          </span>
        </div>
      </CardContent>
      <CardFooter className="items-end justify-between border-t pt-4">
        <div>
          <p className="text-lg font-bold">{formatCurrency(service.price)}</p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" /> {service.durationMins} min
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href={`/services/${service.id}`}>View details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
