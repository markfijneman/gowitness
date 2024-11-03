import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  AlertOctagonIcon, BanIcon, CheckIcon, ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, CodeIcon, ExternalLink,
  GroupIcon, SettingsIcon, ShieldCheckIcon, TagsIcon, XIcon,
  ZoomInIcon
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from "@/lib/utils";
import * as api from "@/lib/api/api";
import * as apitypes from "@/lib/api/types";
import { getData, getTagData, getWappalyzerData } from "./data";
import { getIconUrl, getStatusColor } from "@/lib/common";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";


const GalleryPage = () => {
  const [gallery, setGallery] = useState<apitypes.galleryResult[]>();
  const [wappalyzer, setWappalyzer] = useState<apitypes.wappalyzer>();
  const [tag, setTag] = useState<apitypes.taglist>();
  const [technology, setTechnology] = useState<apitypes.technologylist>();
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  // pagination
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "24");
  // filters
  const tagFilter = searchParams.get("tags") || "";
  const technologyFilter = searchParams.get("technologies") || "";
  const statusFilter = searchParams.get("status") || "";
  // toggles
  const perceptionGroup = searchParams.get("perception") === "true";
  const showFailed = searchParams.get("failed") !== "false"; // Default to true
  const hideDuplicates = searchParams.get("hide_duplicates") !== "false";

  // cards
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalId, setModalId] = useState<number | null>(null);

  useEffect(() => {
    getWappalyzerData(setWappalyzer, setTechnology);
    getTagData(setTag);
  }, []);

  useEffect(() => {
    getData(
      setLoading, setGallery, setTotalPages,
      page, limit, tagFilter, technologyFilter, statusFilter, perceptionGroup, showFailed, hideDuplicates
    );
  }, [page, limit, perceptionGroup, tagFilter, statusFilter, technologyFilter, showFailed, hideDuplicates]);

  const handlePageChange = (newPage: number) => {
    window.scrollTo({ top: 0 });
    setSearchParams(prev => {
      prev.set("page", newPage.toString());
      return prev;
    });
  };

  const handleLimitChange = (newLimit: string) => {
    window.scrollTo({ top: 0 });
    setSearchParams(prev => {
      prev.set("limit", newLimit);
      return prev;
    });
    handlePageChange(1); // back to page 1
  };

  const handleTagChange = (tech: string) => {
    const field = "tags";
    setSearchParams(prev => {
      const currentTag = prev.get(field)?.split(",").filter(Boolean) || [];

      if (currentTag.includes(tech)) {
        const updatedTag = currentTag.filter(s => s !== tech);
        prev.set(field, updatedTag.join(","));
      } else {
        currentTag.push(tech);
        prev.set(field, currentTag.join(","));
      }

      return prev;
    });
    handlePageChange(1); // back to page 1
  };

  const handleTechnologyChange = (tech: string) => {
    const field = "technologies";
    setSearchParams(prev => {
      const currentTechnology = prev.get(field)?.split(",").filter(Boolean) || [];

      if (currentTechnology.includes(tech)) {
        const updatedTechnology = currentTechnology.filter(s => s !== tech);
        prev.set(field, updatedTechnology.join(","));
      } else {
        currentTechnology.push(tech);
        prev.set(field, currentTechnology.join(","));
      }

      return prev;
    });
    handlePageChange(1); // back to page 1
  };

  const handleStatusFilter = (status: string) => {
    window.scrollTo({ top: 0 });
    setSearchParams(prev => {
      const currentStatus = prev.get("status")?.split(",").filter(Boolean) || [];

      if (currentStatus.includes(status)) {
        const updatedStatus = currentStatus.filter(s => s !== status);
        prev.set("status", updatedStatus.join(","));
      } else {
        currentStatus.push(status);
        prev.set("status", currentStatus.join(","));
      }

      return prev;
    });
  };

  const handleGroupBySimilar = () => {
    window.scrollTo({ top: 0 });
    setSearchParams(prev => {
      prev.set("perception", (!perceptionGroup).toString());
      return prev;
    });
  };

  const handleToggleShowFailed = () => {
    window.scrollTo({ top: 0 });
    setSearchParams(prev => {
      prev.set("failed", (!showFailed).toString());
      return prev;
    });
  };

  const handleToggleHideDuplicates = () => {
    window.scrollTo({ top: 0 });
    setSearchParams(prev => {
      prev.set("hide_duplicates", (!hideDuplicates).toString());
      return prev;
    });
  };

  const sortedTags = useMemo(() => {
    if (!tag) return [];
    const selectedTags = tagFilter.split(',').filter(Boolean);
    return [
      ...selectedTags,
      ...tag.tags.filter(tag => !selectedTags.includes(tag))
    ];
  }, [technology, technologyFilter]);

  const sortedTechnologies = useMemo(() => {
    if (!technology) return [];
    const selectedTechnologies = technologyFilter.split(',').filter(Boolean);
    return [
      ...selectedTechnologies,
      ...technology.technologies.filter(tech => !selectedTechnologies.includes(tech))
    ];
  }, [technology, technologyFilter]);

  const renderPageButtons = (visible: number) => {
    const pageButtons = [];
    const maxVisiblePages = visible;
    const startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <Button
          key={i}
          onClick={() => handlePageChange(i)}
          variant={i === page ? "secondary" : "outline"}
          size="sm"
          className="h-9 min-w-9 text-sm"
          disabled={loading}
        >
          {i}
        </Button>
      );
    }

    return pageButtons;
  };

  const handleImageClick = (id: number) => {
    setModalId(id);
    setIsModalOpen(true);
  }

  const renderGalleryCard = (screenshot: apitypes.galleryResult) => {
    const probedDate = new Date(screenshot.probed_at);
    const timeAgo = formatDistanceToNow(probedDate, { addSuffix: true });
    const rawDate = format(probedDate, "PPpp"); // Formats the date in a readable format

    return (
        <Card className="group overflow-hidden transition-all shadow hover:shadow-lg flex flex-col h-full rounded-lg">
          <CardContent className="p-0 relative flex-grow">
            <Dialog open={isModalOpen && modalId == screenshot.id} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <div className="cursor-pointer" onClick={() => handleImageClick(screenshot.id)}>
                  {screenshot.failed ? (
                    <div className="w-full h-48 bg-gray-800 flex items-center justify-center">
                      <XIcon className="text-gray-600 w-12 h-12" />
                    </div>
                  ) : (
                    <>
                      <img
                        src={screenshot.screenshot
                          ? `data:image/png;base64,${screenshot.screenshot}`
                          : api.endpoints.screenshot.path + "/" + screenshot.file_name}
                        alt={screenshot.url}
                        loading="lazy"
                        className="w-full object-cover aspect-video"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-25 opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <ZoomInIcon className="w-12 h-12 text-white" />
                      </div>
                    </>
                  )}
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full p-0 text-white">
                <div className="relative w-full h-full">
                  <img
                    src={api.endpoints.screenshot.path + "/" + screenshot.file_name}
                    alt={screenshot.title}
                    className="bg-black absolute w-full h-full object-contain rounded-3xl cursor-pointer"
                    onClick={() => setIsModalOpen(false)}
                  />
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute h-5 w-5 top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/75 transition-all"
                  >
                  </button>
                  <div className="absolute bottom-4 left-4 bg-black/40 p-4 text-white rounded-3xl">
                    <a
                      href={screenshot.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold hover:underline flex items-center mb-2"
                    >
                      {screenshot.url}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                    <div className="flex items-center text-sm opacity-80">
                      <ClockIcon className="mr-2 h-4 w-4" />
                      Captured on {format(new Date(screenshot.probed_at), "PPpp")}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>

          <CardFooter className="p-0 flex flex-col items-start">
            <Link className="w-full h-full" to={screenshot.url} key={screenshot.id}>
              <div className="w-full p-2 hover:bg-foreground/20 transition-background duration-300">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-full truncate text-sm font-medium">
                        {screenshot.title || "Untitled"}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{screenshot.title || "Untitled"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="w-full truncate text-xs text-muted-foreground mt-1">
                  {screenshot.url}
                </div>
              </div>
            </Link>
            <Link className="w-full h-full" to={`/screenshot/${screenshot.id}`} key={screenshot.id}>
              <div className="w-full flex p-2 items-center justify-between hover:bg-foreground/20 transition-background duration-300">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default" className={`${getStatusColor(screenshot.response_code)} shadow-none`}>
                    {screenshot.response_code}
                  </Badge>
                  {screenshot.tags?.map(tag => (
                    <Badge variant="default" className="bg-purple-600 text-white shadow-none">
                      {tag}
                    </Badge>
                  ))}
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <ClockIcon className="w-3 h-3" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p>{timeAgo} - {rawDate}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex flex-wrap justify-end gap-1">
                  {screenshot.technologies?.map(tech => {
                    const iconUrl = getIconUrl(tech, wappalyzer);
                    return iconUrl ? (
                      <TooltipProvider key={tech} delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-5 h-5 flex items-center justify-center">
                              <img
                                src={iconUrl}
                                alt={tech}
                                loading="lazy"
                                className="w-5 h-5 object-contain"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{tech}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : null;
                  })}
                </div>
                
              </div>
            </Link>
          </CardFooter>
        </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between rounded-lg">
        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[210px]">
                <TagsIcon className="mr-2 h-4 w-4" />
                {tagFilter.split(',').filter(n => n).length > 0 ? (
                  <>
                    {tagFilter.split(',').length} tag{tagFilter.split(',').length > 1 ? 's' : ''} selected
                  </>
                ) : (
                  "Tags"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[210px] p-0">
              <Command>
                <CommandInput placeholder="Search tags..." />
                <CommandList>
                  <CommandEmpty>No tags found.</CommandEmpty>
                  <CommandGroup>
                    {sortedTags.map((tag) => (
                      <CommandItem
                        key={tag}
                        onSelect={() => handleTagChange(tag)}
                        disabled={loading}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 h-4 w-4",
                            tagFilter.includes(tag) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {tag}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[210px]">
                <CodeIcon className="mr-2 h-4 w-4" />
                {technologyFilter.split(',').filter(n => n).length > 0 ? (
                  <>
                    {technologyFilter.split(',').length} {technologyFilter.split(',').length > 1 ? 'technologies' : 'technology'} selected
                  </>
                ) : (
                  "Technologies"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[210px] p-0">
              <Command>
                <CommandInput placeholder="Search technologies..." />
                <CommandList>
                  <CommandEmpty>No technologies found.</CommandEmpty>
                  <CommandGroup>
                    {sortedTechnologies.map((tech) => (
                      <CommandItem
                        key={tech}
                        onSelect={() => handleTechnologyChange(tech)}
                        disabled={loading}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 h-4 w-4",
                            technologyFilter.includes(tech) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {tech}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <Button
            variant={statusFilter.includes("200") ? "secondary" : "outline"}
            onClick={() => handleStatusFilter("200")}
            disabled={loading}
          >
            <ShieldCheckIcon className="mr-2 h-4 w-4" />
            200
          </Button>
          <Button
            variant={statusFilter.includes("403") ? "secondary" : "outline"}
            onClick={() => handleStatusFilter("403")}
            disabled={loading}
          >
            <BanIcon className="mr-2 h-4 w-4" />
            403
          </Button>
          <Button
            variant={statusFilter.includes("500") ? "secondary" : "outline"}
            onClick={() => handleStatusFilter("500")}
            disabled={loading}
          >
            <AlertOctagonIcon className="mr-2 h-4 w-4" />
            500
          </Button>
          <Button
            variant={perceptionGroup ? "secondary" : "outline"}
            onClick={handleGroupBySimilar}
            disabled={loading}
          >
            <GroupIcon className="mr-2 h-4 w-4" />
            Group by Similar
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[150px] p-0">
              <Command>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      onSelect={handleToggleShowFailed}
                      disabled={loading}
                    >
                      <CheckIcon
                          className={cn(
                            "mr-2 h-4 w-4",
                            showFailed ? "opacity-100" : "opacity-0"
                          )}
                        />
                      Show failed
                    </CommandItem>
                    <CommandItem
                      onSelect={handleToggleHideDuplicates}
                      disabled={loading}
                    >
                      <CheckIcon
                          className={cn(
                            "mr-2 h-4 w-4",
                            hideDuplicates ? "opacity-100" : "opacity-0"
                          )}
                        />
                      Hide duplicates
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1 || loading}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <div
            className="text-sm select-none"
          >
            {page} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages || loading}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          <>
            {Array.from({length: limit}).map((_, index) => (
              <Card key={index} className="group overflow-hidden flex flex-col h-full rounded-lg">
                <Skeleton className="w-full aspect-video rounded-none" />
                <Skeleton className="h-[94px] rounded-none" />
              </Card>
            ))}
          </>
        ) : (
          <>
            {gallery?.map(screenshot => renderGalleryCard(screenshot))}
          </>
        )}
      </div>

      <div className="flex justify-between items-center mt-8">
        <Select value={limit.toString()} onValueChange={handleLimitChange} disabled={loading}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Limit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="24">24</SelectItem>
            <SelectItem value="48">48</SelectItem>
            <SelectItem value="96">96</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(1)}
            disabled={page <= 1 || loading}
          >
            <ChevronFirstIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1 || loading}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          {renderPageButtons(8)}
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages || loading}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(totalPages)}
            disabled={page >= totalPages || loading}
          >
            <ChevronLastIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;