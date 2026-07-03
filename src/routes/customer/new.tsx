import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { useState } from "react";
import { LiveMap } from "@/components/map/LiveMap";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { deliveriesApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import type { Location } from "@/types";

export const Route = createFileRoute("/customer/new")({
  component: () => (
    <AppShell requireRole="customer">
      <Inner />
    </AppShell>
  ),
});

function Inner() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [step, setStep] = useState<"pickup" | "dropoff">("pickup");
  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("2");
  const [fragile, setFragile] = useState(false);

  const create = useMutation({
    mutationFn: () =>
      deliveriesApi.create({
        customerName: user?.name ?? "Customer",
        pickup: pickup!,
        dropoff: dropoff!,
        description,
        weightKg: Number(weight) || 1,
        fragile,
      }),
    onSuccess: (d) => {
      toast.success("Delivery requested");
      navigate({ to: "/customer/tracking/$id", params: { id: d.id } });
    },
  });

  const pins = [
    pickup && { id: "p", location: pickup, color: "#10b981", label: "Pickup" },
    dropoff && { id: "d", location: dropoff, color: "#ef4444", label: "Dropoff" },
  ].filter(Boolean) as any[];

  return (
    <div className="p-4 md:p-6 space-y-4">
      <PageHeader
        eyebrow="New request"
        title="Book a delivery"
        description={`Click the map to set the ${step === "pickup" ? "pickup" : "dropoff"} location, then fill in the package details.`}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-3">
          <LiveMap
            pins={pins}
            height={460}
            onPick={(loc) => {
              if (step === "pickup") {
                setPickup({ ...loc, label: `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` });
                setStep("dropoff");
              } else {
                setDropoff({ ...loc, label: `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` });
              }
            }}
          />
        </Card>
        <Card className="p-4 space-y-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={step === "pickup" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setStep("pickup")}
            >
              Pickup {pickup && "✓"}
            </Button>
            <Button
              size="sm"
              variant={step === "dropoff" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setStep("dropoff")}
            >
              Dropoff {dropoff && "✓"}
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Package description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are we delivering?"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="w">Weight (kg)</Label>
            <Input
              id="w"
              type="number"
              min={0}
              step={0.1}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <label className="flex items-center justify-between text-sm">
            <span>Fragile</span>
            <Switch checked={fragile} onCheckedChange={setFragile} />
          </label>
          <Button
            className="w-full"
            disabled={!pickup || !dropoff || !description || create.isPending}
            onClick={() => create.mutate()}
          >
            {create.isPending ? "Requesting…" : "Request delivery"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
