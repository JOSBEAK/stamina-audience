import type React from "react"
import type { Contact } from "@stamina-project/types"
import { Trash2, Edit } from "lucide-react"
import { Checkbox } from "./ui/checkbox"
import { Skeleton } from "./ui/skeleton"
import { Button } from "./ui/button"
import { EmptyState } from "./EmptyState"

interface AudienceTableProps {
  contacts: Contact[]
  loading: boolean
  selectedContacts: string[]
  onSelectionChange: (contactId: string) => void
  onSelectAll: () => void
  onDeleteSelected: () => void
  onEditSelected: (contactId: string) => void
  areFiltersActive: boolean
  onAddContact: () => void
}

export function AudienceTable({
  contacts,
  loading,
  selectedContacts,
  onSelectionChange,
  onSelectAll,
  onDeleteSelected,
  onEditSelected,
  areFiltersActive,
  onAddContact,
}: AudienceTableProps) {
  const isAllSelected = contacts.length > 0 && selectedContacts.length === contacts.length
  const numSelected = selectedContacts.length

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
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-audience-table items-center border-b h-16">
        <div className="px-4 py-3">
          <Checkbox checked={isAllSelected} onCheckedChange={onSelectAll} aria-label="Select all" />
        </div>
        {numSelected > 0 ? (
          <div className="px-4 py-3 col-span-5">
            <div className="flex items-center gap-4 w-full justify-between">
              <span className="text-sm font-medium">{numSelected} selected</span>
              <div className="flex items-center gap-2">
                {numSelected === 1 && (
                  <Button variant="outline" size="sm" onClick={() => onEditSelected(selectedContacts[0])}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
                <Button variant="destructive" size="sm" onClick={onDeleteSelected}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 font-medium text-primary">Name</div>
            <div className="px-4 py-3 font-medium text-primary">Role</div>
            <div className="px-4 py-3 font-medium text-primary">Company</div>
            <div className="px-4 py-3 font-medium text-primary">Industry</div>
            <div className="px-4 py-3 font-medium text-primary">Location</div>
          </>
        )}
      </div>
      <div className="divide-y">
        {loading
          ? Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="grid grid-cols-audience-table items-center h-[73px]">
                <div className="px-4">
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
                <div className="px-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                    <div className="ml-4">
                      <div className="h-6 mb-1">
                        <Skeleton className="h-4 w-[140px]" />
                      </div>
                      <div className="h-6">
                        <Skeleton className="h-4 w-[180px]" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4">
                  <Skeleton className="h-4 w-[90px]" />
                </div>
                <div className="px-4">
                  <Skeleton className="h-4 w-[110px]" />
                </div>
                <div className="px-4">
                  <Skeleton className="h-4 w-[100px]" />
                </div>
                <div className="px-4">
                  <Skeleton className="h-4 w-[95px]" />
                </div>
              </div>
            ))
          : contacts.map((contact) => (
              <div key={contact.id} className="grid grid-cols-audience-table items-center h-[73px]">
                <div className="px-4">
                  <Checkbox
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={() => onSelectionChange(contact.id)}
                    aria-label={`Select ${contact.name}`}
                  />
                </div>
                <div className="px-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full" src={contact.avatar || "/placeholder.svg"} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-base font-medium text-gray-900 h-6 leading-6">{contact.name}</div>
                      <div className="text-base text-gray-500 h-6 leading-6">{contact.email}</div>
                    </div>
                  </div>
                </div>
                <div className="px-4 text-base leading-6">{contact.role}</div>
                <div className="px-4 text-base leading-6">{contact.company}</div>
                <div className="px-4 text-base leading-6">{contact.industry}</div>
                <div className="px-4 text-base leading-6">{contact.location}</div>
              </div>
            ))}
      </div>
    </div>
  )
}
