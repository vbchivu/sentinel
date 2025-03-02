
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Upload, FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

// Define available regions
const REGIONS = [
  { id: "kenya", name: "Kenya" },
  { id: "brazil", name: "Brazil" },
  { id: "india", name: "India" },
  { id: "indonesia", name: "Indonesia" },
  { id: "nigeria", name: "Nigeria" },
];

const UploadDataPage = () => {
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [region, setRegion] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<string[][]>([]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      readCSVFile(selectedFile);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please upload a valid CSV file.",
      });
      setFile(null);
      setPreviewData([]);
    }
  };

  // Read and parse CSV file for preview
  const readCSVFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter(line => line.trim() !== "");
      
      // Get header and first 5 rows for preview
      const preview = lines.slice(0, 6).map(line => 
        line.split(",").map(cell => cell.trim())
      );
      
      setPreviewData(preview);
    };
    
    reader.readAsText(file);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please upload a CSV file.",
      });
      return;
    }
    
    if (!region) {
      toast({
        variant: "destructive",
        title: "No region selected",
        description: "Please select a region.",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      if (user && supabase) {
        // Real API upload - In a production app, this would upload to Supabase storage
        const timestamp = new Date().getTime();
        const filePath = `uploads/${region}/${timestamp}_${file.name}`;
        
        // Upload file to storage
        const { data: storageData, error: storageError } = await supabase.storage
          .from('data_uploads')
          .upload(filePath, file);
        
        if (storageError) throw storageError;
        
        // Record upload in database
        const { error: dbError } = await supabase
          .from('data_uploads')
          .insert({
            region: region,
            filename: file.name,
            file_path: filePath,
            uploaded_by: user.id,
            status: 'pending'
          });
        
        if (dbError) throw dbError;
        
        toast({
          title: "Success",
          description: "Data uploaded successfully and queued for processing.",
        });
      } else {
        // Mock upload for non-authenticated users
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
          title: "Success",
          description: "Data uploaded successfully (demo mode).",
        });
      }
      
      // Reset form
      setFile(null);
      setPreviewData([]);
      setRegion("");
      
      // Reset file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your data.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container py-6 space-y-6 max-w-screen-xl">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Upload Data</h2>
        <p className="text-muted-foreground">
          Upload CSV files for analysis and processing.
        </p>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card>
          <CardHeader>
            <CardTitle>File Upload</CardTitle>
            <CardDescription>
              Upload a CSV file and select the region for data processing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label 
                    htmlFor="file-upload" 
                    className="block text-sm font-medium text-foreground"
                  >
                    CSV File
                  </label>
                  <div className="flex items-center gap-4">
                    <label 
                      htmlFor="file-upload" 
                      className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <FileUp className="h-4 w-4" />
                      {file ? file.name : "Choose CSV file"}
                    </label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Only CSV files are supported.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label 
                    htmlFor="region-select" 
                    className="block text-sm font-medium text-foreground"
                  >
                    Region
                  </label>
                  <Select 
                    value={region} 
                    onValueChange={setRegion}
                  >
                    <SelectTrigger id="region-select">
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select the region for this data set.
                  </p>
                </div>
              </div>
              
              {previewData.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Data Preview</h3>
                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {previewData[0].map((header, index) => (
                              <TableHead key={index}>{header}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewData.slice(1, 6).map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <TableCell key={cellIndex}>{cell}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Showing the first 5 rows of your data.
                  </p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full sm:w-auto" 
                disabled={isUploading || !file || !region}
              >
                {isUploading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Data
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default UploadDataPage;
