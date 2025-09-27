import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, ChevronLeft, ChevronRight, ClockIcon, Trash2Icon, DownloadIcon, ImagesIcon, ZoomInIcon, CopyIcon, NetworkIcon, TerminalIcon, ServerIcon, CookieIcon, CodeIcon, TagsIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { WideSkeleton } from '@/components/loading';
import { Form, Link, useNavigate, useParams } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { copyToClipboard, getIconUrl, getStatusColor } from '@/lib/common';
import * as api from "@/lib/api/api";
import * as apitypes from "@/lib/api/types";
import { getData } from './data';
import { LockClosedIcon } from '@radix-ui/react-icons';


const ScreenshotDetailPage = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('network');
  const [detail, setDetail] = useState<apitypes.detail>();
  const [duration, setDuration] = useState<string>('');
  const [wappalyzer, setWappalyzer] = useState<apitypes.wappalyzer>({});
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const { id } = useParams<{ id: string; }>();
  if (!id) throw new Error("Somehow, detail id is not defined");

  const currentId: number = parseInt(id, 10);

  useEffect(() => {
    getData(setLoading, setDetail, setWappalyzer, setDuration, id);
  }, [id]);

  // handle arrowleft and arrowright events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        if (currentId > 1) {
          navigate(`/screenshot/${currentId - 1}`);
        }
      }

      if (event.key === 'ArrowRight') {
        navigate(`/screenshot/${currentId + 1}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // cleanup when this component is no longer mounted
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentId, navigate]);

  const getLogTypeColor = (type: string) => {
    if (type === 'console.warning' || type === 'console.warn') return "bg-yellow-500 text-black";
    return "bg-blue-500 text-white";
  };

  const handleDownload = (base64Content: string, url: string) => {
    const binaryString = atob(base64Content);

    // Create an array of 8-bit unsigned integers from the binary string
    const binaryLength = binaryString.length;
    const bytes = new Uint8Array(binaryLength);
    for (let i = 0; i < binaryLength; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);

    // Extract the last part of the URL for the filename
    const urlParts = new URL(url).pathname.split('/');
    const fileName = urlParts[urlParts.length - 1] || 'download';
    link.download = fileName;

    link.click();
    window.URL.revokeObjectURL(link.href);
  };

  const handleSearchRedirect = () => {
    if (detail && detail.perception_hash) {
      navigate(`/search?query=${detail.perception_hash}`);
    }
  };

  const setVisited = async () => {
    if (detail && !detail.visited) {
      await api.post("visit", { id: detail.id });
      setDetail({ ...detail, visited: true });
    }
  };

  if (loading) return <WideSkeleton />;
  if (!detail) return;

  const probedDate = new Date(detail.probed_at);
  const timeAgo = formatDistanceToNow(probedDate, { addSuffix: true });
  const rawDate = format(probedDate, "PPpp");

  const getNavigation = () => {
    return (
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Link to={"/screenshot/" + (currentId - 1)} >
            <Button variant="outline" size="sm" disabled={currentId <= 1}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          </Link>
          <Link to={"/screenshot/" + (currentId + 1)}>
            <Button variant="outline" size="sm">
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="flex space-x-2">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSearchRedirect}
                >
                  <ImagesIcon className="mr-2 h-4 w-4" />
                  Visually Similar
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Find visually similar screenshots</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you sure you want to delete this result?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete the screenshot and all associated data.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Form method="post">
                        <Button type="submit" variant="destructive" onClick={() => setIsDeleteDialogOpen(false)}>
                          Delete
                        </Button>
                      </Form>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete this screenshot</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  };

  const infoCard = (detail: apitypes.detail) => {
    return (
      <Card className={`border ${detail.visited ? "border-transparent" : "border-blue-500"}`}>
        <CardContent className="p-0 relative group">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <button className="w-full relative">
                <img
                  src={
                    detail.screenshot
                      ? `data:image/png;base64,${detail.screenshot}`
                      : api.endpoints.screenshot.path + "/" + detail.file_name
                  }
                  alt={detail.title}
                  className="w-full h-auto object-cover transition-all duration-300 filter group-hover:brightness-75 rounded-t-3xl"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ZoomInIcon className="w-12 h-12 text-white" />
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full p-0 text-white">
              <div className="relative w-full h-full">
                <img
                  src={api.endpoints.screenshot.path + "/" + detail.file_name}
                  alt={detail.title}
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
                    href={detail.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold hover:underline flex items-center mb-2"
                  >
                    {detail.url}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                  <div className="flex items-center text-sm opacity-80">
                    <ClockIcon className="mr-2 h-4 w-4" />
                    Captured on {format(new Date(detail.probed_at), "PPpp")}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-4">
          <div>
            <h2 className={`text-xl ${detail.visited ? "font-medium" : "font-bold"}`}>
              {!detail.visited && <span className="text-blue-500 mr-1.5 select-none">●</span>}
              {detail.title || "Untitled"}
            </h2>
            <p className="text-sm text-muted-foreground">{detail.url}</p>
          </div>
          <Button onClick={() => {window.open(detail.url, '_blank') && setVisited()}}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open URL
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const tagsCard = (detail: apitypes.detail) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-medium">Tags</CardTitle>
            <TagsIcon className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {detail.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {detail.tags.map((tag) => {
                return (
                  <Badge key={tag.id} variant="default" className="bg-purple-600 text-white shadow-none">
                    {tag.value}
                  </Badge>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">No tags found</p>
          )}
        </CardContent>
      </Card>
    );
  }

  const techCard = (detail: apitypes.detail) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-medium">Technologies</CardTitle>
            <CodeIcon className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {detail.technologies.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {detail.technologies.map((tech) => {
                const iconUrl = getIconUrl(tech.value, wappalyzer);
                return (
                  <div key={tech.id} className="flex items-center space-x-2">
                    {iconUrl && <img src={iconUrl} alt={tech.value} className="w-6 h-6" loading="lazy" />}
                    <span>{tech.value}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">No technologies detected</p>
          )}
        </CardContent>
      </Card>
    );
  };

  const tlsCard = (detail: apitypes.detail) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-medium">TLS Information</CardTitle>
            <LockClosedIcon className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {detail.tls.subject_name && (
              <>
                <dt className="font-semibold">Subject Name:</dt>
                <dd>{detail.tls.subject_name}</dd>
              </>
            )}
            {detail.tls.issuer && (
              <>
                <dt className="font-semibold">Issuer:</dt>
                <dd>{detail.tls.issuer}</dd>
              </>
            )}
            {detail.tls.protocol && (
              <>
                <dt className="font-semibold">Protocol:</dt>
                <dd>{detail.tls.protocol}</dd>
              </>
            )}
            {detail.tls.cipher && (
              <>
                <dt className="font-semibold">Cipher:</dt>
                <dd>{detail.tls.cipher}</dd>
              </>
            )}
            {detail.tls.subject_name && detail.tls.valid_from && (
              <>
                <dt className="font-semibold">Valid From:</dt>
                <dd>{format(new Date(detail.tls.valid_from), 'PPpp')}</dd>
              </>
            )}
            {detail.tls.subject_name && detail.tls.valid_to && (
              <>
                <dt className="font-semibold">Valid To:</dt>
                <dd>{format(new Date(detail.tls.valid_to), 'PPpp')}</dd>
              </>
            )}
          </dl>
          {detail.tls.san_list && detail.tls.san_list.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer font-semibold">
                SAN List ({detail.tls.san_list.length})
              </summary>
              <ul className="list-disc pl-5 mt-2 break-all font-mono">
                {detail.tls.san_list.map((san, index) => (
                  <li key={index}>{san.value}</li>
                ))}
              </ul>
            </details>
          )}
        </CardContent>
      </Card>
    );
  };

  const summaryCard = (detail: apitypes.detail) => {
    return (
      <Card className="bg-gradient-to-r text-white bg-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle >Summary</CardTitle>
          <Badge className={`${getStatusColor(detail.response_code)} px-3 py-1`}>
            HTTP {detail.response_code}
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            The final URL was{" "}
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={detail.final_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono underline inline-block max-w-[300px] truncate align-bottom"
                  >
                    {detail.final_url}
                  </a>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[400px] break-all">
                  <p>{detail.final_url}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>{" "}
            responding with an HTTP <span className="font-mono">{detail.response_code}</span> and{" "}
            <span className="font-mono">{(detail.content_length / 1024).toFixed(2)}</span> KB of content. Scanning (first
            to last request) took roughly {duration}.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white bg-opacity-20 rounded-3xl p-4 text-center">
              <p className="text-3xl font-bold">{detail.network.length}</p>
              <p className="text-sm">Requests</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-3xl p-4 text-center">
              <p className="text-3xl font-bold">{detail.console.length}</p>
              <p className="text-sm">Console Logs</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-3xl p-4 text-center">
              <p className="text-3xl font-bold">{Object.keys(detail.headers).length}</p>
              <p className="text-sm">Headers</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-3xl p-4 text-center">
              <p className="text-3xl font-bold">{detail.technologies.length}</p>
              <p className="text-sm">Technologies</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-3xl p-4 text-center">
              <p className="text-3xl font-bold">{detail.cookies.length}</p>
              <p className="text-sm">Cookies</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-1 text-sm text-white">
                    <ClockIcon className="w-4 h-4" />
                    <span className="text-nowrap">Scanned {timeAgo}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p>{rawDate}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    );
  };

  const networkLogTab = (log: apitypes.networklog[]) => {
    return (
      <TabsContent value="network">
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-medium">Network Log</CardTitle>
              <NetworkIcon className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {log.length === 0 ? (
              <div className="text-center text-muted-foreground">No data</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>HTTP</TableHead>
                    <TableHead></TableHead>
                    <TableHead></TableHead>
                    <TableHead>URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {log.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(log.status_code)} text-xs px-1 py-0`}
                        >
                          {log.status_code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <ClockIcon className="w-3 h-3" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                              <p>{format(new Date(log.time), "PPpp")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        {log.content && log.content.length > 0 && (
                          <div
                            className="cursor-pointer"
                            onClick={() => handleDownload(log.content, log.url)}
                          >
                            <DownloadIcon className="w-3 h-3" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell
                        className="break-all cursor-pointer font-mono"
                        onClick={() => copyToClipboard(log.url, 'URL')}
                      >
                        {log.url}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    );
  };

  const consoleLogTab = (log: apitypes.consolelog[]) => {
    return (
      <TabsContent value="console">
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-medium">Console Log</CardTitle>
              <TerminalIcon className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {log.length === 0 ? (
              <div className="text-center text-muted-foreground">No data</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {log.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant="outline" className={`${getLogTypeColor(log.type)} text-xs px-1 py-0`}>
                          {log.type}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="break-all cursor-pointer"
                        onClick={() => copyToClipboard(log.value, 'Message')}
                      >
                        <span className="font-mono break-all">{log.value}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    );
  };

  const headersTab = (headers: apitypes.header[]) => {
    return (<TabsContent value="headers">
      <Card>
      <CardHeader>
            <CardTitle className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-medium">Response Headers</CardTitle>
              <ServerIcon className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
        <CardContent>
          {headers.length === 0 ? (
            <div className="text-center text-muted-foreground">No data</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Header</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {headers.map((header) => (
                  <TableRow key={header.id}>
                    <TableCell
                      className="font-mono text-nowrap cursor-pointer"
                      onClick={() => copyToClipboard(header.key, 'Header key')}
                    >
                      {header.key}
                    </TableCell>
                    <TableCell
                      className="font-mono break-all cursor-pointer"
                      onClick={() => copyToClipboard(header.value || "No Value", 'Header value')}
                    >
                      {header.value ? header.value : "No Value"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </TabsContent>);
  };

  const cookiesTab = (cookies: apitypes.cookie[]) => {
    return (
      <TabsContent value="cookies">
        <Card>
        <CardHeader>
            <CardTitle className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-medium">Cookies</CardTitle>
              <CookieIcon className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cookies.length === 0 ? (
              <div className="text-center text-muted-foreground">No data</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Attributes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cookies.map((cookie) => (
                    <TableRow key={cookie.id}>
                      <TableCell
                        className="font-mono break-all cursor-pointer"
                        onClick={() => copyToClipboard(cookie.name, 'Cookie name')}
                      >
                        {cookie.name}
                      </TableCell>
                      <TableCell
                        className="font-mono text-nowrap cursor-pointer"
                        onClick={() => copyToClipboard(cookie.value, 'Cookie value')}
                      >
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-mono truncate inline-block max-w-[150px]">
                                {cookie.value}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-[300px] break-all">{cookie.value}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell
                        className="cursor-pointer"
                        onClick={() => copyToClipboard(cookie.domain, 'Cookie domain')}
                      >
                        {cookie.domain}
                      </TableCell>
                      <TableCell>
                        {cookie.expires ? (
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  {formatDistanceToNow(new Date(cookie.expires), { addSuffix: true })}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{format(new Date(cookie.expires), "PPpp")}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          ""
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {cookie.http_only && <Badge variant="secondary">HttpOnly</Badge>}
                          {cookie.secure && <Badge variant="secondary">Secure</Badge>}
                          {cookie.session && <Badge variant="secondary">Session</Badge>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    );
  };

  const htmlTab = () => {
    return (
      <TabsContent value="html">
        <Card>
        <CardHeader>
            <CardTitle className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-medium">
                HTML Content
                <Button
                    variant="outline"
                    size="sm"
                    className="ml-4"
                    onClick={() => copyToClipboard(detail.html, 'HTML Source')}
                  >
                    <CopyIcon className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
              </CardTitle>
              <CodeIcon className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <pre className="text-sm w-0">{detail.html}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
    );
  };

  return (
    <div className="space-y-6">
      {getNavigation()}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Column */}
        <div className="w-full lg:w-2/5 space-y-4">
          {infoCard(detail)}
          {tagsCard(detail)}
          {techCard(detail)}
          {tlsCard(detail)}
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-3/5 space-y-4">
          {summaryCard(detail)}

          <Tabs defaultValue={selectedTab} onValueChange={(t) => setSelectedTab(t)}>
            <TabsList>
              <TabsTrigger value="network">Network Log</TabsTrigger>
              <TabsTrigger value="console">Console Log</TabsTrigger>
              <TabsTrigger value="headers">Response Headers</TabsTrigger>
              <TabsTrigger value="cookies">Cookies</TabsTrigger>
              <TabsTrigger value="html">HTML Content</TabsTrigger>
            </TabsList>
            {networkLogTab(detail.network)}
            {consoleLogTab(detail.console)}
            {headersTab(detail.headers)}
            {cookiesTab(detail.cookies)}
            {htmlTab()}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotDetailPage;