"use client";

import React, { useState, ChangeEvent } from "react";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

// Use an env var for API base. Set NEXT_PUBLIC_API_BASE in your .env
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "https://your-api-base.com";

/* --------------------------- Service functions --------------------------- */
// These are minimal implementations using fetch. Replace with your api wrapper if you have one.
export async function createProperty(propertyData: Record<string, any>) {
  const res = await fetch(`${API_BASE}/properties`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(propertyData),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`createProperty failed: ${res.status} ${text}`);
  }

  return res.json();
}

// Upload media endpoint expects FormData. Returns { url: string }
export async function uploadMedia(mediaData: FormData) {
  const res = await fetch(`${API_BASE}/media`, {
    method: "POST",
    // IMPORTANT: do NOT set Content-Type header when sending FormData; browser sets the multipart boundary
    body: mediaData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`uploadMedia failed: ${res.status} ${text}`);
  }

  return res.json();
}
/* ------------------------------------------------------------------------- */

const MAX_IMAGES = 10;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per file - change as needed

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
  price: number | "";
  negotiable: string;
  contact_email: string;
  contact_phone_number: string;
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
    price: "",
    negotiable: "Not Negotiable",
    contact_email: "",
    contact_phone_number: "",
  });

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedProofs, setUploadedProofs] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingProofs, setUploadingProofs] = useState(false);

  const handleChange = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => setForm((p) => ({ ...p, [key]: value }));

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
      description: form.description.trim(),
      condition: form.condition.trim() || "N/A",
      listing_type: form.listing_type.trim(),
      category: form.category.trim(),
      country: form.country.trim() || undefined,
      state: form.state.trim() || undefined,
      city: form.city.trim() || undefined,
      street_address: form.street_address.trim() || undefined,
      price: Number(form.price),
      negotiable: form.negotiable.trim() || "Not Negotiable",
      contact_email: form.contact_email.trim() || undefined,
      contact_phone_number: form.contact_phone_number.trim(),
      image_urls: uploadedImages,
      proof_of_ownership_urls: uploadedProofs,
    } as const;

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

  // Generic uploader with client-side validation and concurrent uploads (limited)
  const uploadFiles = async (
    files: FileList | null,
    mediaFor: string,
    onStart: () => void,
    onFinish: () => void,
    onAddUrls: (urls: string[]) => void,
    inputElement: HTMLInputElement | null
  ) => {
    if (!files || files.length === 0) return;
    setError(null);
    onStart();

    try {
      const validFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (f.size > MAX_FILE_SIZE_BYTES) {
          setError(`File ${f.name} is too large (max 10MB)`);
          continue;
        }
        validFiles.push(f);
      }

      // enforce max images when uploading images
      if (mediaFor === "property") {
        const remaining = MAX_IMAGES - uploadedImages.length;
        if (validFiles.length > remaining) validFiles.splice(remaining);
      }

      // upload concurrently but safely using Promise.all
      const uploadPromises = validFiles.map(async (file) => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append(
          "type",
          file.type.startsWith("image/")
            ? "image"
            : file.type.includes("pdf")
            ? "document"
            : "document"
        );
        fd.append("media_for", mediaFor);

        const res = await uploadMedia(fd);

        // accept several response shapes
        const url =
          (res && (res.url || res.data?.url)) ||
          (typeof res === "string" ? res : null);
        if (!url) throw new Error("Upload returned no url");
        return url as string;
      });

      const urls = await Promise.all(uploadPromises);
      if (urls.length) onAddUrls(urls);
    } catch (err: any) {
      console.error("upload error:", err);
      setError(err?.message || "Failed to upload files");
    } finally {
      onFinish();
      if (inputElement) inputElement.value = ""; // reset to allow re-upload same file
    }
  };

  const handleImageFilesSelected = (e: ChangeEvent<HTMLInputElement>) =>
    uploadFiles(
      e.target.files,
      "property",
      () => setUploadingImages(true),
      () => setUploadingImages(false),
      (urls) => setUploadedImages((p) => [...p, ...urls]),
      e.target
    );

  const handleProofFilesSelected = (e: ChangeEvent<HTMLInputElement>) =>
    uploadFiles(
      e.target.files,
      "proof",
      () => setUploadingProofs(true),
      () => setUploadingProofs(false),
      (urls) => setUploadedProofs((p) => [...p, ...urls]),
      e.target
    );

  const removeUploadedImage = (idx: number) =>
    setUploadedImages((p) => {
      const arr = [...p];
      arr.splice(idx, 1);
      return arr;
    });

  const removeUploadedProof = (idx: number) =>
    setUploadedProofs((p) => {
      const arr = [...p];
      arr.splice(idx, 1);
      return arr;
    });

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

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

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
            <Input
              value={form.negotiable}
              onChange={(e) => handleChange("negotiable", e.target.value)}
              placeholder="Negotiable (Negotiable / Not Negotiable)"
              className="h-12 rounded-xl bg-muted/50 border-0"
            />
            <Input
              value={form.condition}
              onChange={(e) => handleChange("condition", e.target.value)}
              placeholder="Condition (e.g. New, Used)"
              className="h-12 rounded-xl bg-muted/50 border-0"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              value={form.listing_type}
              onChange={(e) => handleChange("listing_type", e.target.value)}
              placeholder="Listing Type (Rent / Sale)"
              className="h-12 rounded-xl bg-muted/50 border-0 pr-10"
            />
            <Input
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              placeholder="Category (Apartment / House / Land)"
              className="h-12 rounded-xl bg-muted/50 border-0 pr-10"
            />
          </div>

          <Input
            value={form.street_address}
            onChange={(e) => handleChange("street_address", e.target.value)}
            placeholder="Street Address"
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
              placeholder="Contact email (optional)"
              className="h-12 rounded-xl bg-muted/50 border-0"
            />
            <Input
              value={form.contact_phone_number}
              onChange={(e) =>
                handleChange("contact_phone_number", e.target.value)
              }
              placeholder="Contact phone no"
              className="h-12 rounded-xl bg-muted/50 border-0"
            />
          </div>

          {/* Uploads: Images & Proof */}
          <div className="pt-4 space-y-6">
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
                      disabled={
                        uploadingImages || uploadedImages.length >= MAX_IMAGES
                      }
                    />
                    <Button
                      variant="outline"
                      asChild
                      disabled={
                        uploadingImages || uploadedImages.length >= MAX_IMAGES
                      }
                    >
                      <span>
                        {uploadingImages
                          ? "Uploading..."
                          : uploadedImages.length >= MAX_IMAGES
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

              {uploadedImages.length > 0 && (
                <div className="space-y-2 mb-3">
                  <p className="text-sm text-muted-foreground">
                    Uploaded image URLs
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
