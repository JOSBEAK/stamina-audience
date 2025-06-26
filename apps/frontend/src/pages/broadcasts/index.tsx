export function BroadcastsPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Broadcasts</h1>
      {/* Placeholder for Broadcast Form */}
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold">Create Broadcast</h2>
          <div className="mt-2 p-4 border rounded-md bg-gray-50">
            Broadcast form will go here. (Subject, Content, Select Contacts)
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Past Broadcasts</h2>
          <div className="mt-2 p-4 border rounded-md bg-gray-50">
            List of past broadcasts and their analytics will go here.
          </div>
        </div>
      </div>
    </div>
  );
}

export default BroadcastsPage; 