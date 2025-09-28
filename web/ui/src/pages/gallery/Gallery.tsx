import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  CheckIcon, ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, CodeIcon, ExternalLink,
  FileIcon,
  GroupIcon, SettingsIcon, TagsIcon, XIcon,
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
import { getData, getResponseCodeData, getTagData, getWappalyzerData } from "./data";
import { getIconUrl, getStatusColor } from "@/lib/common";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";


const GalleryPage = () => {
  const [gallery, setGallery] = useState<apitypes.galleryResult[]>();
  const [wappalyzer, setWappalyzer] = useState<apitypes.wappalyzer>();
  const [tag, setTag] = useState<apitypes.taglist>();
  const [technology, setTechnology] = useState<apitypes.technologylist>();
  const [responseCode, setResponseCode] = useState<apitypes.responsecodelist>();
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  // pagination
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "24");
  // filters
  const tagFilter = searchParams.get("tags") || "";
  const technologyFilter = searchParams.get("technologies") || "";
  const responseCodeFilter = searchParams.get("status") || "";
  // toggles
  const perceptionGroup = searchParams.get("perception") === "true";
  const showFailed = searchParams.get("failed") !== "false"; // Default to true
  const hideDuplicates = searchParams.get("hide_duplicates") !== "false";
  const hideVisited = searchParams.get("hide_visited") === "true";

  // cards
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalId, setModalId] = useState<number | null>(null);

  useEffect(() => {
    getTagData(setTag);
    getWappalyzerData(setWappalyzer, setTechnology);
    getResponseCodeData(setResponseCode);
  }, []);

  useEffect(() => {
    getData(
      setLoading, setGallery, setTotalPages,
      page, limit, tagFilter, technologyFilter, responseCodeFilter, perceptionGroup, showFailed, hideDuplicates, hideVisited
    );
  }, [page, limit, perceptionGroup, tagFilter, responseCodeFilter, technologyFilter, showFailed, hideDuplicates, hideVisited]);

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

  const handleTagChange = (tag: string) => {
    const field = "tags";
    setSearchParams(prev => {
      const currentTag = prev.get(field)?.split(",").filter(Boolean) || [];

      if (currentTag.includes(tag)) {
        const updatedTag = currentTag.filter(s => s !== tag);
        prev.set(field, updatedTag.join(","));
      } else {
        currentTag.push(tag);
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

  const handleResponseCodeChange = (responseCode: string) => {
    const field = "status";;
    setSearchParams(prev => {
      const currentResponseCode = prev.get(field)?.split(",").filter(Boolean) || [];

      if (currentResponseCode.includes(responseCode)) {
        const updatedResponseCode = currentResponseCode.filter(s => s !== responseCode);
        prev.set(field, updatedResponseCode.join(","));
      } else {
        currentResponseCode.push(responseCode);
        prev.set(field, currentResponseCode.join(","));
      }

      return prev;
    });
    handlePageChange(1); // back to page 1
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

    const handleToggleHideVisited = () => {
    window.scrollTo({ top: 0 });
    setSearchParams(prev => {
      prev.set("hide_visited", (!hideVisited).toString());
      return prev;
    });
  };

  const setVisited = (screenshot: apitypes.galleryResult) => {
    if (!screenshot.visited) {
      api.post("visit", { id: screenshot.id });
      
      setGallery((prev) =>
        prev?.map(item => 
          item.id === screenshot.id ? { ...item, visited: true } : item
        )
      );
    }
  };

  const setVisitedAsync = async (screenshot: apitypes.galleryResult) => {
    await setVisited(screenshot);
  };

  const sortedTags = useMemo(() => {
    if (!tag) return [];
    const selectedTags = tagFilter.split(',').filter(Boolean);
    return [
      ...selectedTags,
      ...tag.tags.filter(tag => !selectedTags.includes(tag))
    ];
  }, [tag, tagFilter]);

  const sortedTechnologies = useMemo(() => {
    if (!technology) return [];
    const selectedTechnologies = technologyFilter.split(',').filter(Boolean);
    return [
      ...selectedTechnologies,
      ...technology.technologies.filter(tech => !selectedTechnologies.includes(tech))
    ];
  }, [technology, technologyFilter]);

  const sortedResponseCodes = useMemo(() => {
    if (!responseCode) return [];
    const selectedResponseCodes = responseCodeFilter.split(',').filter(Boolean);
    return [
      ...selectedResponseCodes,
      ...responseCode.response_codes.filter(responseCode => !selectedResponseCodes.includes(responseCode.toString())).sort()
    ];
  }, [responseCode, responseCodeFilter]);

  const renderPageButtons = (visible: number) => {
    const pageButtons = [];
    const maxVisiblePages = visible;
    const startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <Button
          key={"page=" + i}
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
        <Card className={`group overflow-hidden transition-all shadow hover:shadow-lg flex flex-col h-full rounded-lg border ${screenshot.visited ? "border-transparent" : "border-blue-500"}`}>
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

          <CardFooter className="p-0 flex flex-col items-start" key={"screenshot-" + screenshot.id}>
            <Link
              className="w-full h-full"
              to={screenshot.url}
              onClick={() => setVisited(screenshot)}
              onAuxClick={(e) => {
                if (e.button === 1) { // middle click
                  setVisitedAsync(screenshot);
                }
              }}
            >
              <div className="w-full p-2 hover:bg-foreground/20 transition-background duration-300">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`w-full truncate text-sm ${screenshot.visited ? "font-medium" : "font-bold"}`}>
                        {!screenshot.visited && <span className="text-blue-500 mr-1.5 select-none">●</span>}
                        {screenshot.title || <i>Untitled</i>}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{screenshot.title || <i>Untitled</i>}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="w-full truncate text-xs text-muted-foreground mt-1">
                  {screenshot.url}
                </div>
              </div>
            </Link>
            <Link className="w-full h-full" to={`/screenshot/${screenshot.id}`}>
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
                      <TooltipProvider key={"icon-" + tech} delayDuration={0}>
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
                        key={"tag-filter-" + tag}
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
                        key={"tech-filter-" + tech}
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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[210px]">
                <FileIcon className="mr-2 h-4 w-4" />
                {responseCodeFilter.split(',').filter(n => n).length > 0 ? (
                  <>
                    {responseCodeFilter.split(',').length} status code{responseCodeFilter.split(',').length > 1 ? 's' : ''} selected
                  </>
                ) : (
                  "Status codes"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[210px] p-0">
              <Command>
                <CommandInput placeholder="Search status codes..." />
                <CommandList>
                  <CommandEmpty>No status codes found.</CommandEmpty>
                  <CommandGroup>
                    {sortedResponseCodes.map((responseCode) => (
                      <CommandItem
                        key={"response-code-filter-" + responseCode}
                        onSelect={() => handleResponseCodeChange(responseCode.toString())}
                        disabled={loading}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 h-4 w-4",
                            responseCodeFilter.includes(responseCode.toString()) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {responseCode}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
                    <CommandItem
                      onSelect={handleToggleHideVisited}
                      disabled={loading}
                    >
                      <CheckIcon
                          className={cn(
                            "mr-2 h-4 w-4",
                            hideVisited ? "opacity-100" : "opacity-0"
                          )}
                        />
                      Hide visited
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
              <Card key={"skeleton-" + index} className="group overflow-hidden shadow flex flex-col h-full rounded-lg bg-transparent">
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
        <Select
          value={limit.toString()}
          onValueChange={handleLimitChange}
          disabled={loading}
        >
          <SelectTrigger className="w-[100px] border-secondary">
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