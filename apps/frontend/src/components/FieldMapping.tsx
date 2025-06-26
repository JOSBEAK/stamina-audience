
import { useState, useEffect, useMemo } from "react"
import type { Contact } from "@stamina-project/types"
import { X, ArrowRight, Check, AlertCircle, RotateCcw, Eye, EyeOff } from "lucide-react"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FieldMappingProps {
  onClose: () => void
  onConfirm: (mappedData: Partial<Contact>[]) => void
  csvData: any[]
  csvHeaders: string[]
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

export default function FieldMapping({ onClose, onConfirm, csvData, csvHeaders }: FieldMappingProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [ignoreEmpty, setIgnoreEmpty] = useState(true)
  const [showPreview, setShowPreview] = useState(false)

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

  // Calculate statistics
  const stats = useMemo(() => {
    let processedData = csvData.map((row) => {
      const newRow: Partial<Contact> = {}
      for (const csvHeader in mapping) {
        const appField = mapping[csvHeader] as keyof Contact
        if (row[csvHeader] && String(row[csvHeader]).trim()) {
          newRow[appField] = String(row[csvHeader]).trim()
        }
      }
      return newRow
    })

    if (ignoreEmpty) {
      processedData = processedData.filter(
        (row) => Object.keys(row).length > 0 && APP_FIELDS.some((field) => row[field.key as keyof Contact]),
      )
    }

    const mappedFields = Object.keys(mapping).length
    const requiredFieldsMapped = APP_FIELDS.filter(
      (field) => field.required && Object.values(mapping).includes(field.key),
    ).length
    const totalRequiredFields = APP_FIELDS.filter((field) => field.required).length

    return {
      totalRows: csvData.length,
      validRows: processedData.length,
      mappedFields,
      totalFields: csvHeaders.length,
      requiredFieldsMapped,
      totalRequiredFields,
      processedData: processedData.slice(0, 3), // Preview first 3 rows
    }
  }, [csvData, mapping, ignoreEmpty])

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

  const handleConfirm = () => {
    let processedData = csvData.map((row) => {
      const newRow: Partial<Contact> = {}
      for (const csvHeader in mapping) {
        const appField = mapping[csvHeader] as keyof Contact
        if (row[csvHeader] && String(row[csvHeader]).trim()) {
          newRow[appField] = String(row[csvHeader]).trim()
        }
      }
      return newRow
    })

    if (ignoreEmpty) {
      processedData = processedData.filter(
        (row) => Object.keys(row).length > 0 && APP_FIELDS.some((field) => row[field.key as keyof Contact]),
      )
    }
    onConfirm(processedData)
  }

  const getSampleData = (header: string) => {
    const samples = csvData
      .slice(0, 3)
      .map((row) => row[header])
      .filter((val) => val && String(val).trim())
      .slice(0, 2)
    return samples.length > 0 ? samples.join(", ") : "No data"
  }

  const canProceed = stats.requiredFieldsMapped === stats.totalRequiredFields && stats.validRows > 0

  return (
    <TooltipProvider>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold">Map CSV Fields</h2>
              <p className="text-sm text-muted-foreground mt-1">Match your CSV columns to contact fields</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {/* Statistics Card */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  Import Summary
                  {!canProceed && (
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Map required fields to proceed</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-sm text-amber-800">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
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
                      {showPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                      {showPreview ? "Hide" : "Show"} Preview
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearAllMappings}>
                      <RotateCcw className="h-4 w-4 mr-1" />
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
                        <div className="p-3 border rounded-md bg-gray-50">
                          <div className="font-medium text-sm">{header}</div>
                          {/* <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                            Sample: {getSampleData(header)}
                          </div> */}
                        </div>
                      </div>

                      <div className="col-span-1 flex justify-center">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
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
                                <div className="flex items-center gap-2">
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

                      <div className="col-span-1 flex justify-center">
                        {mapping[header] && <Check className="h-4 w-4 text-green-500" />}
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
                            <th key={field} className="text-left p-2 font-medium">
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
                                {row[field as keyof Contact] || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {stats.validRows > 3 && (
                    <p className="text-xs text-muted-foreground mt-2">
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
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={ignoreEmpty} onCheckedChange={(checked) => setIgnoreEmpty(Boolean(checked))} />
                  <span className="text-sm">Skip rows with empty required fields</span>
                </label>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="border-t p-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {canProceed ? (
                  <span className="text-green-600 font-medium">✓ Ready to import {stats.validRows} contacts</span>
                ) : (
                  <span className="text-red-600">Please map all required fields to continue</span>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleConfirm} disabled={!canProceed}>
                  Import {stats.validRows} Contacts
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
