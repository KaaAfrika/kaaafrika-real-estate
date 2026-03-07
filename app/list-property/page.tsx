"use client";

import { useState, ChangeEvent } from "react";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { createProperty, uploadMedia } from "@/services/propertyService";

type FormState = {
  title: string;
  description: string;
  condition: string;
  listing_type: string;
  category: string;
  country: string;
  state: string;
  city: string;
  street_address: string;
  second_address: string;
  price: number | "";
  negotiable: string;
  contact_email: string;
  contact_phone_number: string;
  currency: string;
  rent_cycle: string;
  listed_by: string;
};

export default function ListPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    condition: "",
    listing_type: "",
    category: "",
    country: "",
    state: "",
    city: "",
    street_address: "",
    second_address: "",
    price: "",
    negotiable: "Not Negotiable", // Defaulted value
    contact_email: "",
    contact_phone_number: "",
    currency: "NGN", // default currency
    rent_cycle: "", // default none
    listed_by: "Owner", // default lister
  });

  // Separate lists for uploaded URLs - these are the source of truth for media
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedProofs, setUploadedProofs] = useState<string[]>([]);

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingProofs, setUploadingProofs] = useState(false);

  const handleChange = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => setForm((p) => ({ ...p, [key]: value }));

  // Rent cycle and lister option lists (you asked these to be options)
  const rentCycles = [
    "Hourly",
    "Daily",
    "Monthly",
    "Quarterly",
    "Biannual",
    "Yearly",
  ];
  const propertyListers = ["Owner", "Property Mgr", "Agent", "Tenant"];

  const validate = (): string | null => {
    if (!form.title.trim()) return "Title is required";
    if (!form.description.trim()) return "Description is required";
    if (
      form.price === "" ||
      Number.isNaN(Number(form.price)) ||
      Number(form.price) <= 0
    )
      return "Valid price greater than zero is required";
    if (!form.listing_type.trim())
      return "Listing type is required (e.g. Rent or Sale)";
    if (!form.category.trim()) return "Category is required";
    if (!form.contact_phone_number.trim())
      return "Contact phone number is required";
    if (uploadedImages.length === 0)
      return "At least one property image is required";
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    const body = {
      title: form.title.trim(),
      street_address: form.street_address.trim(),
      country: form.country.trim() || undefined,
      state: form.state.trim() || "",
      city: form.city.trim() || "",
      second_address:
        form.second_address.trim() === "" ? "_" : form.second_address.trim(),
      currency: form.currency || "NGN",
      rent_cycle: form.rent_cycle || "_",
      price: Number(form.price),
      contact_phone_number: form.contact_phone_number.trim(),
      contact_email: form.contact_email.trim() || undefined,
      description: form.description.trim(),
      condition: form.condition.trim(),
      listing_type: form.listing_type.trim(),
      negotiable: form.negotiable.trim() || "Not Negotiable",
      image_urls: uploadedImages,
      proof_of_ownership_urls: uploadedProofs,
      category: form.category.trim(),
      listed_by: form.listed_by.trim() || "Owner",
    };

    try {
      setLoading(true);
      await createProperty(body);
      setShowSuccess(true);
    } catch (err: any) {
      console.error("create property error:", err);
      setError(err?.message || "Failed to submit property");
    } finally {
      setLoading(false);
    }
  };

  // inside your component file (or a helper imported by it)
  const MAX_IMAGES = 10;
  const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB max (adjust if needed)

  async function uploadFiles(
    files: FileList | null,
    mediaFor: string,
    onStart: () => void,
    onFinish: () => void,
    onAddUrls: (urls: string[]) => void,
    inputElement: HTMLInputElement | null
  ) {
    if (!files || files.length === 0) return;
    setError(null);
    onStart();

    try {
      // Validate & prepare file array
      const validFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (f.size > MAX_FILE_SIZE_BYTES) {
          // skip large files but inform user
          setError(`File ${f.name} exceeds maximum size of 10MB`);
          continue;
        }
        validFiles.push(f);
      }

      // If uploading property images, enforce MAX_IMAGES limit
      if (mediaFor === "property") {
        const remaining = MAX_IMAGES - uploadedImages.length;
        if (remaining <= 0) {
          setError(`You can only upload up to ${MAX_IMAGES} images`);
          return;
        }
        if (validFiles.length > remaining) {
          validFiles.splice(remaining); // keep first `remaining` files
        }
      }

      // Create an array of upload promises (concurrent)
      const uploadPromises = validFiles.map(async (file) => {
        const fd = new FormData();
        fd.append("file", file);
        // server may expect specific 'type' values - adjust if needed
        const inferredType = file.type.startsWith("image/")
          ? "image"
          : file.type.includes("pdf")
          ? "document"
          : "document";
        fd.append("type", inferredType);
        fd.append("media_for", mediaFor);
        // extra helpful metadata for server validation
        fd.append("mime_type", file.type || "application/octet-stream");
        fd.append("original_name", file.name);

        // call your axios-based uploadMedia
        const res = await uploadMedia(fd);

        // Accept multiple possible shapes: { url }, { data: { url } }, or raw string
        const url =
          (res && (res.url || res.data?.url)) ||
          (typeof res === "string" ? res : null);

        if (!url) {
          console.warn("[uploadFiles] upload returned no url:", res);
          throw new Error("Upload did not return a usable url");
        }

        return url as string;
      });

      const urls = await Promise.all(uploadPromises);
      if (urls.length > 0) onAddUrls(urls);
    } catch (err: any) {
      console.error("[uploadFiles] error:", err);
      setError(err?.message || "Failed to upload files");
    } finally {
      onFinish();
      // Clear input element so user can re-select same files if needed
      if (inputElement) inputElement.value = "";
    }
  }

  // image handlers
  const handleImageFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
    uploadFiles(
      e.target.files,
      "property", // mediaFor
      () => setUploadingImages(true),
      () => setUploadingImages(false),
      (urls) => {
        setUploadedImages((prev) => [...prev, ...urls]); // Simplified update
      },
      e.target // Pass the input element for clearing
    );
  };

  // proof handlers
  const handleProofFilesSelected = (e: ChangeEvent<HTMLInputElement>) =>
    uploadFiles(
      e.target.files,
      "proof", // mediaFor
      () => setUploadingProofs(true),
      () => setUploadingProofs(false),
      (urls) => {
        setUploadedProofs((prev) => [...prev, ...urls]); // Simplified update
      },
      e.target // Pass the input element for clearing
    );

  const removeUploadedImage = (idx: number) => {
    setUploadedImages((p) => {
      const arr = [...p];
      arr.splice(idx, 1);
      return arr;
    });
  };

  const removeUploadedProof = (idx: number) => {
    setUploadedProofs((p) => {
      const arr = [...p];
      arr.splice(idx, 1);
      return arr;
    });
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <div className="h-32 w-32 rounded-full bg-green-600 flex items-center justify-center">
              <svg
                className="h-16 w-16 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-8">
            You've Successfully Listed
            <br />
            Your Property
          </h1>
          <Button
            onClick={() => router.push("/")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-12 h-12 text-base font-medium"
          >
            Go back home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-8 relative">
        <button
          onClick={() => router.push("/")}
          className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X className="h-5 w-5 text-foreground" />
        </button>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            List Property
          </h1>
          <p className="text-muted-foreground">
            Fill out the form below to list your property
          </p>
        </div>

        {error && (
          <p className="text-sm text-center text-red-600 mb-4">{error}</p>
        )}

        <div className="space-y-4">
          <Input
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Title"
            className="h-12 rounded-xl bg-muted/50 border-0"
          />

          <Textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Property Description"
            className="min-h-[100px] rounded-xl bg-muted/50 border-0 resize-none"
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              type="number"
              value={form.price}
              onChange={(e) =>
                handleChange(
                  "price",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              placeholder="Price"
              className="h-12 rounded-xl bg-muted/50 border-0"
            />

            <select
              value={form.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              className="h-12 rounded-xl bg-muted/50 border-0 px-3"
            >
              <option value="NGN">NGN</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
            </select>

            <select
              value={form.rent_cycle}
              onChange={(e) => handleChange("rent_cycle", e.target.value)}
              className="h-12 rounded-xl bg-muted/50 border-0 px-3"
            >
              <option value="">Select Rent Cycle</option>
              {rentCycles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <select
              value={form.negotiable}
              onChange={(e) => handleChange("negotiable", e.target.value)}
              className="h-12 rounded-xl bg-muted/50 border-0 px-3"
            >
              <option value="">Select Negotiable</option>
              <option value="Negotiable">Negotiable</option>
              <option value="Not Negotiable">Not Negotiable</option>
            </select>

            <select
              value={form.condition}
              onChange={(e) => handleChange("condition", e.target.value)}
              className="h-12 rounded-xl bg-muted/50 border-0 px-3"
            >
              <option value="">Select Condition</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
            </select>

            <select
              value={form.listing_type}
              onChange={(e) => handleChange("listing_type", e.target.value)}
              className="h-12 rounded-xl bg-muted/50 border-0 px-3 pr-10"
            >
              <option value="">Select Listing Type</option>
              <option value="Rent">Rent</option>
              <option value="Sale">Sale</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="h-12 rounded-xl bg-muted/50 border-0 px-3 pr-10"
            >
              <option value="">Select Category</option>
              <option value="Apartment">Apartment</option>
              <option value="Roommate">Roommate</option>
              <option value="House">House</option>
              <option value="Villa">Villa</option>
              <option value="Studio">Studio</option>
              <option value="Duplex">Duplex</option>
              <option value="Bungalow">Bungalow</option>
              <option value="Commercial Property">Commercial Property</option>
              <option value="Land">Land</option>
              <option value="Office">Office</option>
              <option value="Other">Other</option>
              <option value="Guest House">Guest House</option>
            </select>

            <Input
              value={form.street_address}
              onChange={(e) => handleChange("street_address", e.target.value)}
              placeholder="Street Address"
              className="h-12 rounded-xl bg-muted/50 border-0 pr-10"
            />
          </div>

          <Input
            value={form.second_address}
            onChange={(e) => handleChange("second_address", e.target.value)}
            placeholder="Second Address (optional)"
            className="h-12 rounded-xl bg-muted/50 border-0 pr-10"
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="City"
              className="h-12 rounded-xl bg-muted/50 border-0"
            />
            <Input
              value={form.state}
              onChange={(e) => handleChange("state", e.target.value)}
              placeholder="State"
              className="h-12 rounded-xl bg-muted/50 border-0"
            />
            <Input
              value={form.country}
              onChange={(e) => handleChange("country", e.target.value)}
              placeholder="Country"
              className="h-12 rounded-xl bg-muted/50 border-0"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              value={form.contact_email}
              onChange={(e) => handleChange("contact_email", e.target.value)}
              placeholder="Contact email"
              className="h-12 rounded-xl bg-muted/50 border-0"
            />
            <div>
              <Input
                value={form.contact_phone_number}
                onChange={(e) =>
                  handleChange("contact_phone_number", e.target.value)
                }
                placeholder="Contact phone no"
                className="h-12 rounded-xl bg-muted/50 border-0"
              />
              <select
                value={form.listed_by}
                onChange={(e) => handleChange("listed_by", e.target.value)}
                className="mt-2 h-10 rounded-xl bg-muted/50 border-0 px-3 w-full"
              >
                {propertyListers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ----------------- UPLOADS SECTION ----------------- */}
          <div className="pt-4 space-y-6">
            {/* Property images upload */}
            <div>
              <label className="block mb-2 text-sm font-medium text-foreground">
                Property Images **(Required)**
              </label>
              <div className="border-2 border-dashed border-muted rounded-xl p-6 text-center mb-3">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Upload property images
                </p>
                <p className="text-xs text-muted-foreground">
                  Select image files to upload. (Max 10 images)
                </p>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <label htmlFor="image-upload-input">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      id="image-upload-input"
                      onChange={handleImageFilesSelected}
                      disabled={uploadingImages || uploadedImages.length >= 10}
                    />
                    <Button
                      variant="outline"
                      asChild
                      disabled={uploadingImages || uploadedImages.length >= 10}
                    >
                      <span>
                        {uploadingImages
                          ? "Uploading..."
                          : uploadedImages.length >= 10
                          ? "Max Images Reached"
                          : "Choose images"}
                      </span>
                    </Button>
                  </label>

                  <div className="text-sm">
                    {uploadingImages
                      ? "Uploading..."
                      : `No. images: ${uploadedImages.length}`}
                  </div>
                </div>
              </div>

              {/* Display uploaded images as thumbnails */}
              {uploadedImages.length > 0 && (
                <div className="space-y-2 mb-3">
                  <p className="text-sm text-muted-foreground">
                    Uploaded property images
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {uploadedImages.map((u, i) => (
                      <div
                        key={u + i}
                        className="relative rounded overflow-hidden border"
                      >
                        <img
                          src={u}
                          alt={`uploaded ${i}`}
                          className="w-full h-24 object-cover"
                        />
                        <button
                          onClick={() => removeUploadedImage(i)}
                          className="absolute top-1 right-1 bg-white/80 rounded-full p-1"
                          title="Remove"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <hr className="border-t border-muted" />

            {/* Proof of ownership upload */}
            <div>
              <label className="block mb-2 text-sm font-medium text-foreground">
                Proof of ownership (files)
              </label>
              <div className="border-2 border-dashed border-muted rounded-xl p-6 text-center mb-3">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Upload proof documents (e.g., deed, utility bill)
                </p>
                <p className="text-xs text-muted-foreground">
                  Select files to upload (images or PDFs).
                </p>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <label htmlFor="proof-upload-input">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      multiple
                      className="hidden"
                      id="proof-upload-input"
                      onChange={handleProofFilesSelected}
                      disabled={uploadingProofs}
                    />
                    <Button
                      variant="outline"
                      asChild
                      disabled={uploadingProofs}
                    >
                      <span>
                        {uploadingProofs
                          ? "Uploading..."
                          : "Choose proof files"}
                      </span>
                    </Button>
                  </label>

                  <div className="text-sm">
                    {uploadingProofs
                      ? "Uploading..."
                      : `No. proofs: ${uploadedProofs.length}`}
                  </div>
                </div>
              </div>

              {/* Display proof URLs */}
              {uploadedProofs.length > 0 && (
                <div className="space-y-2 mb-3">
                  <p className="text-sm text-muted-foreground">
                    Uploaded proof URLs
                  </p>
                  <div className="space-y-2">
                    {uploadedProofs.map((u, i) => (
                      <div
                        key={u + i}
                        className="flex items-center justify-between gap-2 border rounded p-2"
                      >
                        <a
                          href={u}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate text-blue-600 hover:underline text-sm"
                        >
                          {u.split("/").pop() || u}
                        </a>
                        <button
                          onClick={() => removeUploadedProof(i)}
                          className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                          title="Remove"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center gap-3 pt-6 border-t">
            <Button onClick={() => router.push("/")} variant="ghost">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || uploadingImages || uploadingProofs}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-full px-6"
            >
              {loading ? "Submitting..." : "Submit property"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
