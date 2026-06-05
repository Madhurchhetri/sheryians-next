import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-3" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />

          <Skeleton className="h-32 w-full" />

          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />

          <Skeleton className="h-40 w-full" />
        </div>

        {/* Resume Preview */}
        <div className="border rounded-lg p-4 space-y-4">
          <Skeleton className="h-8 w-40 mx-auto" />

          <Skeleton className="h-24 w-24 rounded-full mx-auto" />

          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />

          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}