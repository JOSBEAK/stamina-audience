import type React from "react"
import type { Contact } from "@stamina-project/types"
import { Trash2, Edit, ArrowUp, ArrowDown } from "lucide-react"
import { Checkbox } from "./ui/checkbox"
import { Skeleton } from "./ui/skeleton"
import { Button } from "./ui/button"
import { EmptyState } from "./EmptyState"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ChevronsUpDown } from "lucide-react"
import { DataTable, ColumnDef } from './ui/data-table'

interface AudienceTableProps {
  contacts: Contact[]
  loading: boolean
  selectedContacts: string[]
  onSelectionChange: (contactId: string) => void
  onSelectAll: () => void
  onDeleteSelected: () => void
  onEditSelected: (contactId: string) => void
  onAddToAudienceList: () => void
  areFiltersActive: boolean
  onAddContact: () => void
  isAudienceListView: boolean
  onRemoveFromAudienceList: () => void
  onSort: (field: string) => void
  sortField: string
  sortDirection: 'asc' | 'desc' | null
}

const columns: ColumnDef<Contact>[] = [
  {
    id: 'name',
    header: () => <>NAME</>,
    width: '320px', // Fixed width for name column
    headerClassName: 'text-left',
    cellClassName: 'text-left',
    cell: (contact) => (
      <div className="flex items-center min-w-0">
        <div className="flex-shrink-0 w-10 h-10">
          <img
            className="w-10 h-10 rounded-full object-cover"
            src={contact.avatar || '/placeholder.svg'}
            alt=""
          />
        </div>
        <div className="ml-3 min-w-0 flex-1">
          <div className="text-sm font-medium text-gray-900 truncate">
            {contact.name}
          </div>
          <div className="text-sm text-gray-500 truncate">
            {contact.email}
          </div>
        </div>
      </div>
    ),
    skeletonCell: () => (
      <div className="flex items-center min-w-0">
        <div className="flex-shrink-0 w-10 h-10">
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
        <div className="ml-3 min-w-0 flex-1">
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    ),
    enableSorting: true,
  },
  {
    id: 'role',
    header: () => <>ROLE</>,
    width: '180px', // Fixed width for role column
    headerClassName: 'text-left',
    cellClassName: 'text-left',
    cell: (contact) => (
      <div className="text-sm text-gray-900 truncate" title={contact.role}>
        {contact.role}
      </div>
    ),
    skeletonCell: () => (
      <div className="text-sm truncate">
        <Skeleton className="h-4 w-24" />
      </div>
    ),
    enableSorting: true,
  },
  {
    id: 'company',
    header: () => <>COMPANY</>,
    width: '200px', // Fixed width for company column
    headerClassName: 'text-left',
    cellClassName: 'text-left',
    cell: (contact) => (
      <div className="text-sm text-gray-900 truncate" title={contact.company || undefined}>
        {contact.company}
      </div>
    ),
    skeletonCell: () => (
      <div className="text-sm truncate">
        <Skeleton className="h-4 w-28" />
      </div>
    ),
    enableSorting: true,
  },
  {
    id: 'industry',
    header: () => <>INDUSTRY</>,
    width: '180px', // Fixed width for industry column
    headerClassName: 'text-left',
    cellClassName: 'text-left',
    cell: (contact) => (
      <div className="text-sm text-gray-900 truncate" title={contact.industry?.toString()}>
        {contact.industry}
      </div>
    ),
    skeletonCell: () => (
      <div className="text-sm truncate">
        <Skeleton className="h-4 w-20" />
      </div>
    ),
    enableSorting: true,
  },
  {
    id: 'location',
    header: () => <>LOCATION</>,
    width: '180px', // Fixed width for location column
    headerClassName: 'text-left',
    cellClassName: 'text-left',
    cell: (contact) => (
      <div className="text-sm text-gray-900 truncate" title={contact.location}>
        {contact.location}
      </div>
    ),
    skeletonCell: () => (
      <div className="text-sm truncate">
        <Skeleton className="h-4 w-24" />
      </div>
    ),
    enableSorting: true,
  },
]

export function AudienceTable({
  contacts,
  loading,
  selectedContacts,
  onSelectionChange,
  onSelectAll,
  onDeleteSelected,
  onEditSelected,
  onAddToAudienceList,
  areFiltersActive,
  onAddContact,
  isAudienceListView,
  onRemoveFromAudienceList,
  onSort,
  sortField,
  sortDirection,
}: AudienceTableProps) {
  const isAllSelected = contacts.length > 0 && selectedContacts.length === contacts.length
  const numSelected = selectedContacts.length

  const renderSortArrow = (field: string) => {
    if (sortField !== field || !sortDirection) {
      return <ChevronsUpDown className="ml-2 w-4 h-4" />
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-2 w-4 h-4" />
    }
    return <ArrowDown className="ml-2 w-4 h-4" />
  }

  if (!loading && contacts.length === 0) {
    return areFiltersActive ? (
      <EmptyState
        title="No contacts found"
        description="Try adjusting your search or filters."
      />
    ) : (
      <EmptyState
        title="No contacts yet"
        description="Get started by adding your first contact."
        buttonText="Add Contact"
        onButtonClick={onAddContact}
      />
    )
  }

  return (
    <>
      {numSelected > 0 && (
        <div className="px-4 py-3 border-b bg-blue-50/50 min-h-[60px] flex items-center">
          <div className="flex gap-4 justify-between items-center w-full">
            <span className="text-sm font-medium text-blue-900 flex-shrink-0">
              {numSelected} selected
            </span>
            <div className="flex gap-2 items-center flex-shrink-0">
              <Button variant="outline" size="sm" onClick={onAddToAudienceList}>
                Add to List
              </Button>
              {numSelected === 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditSelected(selectedContacts[0])}
                >
                  <Edit className="mr-2 w-4 h-4" />
                  Edit
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={
                  isAudienceListView ? onRemoveFromAudienceList : onDeleteSelected
                }
              >
                <Trash2 className="mr-2 w-4 h-4" />
                {isAudienceListView ? 'Remove from List' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
      <DataTable
        columns={columns}
        data={contacts}
        isLoading={loading}
        onSort={onSort}
        sortField={sortField}
        sortDirection={sortDirection}
        selectedIds={selectedContacts}
        onSelectionChange={onSelectionChange}
        onSelectAll={onSelectAll}
        isAllSelected={
          contacts.length > 0 && selectedContacts.length === contacts.length
        }
        getRowId={(contact) => contact.id}
      />
    </>
  )
}
