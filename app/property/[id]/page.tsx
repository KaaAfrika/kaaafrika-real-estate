import PropertyDetails from "./PropertyDetails";

// This function is REQUIRED for Static Export.
// Returning an empty array [] tells Next.js:
// "Don't build specific HTML files for IDs right now; let the browser handle it."
export async function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: { id: string } }) {
  // We pass the ID to the client component so it can fetch the data
  return <PropertyDetails id={params.id} />;
}