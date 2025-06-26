import type React from "react"
import type { Contact } from "@stamina-project/types"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "./ui/table"
import { Checkbox } from "./ui/checkbox"
import { Skeleton } from "./ui/skeleton"

interface AudienceTableProps {
  contacts: Contact[]
  loading: boolean
  selectedContacts: string[]
  onSelectionChange: (contactId: string) => void
  onSelectAll: () => void
}

const AudienceTable: React.FC<AudienceTableProps> = ({
  contacts,
  loading,
  selectedContacts,
  onSelectionChange,
  onSelectAll,
}) => {
  const isAllSelected = contacts.length > 0 && selectedContacts.length === contacts.length

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox checked={isAllSelected} onCheckedChange={onSelectAll} aria-label="Select all" />
            </TableHead>
            <TableHead className="min-w-[280px]">Name</TableHead>
            <TableHead className="min-w-[120px]">Role</TableHead>
            <TableHead className="min-w-[140px]">Company</TableHead>
            <TableHead className="min-w-[120px]">Industry</TableHead>
            <TableHead className="min-w-[120px]">Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index} className="h-[73px]">
                  <TableCell className="w-12 py-4">
                    <Skeleton className="h-4 w-4 rounded" />
                  </TableCell>
                  <TableCell className="min-w-[280px] py-4">
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
                  </TableCell>
                  <TableCell className="min-w-[120px] py-4">
                    <Skeleton className="h-4 w-[90px]" />
                  </TableCell>
                  <TableCell className="min-w-[140px] py-4">
                    <Skeleton className="h-4 w-[110px]" />
                  </TableCell>
                  <TableCell className="min-w-[120px] py-4">
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell className="min-w-[120px] py-4">
                    <Skeleton className="h-4 w-[95px]" />
                  </TableCell>
                </TableRow>
              ))
            : contacts.map((contact) => (
                <TableRow key={contact.id} className="h-[73px]">
                  <TableCell className="w-12 py-4">
                    <Checkbox
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => onSelectionChange(contact.id)}
                      aria-label={`Select ${contact.name}`}
                    />
                  </TableCell>
                  <TableCell className="min-w-[280px] py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={contact.avatar || "/placeholder.svg"} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-base font-medium text-gray-900 h-6 leading-6">{contact.name}</div>
                        <div className="text-base text-gray-500 h-6 leading-6">{contact.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[120px] py-4 text-base leading-6">{contact.role}</TableCell>
                  <TableCell className="min-w-[140px] py-4 text-base leading-6">{contact.company}</TableCell>
                  <TableCell className="min-w-[120px] py-4 text-base leading-6">{contact.industry}</TableCell>
                  <TableCell className="min-w-[120px] py-4 text-base leading-6">{contact.location}</TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default AudienceTable
