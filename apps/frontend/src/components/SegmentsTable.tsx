"use client"

import type React from "react"
import type { Segment } from "@stamina-project/types"
import { TableCell } from "@/components/ui/table"
import { Skeleton } from "./ui/skeleton"
import { format } from "date-fns"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import { cn } from "@/lib/utils"
import { DataTable, ColumnDef } from "./ui/data-table"

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
  sortField: string
  sortDirection: "asc" | "desc" | null
}

const columns: ColumnDef<Segment>[] = [
  {
    id: "name",
    header: () => (
      <>
        NAME <Info className="ml-1 w-3 h-3 text-gray-400" />
      </>
    ),
    cell: (segment) => (
      <div className="font-medium text-blue-600 truncate hover:text-blue-800">
        {segment.name}
      </div>
    ),
    enableSorting: true,
  },
  {
    id: "memberCount",
    header: () => <>LIST SIZE</>,
    cell: (segment) => (
      <span className="text-gray-900">{segment.memberCount}</span>
    ),
    enableSorting: true,
  },
  {
    id: "type",
    header: () => (
      <>
        TYPE <Info className="ml-1 w-3 h-3 text-gray-400" />
      </>
    ),
    cell: (segment) => (
      <div className="flex justify-center items-center">
        <div
          className={`w-2 h-2 rounded-full mr-2 ${
            segment.type === "static" ? "bg-gray-400" : "bg-green-500"
          }`}
        ></div>
        <span className="text-sm text-gray-600">
          {segment.type === "static" ? "Static" : "Active"}
        </span>
      </div>
    ),
    enableSorting: true,
  },
  {
    id: "object",
    header: () => (
      <div className="flex justify-center items-center">
        OBJECT <Info className="ml-1 w-3 h-3 text-gray-400" />
      </div>
    ),
    cell: () => <span className="text-gray-900">Contact</span>,
  },
  {
    id: "updatedAt",
    header: () => (
      <>
        LAST UPDATED (GMT+5:30) <Info className="ml-1 w-3 h-3 text-gray-400" />
      </>
    ),
    cell: (segment) => (
      <div className="text-sm">
        <div className="font-medium text-gray-900">
          {format(new Date(segment.updatedAt), "MMM d, yyyy h:mm a").toUpperCase()}
        </div>
        <div className="mt-1 text-xs text-gray-500">by {segment.creator || "Unknown"}</div>
      </div>
    ),
    enableSorting: true,
  },
  {
    id: "creator",
    header: () => (
      <div className="flex items-center">
        CREATOR <Info className="ml-1 w-3 h-3 text-gray-400" />
      </div>
    ),
    cell: (segment) => (
      <div
        className={cn(
          "text-gray-900 truncate",
          segment.creator ? "text-primary" : "text-muted-foreground"
        )}
      >
        {segment.creator || "-"}
      </div>
    ),
    enableSorting: true,
  },
  {
    id: "folder",
    header: () => (
      <div className="flex items-center">
        FOLDER <Info className="ml-1 w-3 h-3 text-gray-400" />
      </div>
    ),
    cell: (segment) => (
      <span className="text-gray-400">{segment.folder || "-"}</span>
    ),
    enableSorting: true,
  },
  {
    id: "usedInCount",
    header: () => (
      <div className="flex justify-end items-center">
        USED IN (COUNT)
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="ml-1 w-3 h-3 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Number of broadcasts using this segment.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    ),
    cell: (segment) => (
      <span className="font-medium text-primary">
        {segment.usedInCount || 0}
      </span>
    ),
    enableSorting: true,
  },
]

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
  sortField,
  sortDirection,
}) => {
  const allContactsRow = {
    id: "all-contacts",
    name: "All Contacts",
    memberCount: allContactsCount,
    type: "default",
    object: "Contact",
    updatedAt: new Date().toISOString(),
    creator: "-",
    folder: "-",
    usedInCount: "-",
    isSystem: true,
  } as const

  const data = [allContactsRow, ...(segments || [])] as (Segment & {
    isSystem?: boolean
  })[]

  const customColumns: ColumnDef<Segment & { isSystem?: boolean }>[] = [
    {
      id: "name",
      header: () => (
        <>
          NAME
        </>
      ),
      cell: (segment) => (
        <div className="font-medium text-blue-600 hover:text-blue-800">
          {segment.name}
        </div>
      ),
      enableSorting: true,
      headerClassName: "w-40",
    },
    {
      id: "memberCount",
      header: () => <>LIST SIZE</>,
      cell: (segment) => (
        <span className="text-gray-900">{segment.memberCount}</span>
      ),
      enableSorting: true,
      headerClassName: "w-20 text-center",
      cellClassName: "text-center",
    },
    {
      id: "type",
      header: () => <>TYPE</>,
      cell: (segment) =>
        segment.isSystem ? (
          <span className="text-sm text-gray-600">Default</span>
        ) : (
          <div className="flex justify-center items-center">
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                segment.type === "static" ? "bg-gray-400" : "bg-green-500"
              }`}
            ></div>
            <span className="text-sm text-gray-600">
              {segment.type === "static" ? "Static" : "Active"}
            </span>
          </div>
        ),
      enableSorting: true,
      headerClassName: "w-16 text-center",
      cellClassName: "text-center",
    },
    {
      id: "object",
      header: () => <>OBJECT</>,
      cell: () => <>Contact</>,
      headerClassName: "w-24 text-center",
      cellClassName: "text-center",
    },
    {
      id: "updatedAt",
      header: () => <>LAST UPDATED (GMT+5:30)</>,
      cell: (segment) =>
        segment.isSystem ? (
          <span className="text-gray-400">-</span>
        ) : (
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {format(new Date(segment.updatedAt), "MMM d, yyyy h:mm a").toUpperCase()}
            </div>
            <div className="mt-1 text-xs text-gray-500">by {segment.creator || "Unknown"}</div>
          </div>
        ),
      enableSorting: true,
      headerClassName: "w-48",
    },
    {
      id: "creator",
      header: () => <>CREATOR</>,
      cell: (segment) => (
        <>{segment.isSystem ? "-" : segment.creator || "-"}</>
      ),
      headerClassName: "w-32",
    },
    {
      id: "folder",
      header: () => <>FOLDER</>,
      cell: (segment) => <>{segment.folder || "-"}</>,
      headerClassName: "w-24",
    },
    {
      id: "usedInCount",
      header: () => <>USED IN (COUNT)</>,
      cell: (segment) => <>{segment.usedInCount || "0"}</>,
      headerClassName: "w-32 text-right",
      cellClassName: "text-right",
    },
  ]

  return (
    <DataTable
      columns={customColumns}
      data={data}
      isLoading={isLoading}
      onSort={onSort}
      sortField={sortField}
      sortDirection={sortDirection}
      selectedIds={selectedSegments}
      onSelectionChange={onSelectionChange}
      onSelectAll={onSelectAll}
      isAllSelected={isAllSelected}
      onRowClick={(row) => onSelectSegment(row.isSystem ? null : row.id)}
      getRowId={(row) => (row.isSystem ? "all-contacts" : row.id)}
    />
  )
}
