import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MapPin, Plus, Trash2, Edit2, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const addressSchema = z.object({
  address_line_1: z.string().min(5, "Address must be at least 5 characters").max(200),
  address_line_2: z.string().max(200).optional(),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State is required").max(100),
  postal_code: z.string().min(4, "Postal code is required").max(20),
  contact_number: z.string().min(10, "Contact number must be at least 10 digits").max(15),
});

type AddressFormData = z.infer<typeof addressSchema>;

const AddressManagementPage = () => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address_line_1: "",
      address_line_2: "",
      city: "",
      state: "",
      postal_code: "",
      contact_number: "",
    },
  });

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch addresses
  const { data: addresses, isLoading } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("customer_addresses")
        .select("*")
        .eq("customer_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Add/Update address mutation
  const saveAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData & { id?: string }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { id, ...addressFields } = data;
      
      if (id) {
        // Update existing address
        const { error } = await supabase
          .from("customer_addresses")
          .update({
            address_line_1: addressFields.address_line_1,
            address_line_2: addressFields.address_line_2 || null,
            city: addressFields.city,
            state: addressFields.state,
            postal_code: addressFields.postal_code,
            contact_number: addressFields.contact_number,
          })
          .eq("id", id);
        if (error) throw error;
      } else {
        // Insert new address
        const { error } = await supabase
          .from("customer_addresses")
          .insert({
            customer_id: user.id,
            address_line_1: addressFields.address_line_1,
            address_line_2: addressFields.address_line_2 || null,
            city: addressFields.city,
            state: addressFields.state,
            postal_code: addressFields.postal_code,
            contact_number: addressFields.contact_number,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast({
        title: "Success",
        description: editingId ? "Address updated successfully" : "Address added successfully",
      });
      form.reset();
      setIsAddingNew(false);
      setEditingId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("customer_addresses")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast({
        title: "Success",
        description: "Address deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Set default address mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      // First, unset all default addresses
      await supabase
        .from("customer_addresses")
        .update({ is_default: false })
        .eq("customer_id", user.id);

      // Then set the selected one as default
      const { error } = await supabase
        .from("customer_addresses")
        .update({ is_default: true })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast({
        title: "Success",
        description: "Default address updated",
      });
    },
  });

  const onSubmit = (data: AddressFormData) => {
    saveAddressMutation.mutate({
      ...data,
      id: editingId || undefined,
    });
  };

  const handleEdit = (address: any) => {
    setEditingId(address.id);
    setIsAddingNew(true);
    form.reset({
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || "",
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      contact_number: address.contact_number,
    });
  };

  const handleCancelEdit = () => {
    setIsAddingNew(false);
    setEditingId(null);
    form.reset();
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
              <CardDescription>Please login to manage your addresses</CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Delivery Addresses</h1>
              <p className="text-muted-foreground mt-1">Manage your delivery addresses</p>
            </div>
            {!isAddingNew && (
              <Button onClick={() => setIsAddingNew(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Address
              </Button>
            )}
          </div>

          {isAddingNew && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{editingId ? "Edit Address" : "Add New Address"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="address_line_1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 1</FormLabel>
                          <FormControl>
                            <Input placeholder="House no, Street name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address_line_2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 2 (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Landmark, Area" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="postal_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="PIN Code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contact_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={saveAddressMutation.isPending}>
                        {saveAddressMutation.isPending ? "Saving..." : editingId ? "Update Address" : "Save Address"}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="text-center py-8">Loading addresses...</div>
          ) : addresses && addresses.length > 0 ? (
            <div className="grid gap-4">
              {addresses.map((address) => (
                <Card key={address.id} className={address.is_default ? "border-primary" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          {address.is_default && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="font-medium">{address.address_line_1}</p>
                        {address.address_line_2 && <p className="text-sm text-muted-foreground">{address.address_line_2}</p>}
                        <p className="text-sm text-muted-foreground">
                          {address.city}, {address.state} - {address.postal_code}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Contact: {address.contact_number}</p>
                      </div>
                      <div className="flex gap-2">
                        {!address.is_default && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDefaultMutation.mutate(address.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(address)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteAddressMutation.mutate(address.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No addresses saved yet</p>
                <Button className="mt-4" onClick={() => setIsAddingNew(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Address
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddressManagementPage;
