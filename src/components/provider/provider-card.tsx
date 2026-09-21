import Link from "next/link";
import { MapPin, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "@/components/common/rating-stars";
import { formatCurrency } from "@/lib/utils";
import type { ProviderListItem } from "@/types";

export function ProviderCard({ provider }: { provider: ProviderListItem }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-start gap-4 p-5">
        <Avatar className="size-14 border">
          <AvatarImage src={provider.avatarUrl ?? undefined} alt={provider.name} />
          <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
            {provider.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold leading-none">
              <Link href={`/providers/${provider.id}`} className="hover:underline">
                {provider.name}
              </Link>
            </h3>
            {provider.isAvailable ? (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Available</Badge>
            ) : (
              <Badge variant="secondary">Busy</Badge>
            )}
          </div>
          <RatingStars rating={provider.ratingAvg} count={provider.ratingCount} />
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" /> {provider.city}
              {provider.area ? ` · ${provider.area}` : ""}
            </span>
            <span className="inline-flex items-center gap-1">
              <Briefcase className="size-3.5" /> {provider.completedJobs} jobs · {provider.yearsExperience}y exp
            </span>
          </p>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-xs text-muted-foreground">from</p>
          <p className="font-bold">{formatCurrency(provider.basePrice)}</p>
          <Button size="sm" variant="outline" className="mt-2" asChild>
            <Link href={`/providers/${provider.id}`}>View profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
