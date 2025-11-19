import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type ReviewItem = { id: string; name: string; email?: string; rating: number; message: string; createdAt: string; status: 'visible' | 'hidden' };

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  rating: z.coerce.number().min(1, 'Min 1').max(5, 'Max 5'),
  message: z.string().min(10, 'Please share at least 10 characters'),
});
type FormValues = z.infer<typeof schema>;

async function fetchReviews(): Promise<ReviewItem[]> {
  const r = await fetch('/api/reviews');
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || 'Failed to load reviews');
  return j.items as ReviewItem[];
}

export default function ReviewsPage() {
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['reviews-public'], queryFn: fetchReviews, staleTime: 30_000 });
  const [successOpen, setSuccessOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', rating: 5, message: '' },
  });

  const submitReview = useMutation({
    mutationFn: async (values: FormValues) => {
      const r = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to submit');
      return j;
    },
    onSuccess: () => {
      form.reset();
      setSuccessOpen(true);
      qc.invalidateQueries({ queryKey: ['reviews-public'] });
    },
  });

  return (
    <div className="flex flex-col">
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-4xl sm:text-5xl mb-4">Reviews</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Read what our customers say and share your experience.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              {isLoading && <Card className="p-6">Loading reviews...</Card>}
              {isError && <Card className="p-6 text-red-600">{(error as Error)?.message}</Card>}
              {!isLoading && !isError && (!data || data.length === 0) && (
                <Card className="p-6 text-muted-foreground">No reviews yet. Be the first to write one!</Card>
              )}
              {data?.map((rv) => (
                <Card key={rv.id} className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{rv.name}</div>
                    <div className="text-sm text-muted-foreground">{new Date(rv.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="mb-2">{'★'.repeat(rv.rating)}{'☆'.repeat(Math.max(0, 5 - rv.rating))}</div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{rv.message}</p>
                </Card>
              ))}
            </div>

            <Card className="p-8">
              <h2 className="font-heading font-bold text-2xl mb-6">Post a Review</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((v) => submitReview.mutate(v))} className="space-y-6">
                  <FormField name="name" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl><Input placeholder="Your name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="email" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (optional)</FormLabel>
                      <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="rating" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating (1-5)</FormLabel>
                      <FormControl><Input type="number" min={1} max={5} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="message" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review</FormLabel>
                      <FormControl><Textarea className="min-h-[120px]" placeholder="Share your experience..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={submitReview.isPending}>{submitReview.isPending ? 'Submitting...' : 'Submit Review'}</Button>
                </form>
              </Form>
            </Card>
          </div>
        </div>
      </section>

      <AlertDialog open={successOpen} onOpenChange={setSuccessOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thank you! 🎉</AlertDialogTitle>
            <AlertDialogDescription>Your review has been submitted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSuccessOpen(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
