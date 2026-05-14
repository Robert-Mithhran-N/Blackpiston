import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { createRequest } from '@/lib/api';
import { PackageSearch, Loader2, CheckCircle2 } from 'lucide-react';
import { useUserAuth } from '@/context/UserAuthContext';

export function ProductRequestModal({ 
  children,
  defaultProduct = ""
}: { 
  children: React.ReactNode;
  defaultProduct?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useUserAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    userName: user?.name || '',
    userEmail: user?.email || '',
    userPhone: user?.phone || '',
    productName: defaultProduct,
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userName || !formData.userPhone || !formData.productName) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createRequest({
        ...formData,
        requestType: 'PRODUCT_INQUIRY'
      });
      setIsSuccess(true);
      toast({
        title: "Request Submitted",
        description: "We'll get back to you about this product shortly.",
      });
      setTimeout(() => {
        setOpen(false);
        setIsSuccess(false);
        setFormData(prev => ({ ...prev, productName: defaultProduct, message: '' }));
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        setIsSuccess(false);
        setFormData(prev => ({ ...prev, productName: defaultProduct, message: '' }));
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-hidden border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <PackageSearch className="h-5 w-5 text-primary" />
            Request a Product
          </DialogTitle>
          <DialogDescription>
            Can't find what you're looking for? Let us know and we'll source it for you.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-300">
            <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Request Received!</h3>
            <p className="text-muted-foreground text-sm">
              Our team will check availability and contact you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name / Details *</Label>
              <Input
                id="productName"
                name="productName"
                placeholder="e.g. Brembo RCS19 Corsa Corta"
                value={formData.productName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Your Name *</Label>
                <Input
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userPhone">Phone Number *</Label>
                <Input
                  id="userPhone"
                  name="userPhone"
                  type="tel"
                  value={formData.userPhone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userEmail">Email Address</Label>
              <Input
                id="userEmail"
                name="userEmail"
                type="email"
                value={formData.userEmail}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Additional Notes (Optional)</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Specific bike model, year, color preferences..."
                value={formData.message}
                onChange={handleChange}
                rows={3}
                className="resize-none"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-orange-500 hover:opacity-90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
