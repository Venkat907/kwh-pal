import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useUpsertReading } from '@/hooks/use-electricity-data';
import { calculateSlabBill } from '@/lib/electricity-pricing';
import { toast } from 'sonner';

export const LogUsageDialog = () => {
  const { authUser, costPerKwh } = useApp();
  const upsertReading = useUpsertReading();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [kwh, setKwh] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser?.id || !kwh) return;

    const usage = parseFloat(kwh);
    if (isNaN(usage) || usage < 0) {
      toast.error('Please enter a valid usage value');
      return;
    }

    upsertReading.mutate(
      {
        userId: authUser.id,
        date,
        usage_kwh: usage,
        cost: Number((usage * costPerKwh).toFixed(2)),
      },
      {
        onSuccess: () => {
          toast.success('Usage reading logged successfully');
          setOpen(false);
          setKwh('');
        },
        onError: () => {
          toast.error('Failed to log usage reading');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          Log Usage
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Daily Usage</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="log-date">Date</Label>
            <Input
              id="log-date"
              type="date"
              value={date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="log-kwh">Usage (kWh)</Label>
            <Input
              id="log-kwh"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 12.5"
              value={kwh}
              onChange={(e) => setKwh(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={upsertReading.isPending}>
              {upsertReading.isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
