"use client"

import type React from "react"
import type { Segment } from "@stamina-project/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { Skeleton } from "./ui/skeleton"
import { format } from "date-fns"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { cn } from "@/lib/utils"

interface SegmentsTableProps {
  isLoading: boolean
  segments: Segment[] | undefined
  selectedSegments: string[]
  isAllSelected: boolean
  allContactsCount: number
  onSelectAll: () => void
  onSelectionChange: (id: string) => void
  onSelectSegment: (id: string | null) => void
  onSort: (field: string) => void
  renderSortArrow: (field: string) => React.ReactNode
}

export const SegmentsTable: React.FC<SegmentsTableProps> = ({
  isLoading,
  segments,
  selectedSegments,
  isAllSelected,
  allContactsCount,
  onSelectAll,
  onSelectionChange,
  onSelectSegment,
  onSort,
  renderSortArrow,
}) => {
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="border-b bg-gray-50/50">
            <TableHead className="w-12 pl-4">
              <Checkbox checked={isAllSelected} onCheckedChange={onSelectAll} />
            </TableHead>
            <TableHead className="w-40 font-medium text-gray-700">
              <Button
                variant="ghost"
                onClick={() => onSort("name")}
                className="h-auto p-0 font-medium text-gray-700 hover:text-gray-900 hover:bg-transparent"
              >
                NAME
                <Info className="ml-1 h-3 w-3 text-gray-400" />
                {renderSortArrow("name")}
              </Button>
            </TableHead>
            <TableHead className="w-20 text-center font-medium text-gray-700">
              <Button
                variant="ghost"
                onClick={() => onSort("memberCount")}
                className="h-auto p-0 font-medium text-gray-700 hover:text-gray-900 hover:bg-transparent"
              >
                LIST SIZE
                {renderSortArrow("memberCount")}
              </Button>
            </TableHead>
            <TableHead className="w-16 text-center font-medium text-gray-700">
              <Button
                variant="ghost"
                onClick={() => onSort("type")}
                className="h-auto p-0 font-medium text-gray-700 hover:text-gray-900 hover:bg-transparent"
              >
                TYPE
                {renderSortArrow("type")}
                <Info className="ml-1 h-3 w-3 text-gray-400" />
              </Button>
            </TableHead>
            <TableHead className="w-24 text-center font-medium text-gray-700">
              <div className="flex items-center justify-center">
                OBJECT
                <Info className="ml-1 h-3 w-3 text-gray-400" />
              </div>
            </TableHead>
            <TableHead className="w-48 font-medium text-gray-700">
              <Button
                variant="ghost"
                onClick={() => onSort("updatedAt")}
                className="h-auto p-0 font-medium text-gray-700 hover:text-gray-900 hover:bg-transparent"
              >
                LAST UPDATED (GMT+5:30)
                {renderSortArrow("updatedAt")}
                <Info className="ml-1 h-3 w-3 text-gray-400" />
              </Button>
            </TableHead>
            <TableHead className="w-32 font-medium text-gray-700">
              <div className="flex items-center">
                CREATOR
                <Info className="ml-1 h-3 w-3 text-gray-400" />
              </div>
            </TableHead>
            <TableHead className="w-24 font-medium text-gray-700">
              <div className="flex items-center">
                FOLD...
                <Info className="ml-1 h-3 w-3 text-gray-400" />
              </div>
            </TableHead>
            <TableHead className="w-32 text-right font-medium text-gray-700 pr-4">
              <div className="flex items-center justify-end">
                USED IN (COUNT)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="ml-1 h-3 w-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Number of broadcasts using this segment.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="cursor-pointer hover:bg-gray-50/50 border-b" onClick={() => onSelectSegment(null)}>
            <TableCell className="pl-4">
              <Checkbox disabled className="cursor-not-allowed" />
            </TableCell>
            <TableCell className="py-4">
              <div className="font-medium text-blue-600 hover:text-blue-800">All Contacts</div>
            </TableCell>
            <TableCell className="text-center py-4">
              <span className="text-gray-900">{allContactsCount}</span>
            </TableCell>
            <TableCell className="text-center py-4">
              <div className="flex items-center justify-center">
                <span className="text-sm text-gray-600">Default</span>
              </div>
            </TableCell>
            <TableCell className="text-center py-4">
              <span className="text-gray-900">Contact</span>
            </TableCell>
            <TableCell className="py-4">
              <span className="text-gray-400">-</span>
            </TableCell>
            <TableCell className="py-4">
              <span className="text-gray-400">-</span>
            </TableCell>
            <TableCell className="py-4">
              <span className="text-gray-400">-</span>
            </TableCell>
            <TableCell className="text-center py-4 pr-4">
              <span className="text-gray-400">-</span>
            </TableCell>
          </TableRow>

          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b">
                  <TableCell className="pl-4 py-4">
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-8 mx-auto" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="py-4 pr-4">
                    <Skeleton className="h-4 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            : segments?.map((segment) => (
                <TableRow
                  key={segment.id}
                  onClick={() => onSelectSegment(segment.id)}
                  className={`${
                    selectedSegments.includes(segment.id) ? "bg-blue-50" : ""
                  } cursor-pointer hover:bg-gray-50/50 border-b`}
                >
                  <TableCell className="pl-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedSegments.includes(segment.id)}
                      onCheckedChange={() => onSelectionChange(segment.id)}
                    />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="font-medium text-blue-600 hover:text-blue-800 truncate">{segment.name}</div>
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <span className="text-gray-900">{segment.memberCount}</span>
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          segment.type === "static" ? "bg-gray-400" : "bg-green-500"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-600">{segment.type === "static" ? "Static" : "Active"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <span className="text-gray-900">Contact</span>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="text-sm">
                      <div className="text-gray-900 font-medium">
                        {format(new Date(segment.updatedAt), "MMM d, yyyy h:mm a").toUpperCase()}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">by {segment.creator || "Unknown"}</div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className={cn("text-gray-900 truncate", segment.creator ? "text-primary" : "text-muted-foreground")}>{segment.creator || "-"}</div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-gray-400">{segment.folder || "-"}</span>
                  </TableCell>
                  <TableCell className="text-center py-4 pr-4">
                    <span className="text-primary font-medium">{segment.usedInCount || 0}</span>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  )
}
