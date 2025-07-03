import { useState, useEffect, useMemo } from "react"
import type { AudienceList, Contact, CsvRowData, FieldMappingConfig } from "@stamina-project/types"
import { X, ArrowRight, Check, AlertCircle, RotateCcw, Eye, EyeOff } from "lucide-react"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAudienceLists, useCreateAudienceList } from '@stamina-project/frontend-hooks'
import { Input } from './ui/input'
import { toast } from 'sonner'

interface FieldMappingProps {
  onClose: () => void
  onConfirm: (mapping: FieldMappingConfig, audienceListId?: string) => void
  csvData: CsvRowData[]
  csvHeaders: string[]
  currentAudienceListId?: string
}

const APP_FIELDS = [
  { key: "name", label: "Name", required: true },
  { key: "email", label: "Email", required: true },
  { key: "role", label: "Role", required: true },
  { key: "company", label: "Company", required: true },
  { key: "industry", label: "Industry", required: true },
  { key: "location", label: "Location", required: true },
  { key: "avatar", label: "Avatar", required: true },
]

export default function FieldMapping({ onClose, onConfirm, csvData, csvHeaders, currentAudienceListId }: FieldMappingProps) {
  const [mapping, setMapping] = useState<FieldMappingConfig>({})
  const [ignoreEmpty, setIgnoreEmpty] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedAudienceList, setSelectedAudienceList] = useState<string>(currentAudienceListId || 'new_list')
  const [newAudienceListName, setNewAudienceListName] = useState('')

  const { data: audienceLists, isLoading: isLoadingAudienceLists } = useAudienceLists()
  const createAudienceListMutation = useCreateAudienceList()

  // Auto-map fields on component mount
  useEffect(() => {
    const initialMapping: Record<string, string> = {}
    const usedAppFields = new Set<string>()

    csvHeaders.forEach((header) => {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, "")
      const matchedField = APP_FIELDS.find((field) => {
        const normalizedField = field.key.toLowerCase().replace(/[^a-z0-9]/g, "")
        return (
          !usedAppFields.has(field.key) &&
          (normalizedHeader === normalizedField ||
            normalizedHeader.includes(normalizedField) ||
            normalizedField.includes(normalizedHeader))
        )
      })

      if (matchedField) {
        initialMapping[header] = matchedField.key
        usedAppFields.add(matchedField.key)
      }
    })
    setMapping(initialMapping)
  }, [csvHeaders])

  const handleConfirmClick = async () => {
    if (selectedAudienceList === 'new_list' && !newAudienceListName.trim()) {
      toast.error('Please enter a name for the new audience list.');
      return;
    }

    let audienceListIdToUse: string | undefined = undefined;

    if (selectedAudienceList === 'new_list') {
      try {
        const newAudienceList = await createAudienceListMutation.mutateAsync({
          name: newAudienceListName.trim(),
        });
        audienceListIdToUse = newAudienceList.id;
        toast.success(`Audience List "${newAudienceList.name}" created.`);
      } catch (error) {
        toast.error('Failed to create new audience list.');
        console.error(error);
        return;
      }
    } else {
      audienceListIdToUse = selectedAudienceList;
    }

    onConfirm(mapping, audienceListIdToUse);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const requiredFields = APP_FIELDS.filter(f => f.required).map(f => f.key);
    const mappedAppFields = new Set(Object.values(mapping));
    const allRequiredFieldsMapped = requiredFields.every(f => mappedAppFields.has(f));

    let validRows = 0;
    const processedData = csvData.map((row) => {
      const newRow: Partial<Contact> = {};
      let hasRequiredValues = true;
      for (const csvHeader in mapping) {
        const appField = mapping[csvHeader];
        const value = row[csvHeader] ? String(row[csvHeader]).trim() : '';
        if (value && appField) {
          (newRow as Record<string, unknown>)[appField] = value;
        }
        if (requiredFields.includes(appField) && !value) {
          hasRequiredValues = false;
        }
      }

      if(hasRequiredValues && Object.keys(newRow).length > 0) {
        if (!ignoreEmpty) {
          validRows++;
        } else if (Object.values(newRow).some(v => v !== '')) {
          validRows++;
        }
      }
      return newRow;
    });

    const mappedFields = Object.keys(mapping).length;
    const requiredFieldsMappedCount = APP_FIELDS.filter(
      (field) => field.required && Object.values(mapping).includes(field.key),
    ).length;
    const totalRequiredFields = APP_FIELDS.filter((field) => field.required).length;


    return {
      totalRows: csvData.length,
      validRows: validRows,
      mappedFields,
      totalFields: csvHeaders.length,
      requiredFieldsMapped: requiredFieldsMappedCount,
      totalRequiredFields,
      allRequiredFieldsMapped,
      processedData: processedData.slice(0, 3), // Preview first 3 rows
    }
  }, [csvData, mapping, ignoreEmpty, csvHeaders.length])

  const handleMappingChange = (csvHeader: string, appField: string) => {
    setMapping((prev) => {
      const newMapping = { ...prev }
      // Remove the appField from any other header that might be using it
      for (const key in newMapping) {
        if (newMapping[key] === appField && key !== csvHeader) {
          delete newMapping[key]
        }
      }
      if (appField) {
        newMapping[csvHeader] = appField
      } else {
        delete newMapping[csvHeader]
      }
      return newMapping
    })
  }

  const clearAllMappings = () => {
    setMapping({})
  }

  // const getSampleData = (header: string) => {
  //   const samples = csvData
  //     .slice(0, 3)
  //     .map((row) => row[header])
  //     .filter((val) => val && String(val).trim())
  //     .slice(0, 2)
  //   return samples.length > 0 ? samples.join(", ") : "No data"
  // }

  const renderCellValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (value instanceof Date) return value.toLocaleDateString();
    if (Array.isArray(value)) return value.length > 0 ? `[${value.length} items]` : "[]";
    if (typeof value === 'object') return "[Object]";
    return String(value);
  }

  const canProceed = stats.requiredFieldsMapped === stats.totalRequiredFields && stats.validRows > 0

  return (
    <TooltipProvider>
      <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold">Map CSV Fields</h2>
              <p className="mt-1 text-sm text-muted-foreground">Match your CSV columns to contact fields</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          <div className="overflow-auto flex-1 p-6">
            {/* Statistics Card */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex gap-2 items-center text-lg">
                  Import Summary
                  {!canProceed && (
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Map required fields to proceed</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalRows}</div>
                    <div className="text-sm text-muted-foreground">Total Rows</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.validRows}</div>
                    <div className="text-sm text-muted-foreground">Will Import</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.mappedFields}/{stats.totalFields}
                    </div>
                    <div className="text-sm text-muted-foreground">Fields Mapped</div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${
                        stats.requiredFieldsMapped === stats.totalRequiredFields ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stats.requiredFieldsMapped}/{stats.totalRequiredFields}
                    </div>
                    <div className="text-sm text-muted-foreground">Required Fields</div>
                  </div>
                </div>

                {stats.validRows !== stats.totalRows && (
                  <div className="p-3 mt-4 bg-amber-50 rounded-md border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <AlertCircle className="inline mr-1 w-4 h-4" />
                      {stats.totalRows - stats.validRows} rows will be skipped due to missing data
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Field Mapping */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Field Mapping</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                      {showPreview ? <EyeOff className="mr-1 w-4 h-4" /> : <Eye className="mr-1 w-4 h-4" />}
                      {showPreview ? "Hide" : "Show"} Preview
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearAllMappings}>
                      <RotateCcw className="mr-1 w-4 h-4" />
                      Clear All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {csvHeaders.map((header) => (
                    <div key={header} className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4">
                        <div className="p-3 bg-gray-50 rounded-md border">
                          <div className="text-sm font-medium">{header}</div>
                          {/* <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                            Sample: {getSampleData(header)}
                          </div> */}
                        </div>
                      </div>

                      <div className="flex col-span-1 justify-center">
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>

                      <div className="col-span-6">
                        <Select
                          onValueChange={(value) => handleMappingChange(header, value)}
                          value={mapping[header] || "none"}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field to map to" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Don't map this field</SelectItem>
                            {APP_FIELDS.map((field) => (
                              <SelectItem
                                key={field.key}
                                value={field.key}
                                disabled={Object.values(mapping).includes(field.key) && mapping[header] !== field.key}
                              >
                                <div className="flex gap-2 items-center">
                                  {field.label}
                                  {field.required && (
                                    <Badge variant="secondary" className="text-xs">
                                      Required
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex col-span-1 justify-center">
                        {mapping[header] && <Check className="w-4 h-4 text-green-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Preview Section */}
            {showPreview && stats.processedData.length > 0 && (
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Data Preview</CardTitle>
                  <p className="text-sm text-muted-foreground">Preview of how your data will look after import</p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {Object.values(mapping).map((field) => (
                            <th key={field} className="p-2 font-medium text-left">
                              {APP_FIELDS.find((f) => f.key === field)?.label || field}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {stats.processedData.map((row, index) => (
                          <tr key={index} className="border-b">
                            {Object.values(mapping).map((field) => (
                              <td key={field} className="p-2">
                                {renderCellValue(row[field as keyof Contact])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {stats.validRows > 3 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Showing first 3 rows of {stats.validRows} total rows
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Options */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Import Options</CardTitle>
              </CardHeader>
              <CardContent>
                <label className="flex gap-2 items-center cursor-pointer">
                  <Checkbox checked={ignoreEmpty} onCheckedChange={(checked) => setIgnoreEmpty(Boolean(checked))} />
                  <span className="text-sm">Skip rows with empty required fields</span>
                </label>
              </CardContent>
            </Card>

            <div className="pt-6 mt-8 border-t">
              <h3 className="mb-4 text-lg font-semibold">Add to Audience List</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Organize these new contacts by adding them to an audience list. You can
                choose an existing one or create a new one.
              </p>
              <div className="grid grid-cols-2 gap-4 items-start">
                <p className="text-sm font-medium">Add contacts to:</p>
                <div className="space-y-2">
                  <Select onValueChange={setSelectedAudienceList} value={selectedAudienceList}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an audience list" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new_list">Create new audience list</SelectItem>
                      {isLoadingAudienceLists ? (
                        <SelectItem value="loading" disabled>Loading lists...</SelectItem>
                      ) : (
                        audienceLists?.map((list:AudienceList) => (
                          <SelectItem key={list.id} value={list.id}>
                            {list.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedAudienceList === 'new_list' && (
                    <Input
                      placeholder="New audience list name..."
                      value={newAudienceListName}
                      onChange={(e) => setNewAudienceListName(e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {canProceed ? (
                  <span className="font-medium text-green-600">✓ Ready to import {stats.validRows} contacts</span>
                ) : (
                  <span className="text-red-600">Please map all required fields to continue</span>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full md:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmClick}
                  disabled={!stats.allRequiredFieldsMapped || createAudienceListMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {createAudienceListMutation.isPending ? 'Creating Audience List...' : 'Confirm and Upload'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
