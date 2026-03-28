import { useState } from "react";
import { Input } from "./ui/input";
import { Eye, EyeOff } from "lucide-react";

function PasswordInput({ ...props }: React.ComponentProps<"input">) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative group">
      <Input
        type={show ? "text" : "password"}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-2/4 -translate-y-1/2 group-focus-within:block hidden text-neutral-700 dark:text-neutral-400"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export default PasswordInput;
