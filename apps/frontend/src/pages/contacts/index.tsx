import React, { useEffect, useState, useCallback, useRef } from 'react';
import AudienceTable from '@/components/AudienceTable';
import { Plus, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Contact } from '@stamina-project/types';
import AddAudienceModal from '@/components/AddAudienceModal';
import AddManualForm from '@/components/AddManualForm';
import UploadCsvModal from '@/components/UploadCsvModal';
import FieldMapping from '@/components/FieldMapping';
import { getContacts, addContactsBatch } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list', 'add_selection', 'add_manual', 'upload_csv', 'field_mapping'
  
  const [csvData, setCsvData] = useState<any[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  // const [filters, setFilters] = useState({
  //   role: false,
  //   company: false,
  //   industry: false,
  // });
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const fetchContacts = useCallback(
    async (search: string, page: number) => {
      try {
        setLoading(true);
        const { data, total } = await getContacts({
          search,
          page,
          limit,
        });
        setContacts(data);
        setTotalPages(Math.ceil(total / limit));
        setTotalContacts(total);
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchContacts(searchQuery, currentPage);
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, fetchContacts, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleContactAdded = (newContact: Contact) => {
    setContacts((prevContacts) => [newContact, ...prevContacts]);
  };

  const handleDataParsed = (data: any[], headers: string[]) => {
    setCsvData(data);
    setCsvHeaders(headers);
    setView('field_mapping');
  };

  const handleMappingConfirm = async (mappedData: Partial<Contact>[]) => {
    try {
      const newContacts = await addContactsBatch(mappedData);
      setContacts(prev => [...newContacts, ...prev]);
      setView('list');

    } catch (error) {
      console.error('Batch upload failed:', error);
      // Handle error display to user
    }
  }

  const handleSelectionChange = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  return (
    <div className="p-8 border border-border rounded-lg">
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6 text-gray-500" />
          <h1 className="text-xl font-semibold">Audience</h1>
        </div>
        <Button onClick={() => setView('add_selection')}>
          <Plus size={18} className="mr-2" />
          Add People
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold">Audience List</h1>
          <span className="text-sm text-gray-500 ml-2 border border-gray-200 px-2 py-1 rounded-full">{totalContacts} people</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Input
              ref={searchInputRef}
              placeholder="Search..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 border rounded-md p-1">
              ⌘K
            </div>
          </div>
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="px-3">
                <ListFilter size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filters.role}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, role: !!checked }))}
              >
                Role
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.company}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, company: !!checked }))}
              >
                Company
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.industry}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, industry: !!checked }))}
              >
                Industry
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <AudienceTable 
          contacts={contacts} 
          loading={loading}
          selectedContacts={selectedContacts}
          onSelectionChange={handleSelectionChange}
          onSelectAll={handleSelectAll}
        />
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <span className="text-sm text-gray-500">
          Page {totalContacts > 0 ? currentPage : 0} of {totalPages}
        </span>
        <Button
          variant="default"
          onClick={handleNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {view === 'add_selection' && (
        <AddAudienceModal
          onClose={() => setView('list')}
          onAddManually={() => setView('add_manual')}
          onUploadCsv={() => setView('upload_csv')}
        />
      )}

      {view === 'add_manual' && (
        <AddManualForm
          onClose={() => setView('list')}
          onContactAdd={handleContactAdded}
        />
      )}

      {view === 'upload_csv' && (
        <UploadCsvModal
          onClose={() => setView('list')}
          onDataParsed={handleDataParsed}
        />
      )}

      {view === 'field_mapping' && (
        <FieldMapping
          onClose={() => setView('list')}
          onConfirm={handleMappingConfirm}
          csvData={csvData}
          csvHeaders={csvHeaders}
        />
      )}
    </div>
  );
};

export default ContactsPage; 