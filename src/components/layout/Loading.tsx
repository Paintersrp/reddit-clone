import { Loader2 } from "lucide-react";
import { FC } from "react";

const Loading: FC = ({}) => {
  return (
    <div className="flex justify-center mt-2">
      <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
    </div>
  );
};

export default Loading;
