import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import Editor from "@/components/editor/Editor";

interface PageProps {
  params: {
    slug: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { slug } = params;

  const subhive = await db.subhive.findFirst({
    where: {
      name: slug,
    },
  });

  if (!subhive) return notFound();

  return (
    <div className="flex flex-col items-start gap-6">
      <div className="border-b border-gray-200 pb-5">
        <div className="-ml-2 -mt-2 flex flex-wrap items-baseline">
          <h3 className="ml-2 mt-2 text-base font-semibold leading-6 text-gray-900">
            Create Thread
          </h3>
          <p className="ml-2 mt-1 truncate text-sm text-gray-500">
            in hive/{slug}
          </p>
        </div>
      </div>

      <Editor subhiveId={subhive.id} />

      <div className="w-full flex justify-end">
        <Button type="submit" className="w-full" form="subhive-post-form">
          Post
        </Button>
      </div>
    </div>
  );
};

export default Page;
