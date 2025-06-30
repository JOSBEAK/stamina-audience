"use client"

import type React from "react"
import type { AudienceList } from "@stamina-project/types"
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

interface AudienceListsTableProps {
  isLoading: boolean
  audienceLists: AudienceList[] | undefined
  selectedAudienceLists: string[]
  isAllSelected: boolean
  allContactsCount: number
  onSelectAll: () => void
  onSelectionChange: (id: string) => void
  onSelectAudienceList: (id: string | null) => void
  onSort: (field: string) => void
  sortField: string
  sortDirection: "asc" | "desc" | null
}

const columns: ColumnDef<AudienceList>[] = [
  {
    id: "name",
    header: () => (
      <>
        NAME <Info className="ml-1 w-3 h-3 text-gray-400" />
      </>
    ),
    cell: (audienceList) => (
      <div className="font-medium text-blue-600 truncate hover:text-blue-800">
        {audienceList.name}
      </div>
    ),
    enableSorting: true,
  },
  {
    id: "memberCount",
    header: () => <>LIST SIZE</>,
    cell: (audienceList) => (
      <span className="text-gray-900">{audienceList.memberCount}</span>
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
    cell: (audienceList) => (
      <div className="flex justify-center items-center">
        <div
          className={`w-2 h-2 rounded-full mr-2 ${
            audienceList.type === "static" ? "bg-gray-400" : "bg-green-500"
          }`}
        ></div>
        <span className="text-sm text-gray-600">
          {audienceList.type === "static" ? "Static" : "Active"}
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
    cell: (audienceList) => (
      <div className="text-sm">
        <div className="font-medium text-gray-900">
          {format(new Date(audienceList.updatedAt), "MMM d, yyyy h:mm a").toUpperCase()}
        </div>
        <div className="mt-1 text-xs text-gray-500">by {audienceList.creator || "Unknown"}</div>
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
    cell: (audienceList) => (
      <div
        className={cn(
          "text-gray-900 truncate",
          audienceList.creator ? "text-primary" : "text-muted-foreground"
        )}
      >
        {audienceList.creator || "-"}
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
    cell: (audienceList) => (
      <span className="text-gray-400">{audienceList.folder || "-"}</span>
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
              <p>Number of broadcasts using this audience list.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    ),
    cell: (audienceList) => (
      <span className="font-medium text-primary">
        {audienceList.usedInCount || 0}
      </span>
    ),
    enableSorting: true,
  },
]

export const AudienceListsTable: React.FC<AudienceListsTableProps> = ({
  isLoading,
  audienceLists,
  selectedAudienceLists,
  isAllSelected,
  allContactsCount,
  onSelectAll,
  onSelectionChange,
  onSelectAudienceList,
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
    usedInCount: 0,
    isSystem: true,
  } as const

  const data = [allContactsRow, ...(audienceLists || [])] as (AudienceList & {
    isSystem?: boolean
  })[]

  const customColumns: ColumnDef<AudienceList & { isSystem?: boolean }>[] = [
    {
      id: "name",
      header: () => (
        <>
          NAME
        </>
      ),
      cell: (audienceList) => (
        <div className="font-medium text-blue-600 hover:text-blue-800">
          {audienceList.name}
        </div>
      ),
      enableSorting: true,
      headerClassName: "w-40",
    },
    {
      id: "memberCount",
      header: () => <>LIST SIZE</>,
      cell: (audienceList) => (
        <span className="text-gray-900">{audienceList.memberCount}</span>
      ),
      enableSorting: true,
      headerClassName: "w-20 text-center",
      cellClassName: "text-center",
    },
    {
      id: "type",
      header: () => <>TYPE</>,
      cell: (audienceList) =>
        audienceList.isSystem ? (
          <span className="text-sm text-gray-600">Default</span>
        ) : (
          <div className="flex justify-center items-center">
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                audienceList.type === "static" ? "bg-gray-400" : "bg-green-500"
              }`}
            ></div>
            <span className="text-sm text-gray-600">
              {audienceList.type === "static" ? "Static" : "Active"}
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
      cell: (audienceList) =>
        audienceList.isSystem ? (
          <span className="text-gray-400">-</span>
        ) : (
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {format(new Date(audienceList.updatedAt), "MMM d, yyyy h:mm a").toUpperCase()}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              by {audienceList.creator || "Unknown"}
            </div>
          </div>
        ),
      enableSorting: true,
      headerClassName: "w-48",
    },
    {
      id: "creator",
      header: () => <>CREATOR</>,
      cell: (audienceList) => <>{audienceList.isSystem ? "-" : audienceList.creator || "-"}</>,
      enableSorting: true,
      headerClassName: "w-32",
    },
    {
      id: "folder",
      header: () => <>FOLDER</>,
      cell: (audienceList) => <>{audienceList.folder || "-"}</>,
      headerClassName: "w-24",
    },
    {
      id: "usedInCount",
      header: () => <>USED IN (COUNT)</>,
      cell: (audienceList) => <>{audienceList.usedInCount || "0"}</>,
      headerClassName: "w-24 text-center",
      cellClassName: "text-center",
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
      selectedIds={selectedAudienceLists}
      onSelectionChange={onSelectionChange}
      onSelectAll={onSelectAll}
      isAllSelected={isAllSelected}
      getRowId={(row) => row.id}
      onRowClick={(row) => onSelectAudienceList(row.isSystem ? null : row.id)}
    />
  )
}
