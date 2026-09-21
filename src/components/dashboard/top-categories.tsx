import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TopCategories({ items }: { items: { name: string; bookings: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.bookings));
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top categories by bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bookings yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((c, idx) => (
              <div key={c.name} className="flex items-center gap-3">
                <Badge variant="secondary" className="w-8 justify-center">
                  {idx + 1}
                </Badge>
                <span className="w-40 truncate font-medium">{c.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(c.bookings / max) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">{c.bookings}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}