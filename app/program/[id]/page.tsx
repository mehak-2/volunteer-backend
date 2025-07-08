"use client";

import ProgramDetailView from "@/components/pages/ProgramDetailView";

export default function ProgramDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ProgramDetailView programId={params.id} />;
}
