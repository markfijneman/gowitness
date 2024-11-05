import { useEffect, useState } from 'react';
import { Form, useActionData, useNavigation } from 'react-router-dom';
import { Send, Settings, GlobeIcon, ExternalLinkIcon, ServerIcon, FileTypeIcon, ClockIcon, ScanTextIcon, SquarePlayIcon, RotateCcw, TagsIcon, AppWindowIcon, MoveHorizontalIcon, MoveVerticalIcon, FileImageIcon, LinkIcon, CpuIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as apitypes from "@/lib/api/types";
import { TextArea } from '@/components/ui/textarea';
import { getData } from './data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

interface ProbeOptionsProps {
  isOptionsOpen: string;
  setIsOptionsOpen: (value: string) => void;
  advancedOptions: boolean;
  setAdvancedOptions: (value: boolean) => void;
  tab: string;
}

const ProbeOptions = ({ isOptionsOpen, setIsOptionsOpen, advancedOptions, setAdvancedOptions, tab }: ProbeOptionsProps)  => (
  <Accordion
    type="single"
    collapsible
    value={isOptionsOpen}
    onValueChange={setIsOptionsOpen}>
    <AccordionItem value="options">
      <AccordionTrigger>
        <div className="flex items-center">
          <Settings className="mr-2 h-4 w-4" />
          Options
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pt-4">
          <div className={`grid gap-4 ${tab === "job" ? "lg:grid-cols-4 grid-cols-2" : "md:grid-cols-3"}`}>
            <div className="space-y-2">
              <Label htmlFor="format">Screenshot Format</Label>
              <Select name="format" defaultValue="jpeg">
                <div className="relative">
                  <FileImageIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <SelectTrigger id="format" className="pl-8">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                </div>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tab === "job" && (
              <div className="space-y-2">
                <Label htmlFor="threads">Threads</Label>
                <div className="relative">
                  <CpuIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="threads"
                    name="threads"
                    type="number"
                    min="1"
                    defaultValue="8"
                    className="pl-8"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <div className="relative">
                <ClockIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="timeout"
                  name="timeout"
                  type="number"
                  min="0"
                  defaultValue="20"
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delay">Screenshot Delay (seconds)</Label>
              <div className="relative">
                <ClockIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="delay"
                  name="delay"
                  type="number"
                  min="0"
                  defaultValue="1"
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="advanced-options"
              checked={advancedOptions}
              onCheckedChange={setAdvancedOptions}
            />
            <Label htmlFor="advanced-options">Advanced Options</Label>
          </div>

          {advancedOptions && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-agent">User Agent</Label>
                <div className="relative">
                  <AppWindowIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="user-agent"
                    name="user_agent"
                    defaultValue="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
                    className="pl-8 font-mono"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="window-x">Window Width</Label>
                  <div className="relative">
                    <MoveHorizontalIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="window-x"
                      name="window_x"
                      type="number"
                      min="0"
                      defaultValue="1920"
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="window-y">Window Height</Label>
                  <div className="relative">
                    <MoveVerticalIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="window-y"
                      name="window_y"
                      type="number"
                      min="0"
                      defaultValue="1080"
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

export default function JobSubmissionPage() {
  const [urls, setUrls] = useState<string[]>(['']);
  const [tags, setTags] = useState<string>('');
  const [isOptionsOpen, setIsOptionsOpen] = useState('');
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [immediateUrl, setImmediateUrl] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [runners, setRunners] = useState<apitypes.runner[]>([]);
  
  const navigation = useNavigation();
  const probeResult = useActionData() as apitypes.detail | null;

  useEffect(() => {
    // fetch runner data every second
    getData(setRunners);
    const intervalId = setInterval(() => {
      getData(setRunners);
    }, 1000);

    probeResult
      ? setIsModalOpen(true)
      : setIsModalOpen(false);

    return () => clearInterval(intervalId);
  }, [probeResult]);
  
  const handleUrlChange = (value: string) => {
    const valueUrls = value.split("\n");
    setUrls(valueUrls);
  };

  const filteredUrls = () => {
    return urls.filter((url) => url.trim() !== "");
  }

  const sortedRunners = runners.sort((a, b) => a.id - b.id);

  const resetInputs = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setUrls(['']);
    setTags('');
    return;
  }

  return (
    <div className="container mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-medium">New scan</CardTitle>
            <ScanTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>

          <Tabs defaultValue="job">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="job">Submit job</TabsTrigger>
              <TabsTrigger value="immediate">Test URL</TabsTrigger>
            </TabsList>
            <TabsContent value="job">
              <Form method="post" className="space-y-6">
                <div className="space-y-4 mt-4">
                  <h3 className="text-md font-semibold">URLs</h3>
                  <span className="text-sm text-muted-foreground">Enter 1 URL per line.</span>
                  <div className="flex items-center space-x-2">
                    <TextArea
                      name="urls"
                      placeholder="sensepost.com"
                      value={urls.join("\n")}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className="flex-grow"
                    />
                  </div>
                  <h3 className="text-md font-semibold">Tags</h3>
                  <span className="text-sm text-muted-foreground">Separate multiple tags using <code>,</code>.</span>
                  <div className="relative">
                    <TagsIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      name="tags"
                      placeholder="tag1,tag2"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="flex-grow font-mono pl-8"
                    />
                  </div>
                </div>
                <input type="hidden" name="action" value="job" />

                <ProbeOptions 
                  isOptionsOpen={isOptionsOpen}
                  setIsOptionsOpen={setIsOptionsOpen}
                  advancedOptions={advancedOptions}
                  setAdvancedOptions={setAdvancedOptions}
                  tab="job"
                />

                {!advancedOptions && (
                  <>
                    <input type="hidden" name="format" value="jpeg" />
                    <input type="hidden" name="threads" value="8" />
                    <input type="hidden" name="timeout" value="20" />
                    <input type="hidden" name="delay" value="1" />
                    <input type="hidden" name="user_agent" value="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36" />
                    <input type="hidden" name="window_x" value="1920" />
                    <input type="hidden" name="window_y" value="1080" />
                  </>
                )}

                <input type="hidden" name="action" value="job" />
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={resetInputs} className="border-input" disabled={urls.join("\n").length == 0 && tags.length == 0}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset inputs
                  </Button>

                  <Button type="submit" disabled={navigation.state === "submitting" || filteredUrls().length < 1}>
                    <Send className="mr-2 h-4 w-4" />
                    {navigation.state === "submitting" ? "Submitting..." : `Submit ${filteredUrls().length} target${filteredUrls().length != 1 ? "s" : ""}`}
                  </Button>
                </div>
              </Form>
            </TabsContent>
            <TabsContent value="immediate">
              <Form method="post" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-md font-semibold mt-4">URL</h3>
                  <div className="relative">
                    <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="url"
                      name="immediate-url"
                      placeholder="https://sensepost.com"
                      value={immediateUrl}
                      onChange={(e) => setImmediateUrl(e.target.value)}
                      className="flex-grow font-mono pl-8"
                    />
                  </div>
                </div>

                <ProbeOptions 
                  isOptionsOpen={isOptionsOpen} 
                  setIsOptionsOpen={setIsOptionsOpen} 
                  advancedOptions={advancedOptions} 
                  setAdvancedOptions={setAdvancedOptions}
                  tab="immediate"
                />

                {!advancedOptions && (
                  <>
                    <input type="hidden" name="format" value="jpeg" />
                    <input type="hidden" name="threads" value="8" />
                    <input type="hidden" name="timeout" value="20" />
                    <input type="hidden" name="delay" value="1" />
                    <input type="hidden" name="user_agent" value="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36" />
                    <input type="hidden" name="window_x" value="1920" />
                    <input type="hidden" name="window_y" value="1080" />
                  </>
                )}

                <input type="hidden" name="action" value="immediate" />

                <div className="flex justify-end">
                  <Button type="submit" disabled={navigation.state === "submitting" || !immediateUrl}>
                    <Send className="mr-2 h-4 w-4" />
                    {navigation.state === "submitting" ? "Running scan..." : "Scan URL"}
                  </Button>
                </div>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Result</DialogTitle>
            <DialogDescription>Details of the single-URL scan</DialogDescription>
          </DialogHeader>
          {probeResult && (
            <div className="flex-1 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                <ScrollArea className="h-[calc(90vh-8rem)] pr-4">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex flex-row items-center justify-between">
                          <CardTitle className="text-xl font-medium">URL Information</CardTitle>
                          <GlobeIcon className="h-4 w-4 text-muted-foreground" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Initial URL:</span>
                          <a href={probeResult.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                            {probeResult.url}
                            <ExternalLinkIcon className="ml-1 h-3 w-3" />
                          </a>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex flex-row items-center justify-between">
                          <CardTitle className="text-xl font-medium">Response Details</CardTitle>
                          <ServerIcon className="h-4 w-4 text-muted-foreground" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Response Code:</span>
                          <span>{probeResult.response_code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Protocol:</span>
                          <span>{probeResult.protocol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Content Length:</span>
                          <span>{probeResult.content_length} bytes</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex flex-row items-center justify-between">
                          <CardTitle className="text-xl font-medium">Page Information</CardTitle>
                          <FileTypeIcon className="h-4 w-4 text-muted-foreground" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Title:</span>
                          <span>{probeResult.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Failed:</span>
                          <span>{probeResult.failed ? 'Yes' : 'No'}</span>
                        </div>
                        {probeResult.failed && (
                          <div className="flex justify-between">
                            <span className="font-medium">Failed Reason:</span>
                            <span>{probeResult.failed_reason}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex flex-row items-center justify-between">
                          <CardTitle className="text-xl font-medium">Timing Information</CardTitle>
                          <ClockIcon className="h-4 w-4 text-muted-foreground" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between">
                          <span className="font-medium">Probed At:</span>
                          <span>{new Date(probeResult.probed_at).toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
                <div className="h-[calc(90vh-8rem)] flex flex-col">
                  <h3 className="text-lg font-semibold mb-2">Screenshot</h3>
                  <div className="flex-1 overflow-hidden">
                    <img
                      src={`data:image/jpeg;base64,${probeResult.screenshot}`}
                      alt="Screenshot"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-medium">Active Runners</CardTitle>
            <SquarePlayIcon className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {runners.length === 0 ? (
            <span className="text-muted-foreground">No active runners</span>
          ) : (
            <>
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead className="w-[100px]">Threads</TableHead>
                  <TableHead className="w-full">Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRunners.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.id}
                    </TableCell>
                    <TableCell>
                      {item.threads}
                    </TableCell>
                    <TableCell className="flex w-full items-center">
                      <span className="mr-2">{item.completed} / {item.target_count}</span>
                      <Progress className="flex-grow" progress={item.completed / item.target_count * 100} />
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
            </Table>
            </>
          )}
        </CardContent>
      </Card>

    </div>
  );
}