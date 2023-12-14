import CreateHiveForm from "@/components/layout/CreateHiveForm";

const Page = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 p-1.5">
      <div className="grid items-start gap-8 mt-2 ml-2 sm:ml-0">
        <h1 className="font-bold text-2xl md:text-3xl">Create a hive</h1>
      </div>

      <div className="grid gap-10">
        <CreateHiveForm />
      </div>
    </div>
  );
};

export default Page;
