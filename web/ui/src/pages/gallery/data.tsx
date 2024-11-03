import * as api from "@/lib/api/api";
import * as apitypes from "@/lib/api/types";
import { toast } from "@/hooks/use-toast";

const getTagData = async (
  setTag: React.Dispatch<React.SetStateAction<apitypes.taglist | undefined>>
) => {
  try {
    const s = await api.get('tag');
    setTag(s);
  } catch (err) {
    toast({
      title: "API Error",
      variant: "destructive",
      description: `Failed to get wappalyzer / technology data: ${err}`
    });
  }
};

const getWappalyzerData = async (
  setWappalyzer: React.Dispatch<React.SetStateAction<apitypes.wappalyzer | undefined>>,
  setTechnology: React.Dispatch<React.SetStateAction<apitypes.technologylist | undefined>>
) => {
  try {
    const [wappalyzerData, technologyData] = await Promise.all([
      await api.get('wappalyzer'),
      await api.get('technology')
    ]);
    setWappalyzer(wappalyzerData);
    setTechnology(technologyData);
  } catch (err) {
    toast({
      title: "API Error",
      variant: "destructive",
      description: `Failed to get wappalyzer / technology data: ${err}`
    });
  }
};

const getResponseCodeData = async (
  setResponseCode: React.Dispatch<React.SetStateAction<apitypes.responsecodelist | undefined>>
) => {
  try {
    const s = await api.get('responsecode');
    setResponseCode(s);
  } catch (err) {
    toast({
      title: "API Error",
      variant: "destructive",
      description: `Failed to get wappalyzer / technology data: ${err}`
    });
  }
};

const getData = async (
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setGallery: React.Dispatch<React.SetStateAction<apitypes.galleryResult[] | undefined>>,
  setTotalPages: React.Dispatch<React.SetStateAction<number>>,
  page: number,
  limit: number,
  tagFilter: string,
  technologyFilter: string,
  statusFilter: string,
  perceptionGroup: boolean,
  showFailed: boolean,
  hideDuplicates: boolean,
) => {
  setLoading(true);
  try {
    const s = await api.get('gallery', {
      page,
      limit,
      tags: tagFilter,
      technologies: technologyFilter,
      status: statusFilter,
      perception: perceptionGroup ? 'true' : 'false',
      failed: showFailed ? 'true' : 'false',
      hide_duplicates: hideDuplicates ? 'true' : 'false'
    });
    setGallery(s.results);
    setTotalPages(Math.ceil(s.total_count / limit));
  } catch (err) {
    toast({
      title: "API Error",
      variant: "destructive",
      description: `Failed to get gallery: ${err}`
    });
  } finally {
    setLoading(false);
  }
};

export { getTagData, getWappalyzerData, getResponseCodeData, getData };
