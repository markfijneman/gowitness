import * as api from "@/lib/api/api";
import * as apitypes from "@/lib/api/types";
import { toast } from "@/hooks/use-toast";

const getData = async (
  setRunners: React.Dispatch<React.SetStateAction<apitypes.runner[]>>
) => {
  try {
    const s = await api.get('runners');
    setRunners(s);
  } catch (err) {
    toast({
      title: "API Error",
      variant: "destructive",
      description: `Failed to get runners: ${err}`
    });
  } finally {
  }
};

export { getData };
