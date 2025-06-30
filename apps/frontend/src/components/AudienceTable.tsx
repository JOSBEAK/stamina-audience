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
  onAddToSegment: () => void
  areFiltersActive: boolean
  onAddContact: () => void
  isSegmentView: boolean
  onRemoveFromSegment: () => void
  onSort: (field: string) => void
  sortField: string
  sortDirection: 'asc' | 'desc' | null
}

const columns: ColumnDef<Contact>[] = [
  {
    id: 'name',
    header: () => <>NAME</>,
    headerClassName: 'w-2/5',
    cell: (contact) => (
      <div className="flex items-center">
        <div className="flex-shrink-0 h-10 w-10">
          <img
            className="h-10 w-10 rounded-full"
            src={contact.avatar || '/placeholder.svg'}
            alt=""
          />
        </div>
        <div className="ml-4">
          <div className="text-base font-medium text-gray-900 h-6 leading-6">
            {contact.name}
          </div>
          <div className="text-base text-gray-500 h-6 leading-6">
            {contact.email}
          </div>
        </div>
      </div>
    ),
    enableSorting: true,
  },
  {
    id: 'role',
    header: () => <>ROLE</>,
    headerClassName: 'w-1/5',
    cell: (contact) => <>{contact.role}</>,
    enableSorting: true,
  },
  {
    id: 'company',
    header: () => <>COMPANY</>,
    headerClassName: 'w-1/5',
    cell: (contact) => <>{contact.company}</>,
    enableSorting: true,
  },
  {
    id: 'industry',
    header: () => <>INDUSTRY</>,
    headerClassName: 'w-1/5',
    cell: (contact) => <>{contact.industry}</>,
    enableSorting: true,
  },
  {
    id: 'location',
    header: () => <>LOCATION</>,
    headerClassName: 'w-1/5',
    cell: (contact) => <>{contact.location}</>,
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
  onAddToSegment,
  areFiltersActive,
  onAddContact,
  isSegmentView,
  onRemoveFromSegment,
  onSort,
  sortField,
  sortDirection,
}: AudienceTableProps) {
  const isAllSelected = contacts.length > 0 && selectedContacts.length === contacts.length
  const numSelected = selectedContacts.length

  const renderSortArrow = (field: string) => {
    if (sortField !== field || !sortDirection) {
      return <ChevronsUpDown className="ml-2 h-4 w-4" />
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />
    }
    return <ArrowDown className="ml-2 h-4 w-4" />
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
        <div className="px-4 py-3 border-b">
          <div className="flex items-center gap-4 w-full justify-between">
            <span className="text-sm font-medium">{numSelected} selected</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onAddToSegment}>
                Add to Segment
              </Button>
              {numSelected === 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditSelected(selectedContacts[0])}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={
                  isSegmentView ? onRemoveFromSegment : onDeleteSelected
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isSegmentView ? 'Remove from Segment' : 'Delete'}
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
