import { toast } from "@/hooks/use-toast";
import * as api from "@/lib/api/api";
import { redirect } from "react-router-dom";

const submitJobAction = async ({ formData }: { formData: FormData; }) => {

  // grab submitted urls
  const urls = (formData.get('urls') as string)
    .split('\n')
    .map(url => url.trim())
    .filter(url => url !== '');

  if (urls.length === 0) {
    return { error: "Please enter at least one URL" };
  }

  const tags = (formData.get('tags') as string)
    .split(",")
    .filter(tag => tag !== '');

  const options = {
    tags,
    format: formData.get('format'),
    threads: parseInt(formData.get('threads') as string),
    timeout: parseInt(formData.get('timeout') as string),
    delay: parseInt(formData.get('delay') as string),
    user_agent: formData.get('user_agent'),
    window_x: parseInt(formData.get('window_x') as string),
    window_y: parseInt(formData.get('window_y') as string),
  };

  try {
    await api.post('submit', { urls, options });
  } catch (err) {
    toast({
      title: "Error",
      description: `Could not submit new job: ${err}`,
      variant: "destructive"
    });
    return null;
  }

  toast({
    title: "Success!",
    description: "Job has been submitted"
  });

  return redirect("/submit");
};

const submitImmediateAction = async ({ formData }: { formData: FormData; }) => {
  const url = formData.get('immediate-url') as string;
  const options = {
    format: formData.get('format'),
    timeout: parseInt(formData.get('timeout') as string),
    delay: parseInt(formData.get('delay') as string),
    user_agent: formData.get('user_agent'),
    window_x: parseInt(formData.get('window_x') as string),
    window_y: parseInt(formData.get('window_y') as string),
  };

  try {
    return await api.post('submitsingle', { url, options });
  } catch (err) {
    toast({
      title: "Error",
      description: `Could not submit new job: ${err}`,
      variant: "destructive"
    });
    return null;
  }
};

export { submitJobAction, submitImmediateAction };