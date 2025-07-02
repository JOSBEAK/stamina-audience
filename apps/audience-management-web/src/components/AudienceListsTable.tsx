"use client"

import type React from "react"
import type { AudienceList } from "@stamina-project/types"
import { format } from "date-fns"
import { DataTable, ColumnDef } from "./ui/data-table"
import { Skeleton } from "./ui/skeleton"

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
      header: () => <>NAME</>,
      width: "200px", // Fixed width for name column
      cell: (audienceList) => (
        <div className="font-medium text-blue-600 truncate hover:text-blue-800" title={audienceList.name}>
          {audienceList.name}
        </div>
      ),
      skeletonCell: () => (
        <div className="font-medium text-blue-600 truncate">
          <Skeleton className="w-32 h-4" />
        </div>
      ),
      enableSorting: true,
      headerClassName: "text-left",
      cellClassName: "text-left",
    },
    {
      id: "memberCount",
      header: () => <>LIST SIZE</>,
      width: "100px", // Fixed width for list size
      cell: (audienceList) => (
        <span className="text-gray-900">{audienceList.memberCount}</span>
      ),
      skeletonCell: () => (
        <span className="flex justify-center text-gray-900">
          <Skeleton className="w-8 h-4" />
        </span>
      ),
      enableSorting: true,
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      id: "type",
      header: () => <>TYPE</>,
      width: "60px", // Fixed width for type
      cell: (audienceList) =>
        audienceList.isSystem ? (
          <span className="text-sm text-gray-600">Default</span>
        ) : (
          <div className="flex justify-start items-center min-w-0">
            <div
              className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${
                audienceList.type === "static" ? "bg-gray-400" : "bg-green-500"
              }`}
            ></div>
            <span className="text-sm text-gray-600 truncate">
              {audienceList.type === "static" ? "Static" : "Active"}
            </span>
          </div>
        ),
      skeletonCell: () => (
        <span className="flex justify-center text-sm text-gray-600">
          <Skeleton className="w-16 h-4" />
        </span>
      ),
      enableSorting: true,
      headerClassName: "text-center",
      cellClassName: "text-left",
    },
    {
      id: "object",
      header: () => <>OBJECT</>,
      width: "80px", // Fixed width for object
      cell: () => <span className="text-sm text-gray-600">Contact</span>,
      skeletonCell: () => (
        <span className="flex justify-center text-sm text-gray-600">
          <Skeleton className="w-12 h-4" />
        </span>
      ),
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      id: "updatedAt",
      header: () => <>LAST UPDATED</>,
      width: "100px", // Fixed width for date
      cell: (audienceList) =>
        audienceList.isSystem ? (
          <span className="text-gray-400">-</span>
        ) : (
          <div className="min-w-0 text-sm">
            <div className="font-medium text-gray-900 truncate">
              {format(new Date(audienceList.updatedAt), "MMM d, yyyy h:mm a").toUpperCase()}
            </div>
            <div className="mt-1 text-xs text-gray-500 truncate">
              by {audienceList.creator || "Unknown"}
            </div>
          </div>
        ),
      skeletonCell: () => (
        <div className="min-w-0 text-sm">
          <Skeleton className="mb-1 w-32 h-4" />
          <Skeleton className="w-20 h-3" />
        </div>
      ),
      enableSorting: true,
      headerClassName: "text-left",
      cellClassName: "text-left",
    },
    {
      id: "creator",
      header: () => <>CREATOR</>,
      width: "120px", // Fixed width for creator
      cell: (audienceList) => (
        <div className="text-sm text-gray-600 truncate" title={audienceList.creator || undefined}>
          {audienceList.isSystem ? "-" : audienceList.creator || "-"}
        </div>
      ),
      skeletonCell: () => (
        <div className="text-sm text-gray-600 truncate">
          <Skeleton className="w-16 h-4" />
        </div>
      ),
      enableSorting: false,
      headerClassName: "text-left",
      cellClassName: "text-left",
    },
    {
      id: "folder",
      header: () => <>FOLDER</>,
      width: "100px", // Fixed width for folder
      cell: (audienceList) => (
        <div className="text-sm text-gray-600 truncate" title={audienceList.folder || undefined}>
          {audienceList.folder || "-"}
        </div>
      ),
      skeletonCell: () => (
        <div className="text-sm text-gray-600 truncate">
          <Skeleton className="w-12 h-4" />
        </div>
      ),
      headerClassName: "text-left",
      cellClassName: "text-left",
    },
    {
      id: "usedInCount",
      header: () => <>USED IN</>,
      width: "80px", // Fixed width for used in count
      cell: (audienceList) => (
        <span className="text-sm text-gray-600">{audienceList.usedInCount || "0"}</span>
      ),
      skeletonCell: () => (
        <span className="flex justify-center text-sm text-gray-600">
          <Skeleton className="w-4 h-4" />
        </span>
      ),
      headerClassName: "text-center",
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
